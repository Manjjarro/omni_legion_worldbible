const obsidianModule = require("obsidian");
const { Plugin, PluginSettingTab, Setting, Notice } = obsidianModule;

// 所有点击动作统一使用这套选项集（openMode）：
//   'reuse'         - 复用"上次那个" Web Viewer pane，在里面切换 URL
//   'new-tab'       - 在已有 Web Viewer 旁边新开一个 tab（没有锚点时自动回退为 new-split）
//   'new-split'     - 新建分屏 Web Viewer
//   'browser'       - 在默认浏览器打开
//   'follow-setting' - 仅用于「普通点击行为」：跟随 Web Viewer 的外链开关
//   'toggle-default' - 仅用于「Cmd/Ctrl 点击行为」：反转「普通点击」的最终目标
//   'disabled'      - 仅用于「Shift / Cmd/Ctrl 点击行为」：不拦截，按"普通点击"处理
const OPEN_MODE_LABELS = {
  "reuse": "复用当前 Web Viewer（在原 pane 换 URL）",
  "new-tab": "新开 Web Viewer tab（不复用，不分屏）",
  "new-split": "新建分屏 Web Viewer",
  "browser": "在默认浏览器打开",
};

const DEFAULT_SETTINGS = {
  // 普通点击：默认跟随 Web Viewer 的外链设置
  defaultAction: "follow-setting",
  // Cmd/Ctrl：默认反转"普通点击"得到的最终目标
  modifierAction: "toggle-default",
  // Shift：默认"新开 tab"（不替换当前页面）
  shiftAction: "new-tab",

  splitDirection: "vertical",
  focusPane: true,
  fallbackToBrowserWhenWebViewerUnavailable: true,
  detectionFallback: "browser",
  debugLog: false,
};

const VIEW_TYPE_WEBVIEWER = "webviewer";
const INTERNAL_WEBVIEWER_PLUGIN_ID = "webviewer";

module.exports = class SplitWebViewerModifierPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SplitWebViewerModifierSettingTab(this.app, this));

    // 当前鼠标按键状态，用于从 window.open 回溯修饰键信息
    this._lastPointerEvent = null;

    // 最近一次由本插件打开的 Web Viewer leaf，供复用逻辑使用
    this._lastWebViewerLeaf = null;

    this._installDomInterceptor();
    this._installWindowOpenPatch();
    this._installShellOpenExternalPatch();
  }

  onunload() {
    // Plugin.register 已经注册了恢复函数，这里无需重复处理
  }

  // ---------------- 设置持久化 ----------------

  async loadSettings() {
    const raw = (await this.loadData()) || {};
    this._migrateSettings(raw);
    this.settings = Object.assign({}, DEFAULT_SETTINGS, raw);
  }

  // 旧版设置值 → 新版统一 openMode 的映射
  _migrateSettings(raw) {
    if (!raw || typeof raw !== "object") return;

    // defaultAction 旧值迁移
    const defaultMap = {
      "follow-webviewer-setting": "follow-setting",
      "webviewer": "reuse",
    };
    if (raw.defaultAction && defaultMap[raw.defaultAction]) {
      raw.defaultAction = defaultMap[raw.defaultAction];
    }

    // modifierAction 旧值迁移
    const modMap = {
      "toggle-default-target": "toggle-default",
      "webviewer": "reuse",
    };
    if (raw.modifierAction && modMap[raw.modifierAction]) {
      raw.modifierAction = modMap[raw.modifierAction];
    }

    // shiftAction 旧值迁移
    const shiftMap = {
      "new-tab-webviewer": "new-tab",
      "new-split": "new-split",  // 不变
    };
    if (raw.shiftAction && shiftMap[raw.shiftAction]) {
      raw.shiftAction = shiftMap[raw.shiftAction];
    }

    // 移除已废弃的 reusePolicy 字段（逻辑已合并到三个 action 里）
    if (raw.reusePolicy !== undefined) {
      delete raw.reusePolicy;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  _debug(...args) {
    if (this.settings && this.settings.debugLog) {
      console.log("[split-web-viewer-modifier]", ...args);
    }
  }

  // ---------------- 拦截层 1：DOM mousedown / click ----------------

  _installDomInterceptor() {
    const pointerTracker = (event) => {
      if (event instanceof MouseEvent) {
        this._lastPointerEvent = {
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          button: event.button,
          timestamp: Date.now(),
        };
      }
    };

    const mouseHandler = (event) => {
      try {
        this._handleDomMouseEvent(event);
      } catch (error) {
        console.error("[split-web-viewer-modifier] mouse handler error", error);
      }
    };

    document.addEventListener("mousedown", pointerTracker, true);
    document.addEventListener("mouseup", pointerTracker, true);
    document.addEventListener("click", mouseHandler, true);
    document.addEventListener("auxclick", mouseHandler, true);

    this.register(() => {
      document.removeEventListener("mousedown", pointerTracker, true);
      document.removeEventListener("mouseup", pointerTracker, true);
      document.removeEventListener("click", mouseHandler, true);
      document.removeEventListener("auxclick", mouseHandler, true);
    });
  }

  _handleDomMouseEvent(event) {
    if (!(event instanceof MouseEvent)) return;
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;

    const anchor = this._findAnchor(event.target);
    if (!anchor) return;

    const url = this._extractExternalUrl(anchor);
    if (!url) return;

    const action = this._resolveAction(event);
    if (!action) return;

    this._debug("DOM click intercepted", { url, action });

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    this._performAction(action, url);
  }

  _findAnchor(target) {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest("a[href]");
  }

  // ---------------- 拦截层 2：window.open ----------------

  _installWindowOpenPatch() {
    const originalOpen = window.open;
    if (typeof originalOpen !== "function") return;
    if (originalOpen.__splitWebViewerModifierPatched) return;

    const plugin = this;

    const patched = function (url, ...rest) {
      try {
        const normalized = plugin._normalizeExternalUrl(url);
        if (normalized) {
          const syntheticEvent = plugin._buildSyntheticEventFromPointer();
          const action = plugin._resolveAction(syntheticEvent);
          if (action) {
            plugin._debug("window.open intercepted", { url: normalized, action });
            plugin._performAction(action, normalized);
            // 返回 null 表示"窗口已被阻止"，调用方一般会兼容
            return null;
          }
        }
      } catch (error) {
        console.error("[split-web-viewer-modifier] window.open patch error", error);
      }
      return originalOpen.call(this, url, ...rest);
    };

    patched.__splitWebViewerModifierPatched = true;
    patched.__original = originalOpen;
    window.open = patched;

    this.register(() => {
      if (window.open === patched) {
        window.open = originalOpen;
      }
    });
  }

  // ---------------- 拦截层 3：Electron shell.openExternal ----------------

  _installShellOpenExternalPatch() {
    let shell = null;
    try {
      // Obsidian 桌面端内部会通过 require("electron") 拿到 remote 的 shell
      const electron = require("electron");
      shell = electron && (electron.shell || (electron.remote && electron.remote.shell));
    } catch (error) {
      // 可能是移动端或非 Electron 运行环境
      return;
    }

    if (!shell || typeof shell.openExternal !== "function") return;
    if (shell.openExternal.__splitWebViewerModifierPatched) return;

    const plugin = this;
    const original = shell.openExternal.bind(shell);

    const patched = function (url, ...rest) {
      try {
        const normalized = plugin._normalizeExternalUrl(url);
        if (normalized) {
          const syntheticEvent = plugin._buildSyntheticEventFromPointer();
          const action = plugin._resolveAction(syntheticEvent);
          if (action) {
            plugin._debug("shell.openExternal intercepted", { url: normalized, action });
            if (action.target === "webviewer") {
              plugin._performAction(action, normalized);
              return Promise.resolve();
            }
            // target === 'browser'：直接透传给原 shell.openExternal，不再二次拦截
            return original(url, ...rest);
          }
        }
      } catch (error) {
        console.error("[split-web-viewer-modifier] shell.openExternal patch error", error);
      }
      return original(url, ...rest);
    };

    patched.__splitWebViewerModifierPatched = true;
    patched.__original = original;
    shell.openExternal = patched;

    this.register(() => {
      if (shell.openExternal === patched) {
        shell.openExternal = original;
      }
    });
  }

  _buildSyntheticEventFromPointer() {
    const recent = this._lastPointerEvent;
    // 只有最近 1.5s 内的鼠标事件才视为"本次点击相关"
    if (recent && Date.now() - recent.timestamp < 1500) {
      return {
        metaKey: recent.metaKey,
        ctrlKey: recent.ctrlKey,
        shiftKey: recent.shiftKey,
        altKey: recent.altKey,
        button: recent.button,
      };
    }
    return { metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, button: 0 };
  }

  // ---------------- URL / 行为解析 ----------------

  _extractExternalUrl(anchor) {
    const href = anchor.getAttribute("href") || "";
    return this._normalizeExternalUrl(href);
  }

  _normalizeExternalUrl(raw) {
    if (typeof raw !== "string" || !raw) return null;
    try {
      const url = new URL(raw);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString();
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  _resolveAction(event) {
    // 1) 先算出"普通点击"会走到哪里（作为 toggle-default 的基准）
    const baseAction = this._resolveBaseAction();

    if (!event) return baseAction;

    // 2) Shift 优先级最高
    if (event.shiftKey) {
      const shiftAction = this._resolveModifierAction(this.settings.shiftAction, baseAction);
      if (shiftAction) return shiftAction;
    }

    // 3) Cmd/Ctrl
    if (this._isCtrlLikePressed(event)) {
      const modAction = this._resolveModifierAction(this.settings.modifierAction, baseAction);
      if (modAction) return modAction;
    }

    return baseAction;
  }

  // 把一个"设置项值"解析成最终 action；disabled 表示"不拦截，退回普通点击行为"
  _resolveModifierAction(settingValue, baseAction) {
    if (!settingValue || settingValue === "disabled") return null; // 让上层回退到 baseAction
    if (settingValue === "toggle-default") {
      return this._toggleTarget(baseAction);
    }
    return this._normalizeOpenMode(settingValue);
  }

  // 普通点击：支持 follow-setting / 或直接一个 openMode
  _resolveBaseAction() {
    const v = this.settings.defaultAction;
    if (v === "follow-setting") {
      return this._getCoreExternalLinkAction();
    }
    return this._normalizeOpenMode(v);
  }

  // 把裸 openMode 字符串转成 { target, mode }
  _normalizeOpenMode(value) {
    switch (value) {
      case "browser":
        return { target: "browser", mode: "browser" };
      case "new-tab":
        return { target: "webviewer", mode: "new-tab" };
      case "new-split":
        return { target: "webviewer", mode: "new-split" };
      case "reuse":
      default:
        return { target: "webviewer", mode: "reuse" };
    }
  }

  // 反转"目标"：webviewer <-> browser；openMode 方面保留原模式（反到 browser 时自然就是 browser）
  _toggleTarget(baseAction) {
    if (!baseAction) return { target: "browser", mode: "browser" };
    if (baseAction.target === "browser") {
      // 反到 Web Viewer：用 reuse 模式（最符合"就地切换"直觉）
      return { target: "webviewer", mode: "reuse" };
    }
    // 反到浏览器
    return { target: "browser", mode: "browser" };
  }

  _isCtrlLikePressed(event) {
    return Boolean(event.metaKey || event.ctrlKey);
  }

  _getCoreExternalLinkAction() {
    return this._detectShouldOpenExternalLinksInWebViewer()
      ? { target: "webviewer", mode: "reuse" }
      : { target: "browser", mode: "browser" };
  }

  _detectShouldOpenExternalLinksInWebViewer() {
    const instance = this._getWebViewerInstance();
    if (!instance) {
      return this.settings.detectionFallback === "webviewer";
    }

    const exactMatch = this._findKnownExternalLinkFlag(instance);
    if (typeof exactMatch === "boolean") return exactMatch;

    const heuristicMatch = this._findHeuristicExternalLinkFlag(instance);
    if (typeof heuristicMatch === "boolean") return heuristicMatch;

    return this.settings.detectionFallback === "webviewer";
  }

  _getWebViewerInstance() {
    const internalPlugins = this.app.internalPlugins;
    if (!internalPlugins) return null;

    if (typeof internalPlugins.getEnabledPluginById === "function") {
      const enabled = internalPlugins.getEnabledPluginById(INTERNAL_WEBVIEWER_PLUGIN_ID);
      if (enabled) return enabled;
    }

    if (typeof internalPlugins.getPluginById === "function") {
      const plugin = internalPlugins.getPluginById(INTERNAL_WEBVIEWER_PLUGIN_ID);
      if (plugin && plugin.instance) return plugin.instance;
    }

    return null;
  }

  _findKnownExternalLinkFlag(instance) {
    const exactKeys = [
      "openExternalLinks",
      "openExternalLink",
      "openHyperlinks",
      "openHyperlink",
      "shouldOpenExternalLinks",
      "shouldOpenHyperlinks",
      "enableExternalLinks",
      "enableHyperlinks",
    ];
    const buckets = [instance, instance.options, instance.settings, instance.data];
    for (const bucket of buckets) {
      if (!bucket || typeof bucket !== "object") continue;
      for (const key of exactKeys) {
        if (typeof bucket[key] === "boolean") return bucket[key];
      }
    }
    return null;
  }

  _findHeuristicExternalLinkFlag(instance) {
    const visited = new WeakSet();
    const sources = [instance.options, instance.settings, instance.data, instance];
    for (const source of sources) {
      const result = this._walkForExternalLinkBoolean(source, visited, 0);
      if (typeof result === "boolean") return result;
    }
    return null;
  }

  _walkForExternalLinkBoolean(value, visited, depth) {
    if (!value || typeof value !== "object") return null;
    if (visited.has(value)) return null;
    if (depth > 3) return null;
    visited.add(value);

    for (const [key, child] of Object.entries(value)) {
      if (typeof child === "boolean" && this._looksLikeExternalLinkSwitch(key)) {
        return child;
      }
    }
    for (const child of Object.values(value)) {
      const result = this._walkForExternalLinkBoolean(child, visited, depth + 1);
      if (typeof result === "boolean") return result;
    }
    return null;
  }

  _looksLikeExternalLinkSwitch(key) {
    return /(?:open|enable).*(?:external|hyper(?:link)?)/i.test(key)
      || /(?:external|hyper(?:link)?).*(?:open|enable)/i.test(key);
  }

  // ---------------- 实际执行 ----------------

  _performAction(action, url) {
    if (!action) return;
    if (action.target === "browser") {
      this._openInBrowser(url);
      return;
    }
    this._openInWebViewer(url, { mode: action.mode || "reuse" });
  }

  _openInBrowser(url) {
    try {
      // 优先用 Electron shell 的原始引用；如果没有，就退回 obsidian.openExternal / window.open.__original
      const original = this._getOriginalOpenExternalHandlers();
      if (original.shellOpenExternal) {
        original.shellOpenExternal(url);
        return;
      }
      if (typeof obsidianModule.openExternal === "function") {
        obsidianModule.openExternal(url);
        return;
      }
      if (original.windowOpen) {
        original.windowOpen(url, "_blank");
        return;
      }
      window.open(url, "_blank");
    } catch (error) {
      console.error("[split-web-viewer-modifier] Failed to open in browser", error);
      new Notice("打开默认浏览器失败，请检查系统默认浏览器设置。");
    }
  }

  _getOriginalOpenExternalHandlers() {
    let shellOpenExternal = null;
    try {
      const electron = require("electron");
      const shell = electron && (electron.shell || (electron.remote && electron.remote.shell));
      if (shell && typeof shell.openExternal === "function") {
        shellOpenExternal = shell.openExternal.__original
          ? shell.openExternal.__original
          : shell.openExternal.bind(shell);
      }
    } catch (error) {
      // ignore
    }

    let windowOpen = null;
    if (typeof window.open === "function") {
      windowOpen = window.open.__original ? window.open.__original.bind(window) : null;
    }

    return { shellOpenExternal, windowOpen };
  }

  async _openInWebViewer(url, options = {}) {
    const mode = options.mode || "reuse"; // "reuse" | "new-tab" | "new-split"

    if (!this._isWebViewerAvailable()) {
      const message = "未检测到已启用的 Web Viewer 核心插件。";
      if (this.settings.fallbackToBrowserWhenWebViewerUnavailable) {
        new Notice(`${message} 已改为用默认浏览器打开。`);
        this._openInBrowser(url);
        return;
      }
      new Notice(`${message} 请先在 Core plugins 中启用它。`);
      return;
    }

    try {
      const leaf = this._acquireWebViewerLeaf(mode);
      await leaf.setViewState({
        type: VIEW_TYPE_WEBVIEWER,
        active: this.settings.focusPane,
        state: {
          url,
          navigate: true,
        },
      });

      // 只有 reuse 模式才更新 lastLeaf；new-tab / new-split 不改复用锚点
      if (mode === "reuse") {
        this._lastWebViewerLeaf = leaf;
      } else if (!this._pickReusableLeaf([this._lastWebViewerLeaf])) {
        // 如果之前没有锚点（第一次打开），就让这个成为新的锚点
        this._lastWebViewerLeaf = leaf;
      }

      if (this.settings.focusPane && typeof this.app.workspace.revealLeaf === "function") {
        this.app.workspace.revealLeaf(leaf);
      }
    } catch (error) {
      console.error("[split-web-viewer-modifier] Failed to open in Web Viewer", error);
      if (this.settings.fallbackToBrowserWhenWebViewerUnavailable) {
        new Notice("在 Web Viewer 中打开失败，已回退到默认浏览器。");
        this._openInBrowser(url);
        return;
      }
      new Notice("在 Web Viewer 中打开失败，请打开开发者工具查看错误。");
    }
  }

  _acquireWebViewerLeaf(mode = "reuse") {
    // reuse：优先复用"上次那个"；丢了就找已有 Web Viewer；都没有才新建分屏
    if (mode === "reuse") {
      const reused = this._pickReusableLeaf([this._lastWebViewerLeaf]);
      if (reused) {
        this._debug("reuse: reusing last web viewer leaf");
        return reused;
      }
      // 锚点丢失（比如重启后），尝试复用工作区里已有的 Web Viewer
      const existing = this._getExistingWebViewerLeaves();
      if (existing.length > 0) {
        this._debug("reuse: anchor lost, reusing existing web viewer leaf");
        this._lastWebViewerLeaf = existing[0];
        return existing[0];
      }
      this._debug("reuse: no web viewer found, creating new split");
      return this.app.workspace.getLeaf("split", this.settings.splitDirection);
    }

    // new-tab：在锚点 Web Viewer 旁边新开 tab
    if (mode === "new-tab") {
      const anchor = this._pickAnchorLeaf();
      if (anchor) {
        const sibling = this._createSiblingTabLeaf(anchor);
        if (sibling) {
          this._debug("new-tab: opened next to anchor web viewer leaf");
          return sibling;
        }
      }
      this._debug("new-tab: no anchor, fall back to split");
      return this.app.workspace.getLeaf("split", this.settings.splitDirection);
    }

    // new-split：强制新建分屏
    this._debug("new-split: creating new split web viewer leaf");
    return this.app.workspace.getLeaf("split", this.settings.splitDirection);
  }

  _pickAnchorLeaf() {
    // 优先用"上次 Web Viewer 所在 pane"作为锚点；否则用工作区任意一个 Web Viewer
    const lastAlive = this._pickReusableLeaf([this._lastWebViewerLeaf]);
    if (lastAlive) return lastAlive;
    const existing = this._getExistingWebViewerLeaves();
    return existing.length > 0 ? existing[0] : null;
  }

  _createSiblingTabLeaf(anchor) {
    if (!anchor) return null;
    try {
      // 优先使用官方推荐 API：在指定 leaf 所在的父容器里新建 tab
      const workspace = this.app.workspace;
      if (typeof workspace.createLeafInParent === "function" && anchor.parent) {
        const parent = anchor.parent;
        const index = typeof parent.children?.indexOf === "function"
          ? parent.children.indexOf(anchor) + 1
          : -1;
        return workspace.createLeafInParent(parent, index >= 0 ? index : parent.children?.length ?? 0);
      }

      // 兜底：先激活锚点（让 getLeaf('tab') 落到同一个 tab group），再开 tab
      workspace.setActiveLeaf(anchor, false, false);
      return workspace.getLeaf("tab");
    } catch (error) {
      console.error("[split-web-viewer-modifier] createSiblingTabLeaf failed", error);
      return null;
    }
  }

  _getExistingWebViewerLeaves() {
    try {
      return this.app.workspace.getLeavesOfType(VIEW_TYPE_WEBVIEWER) || [];
    } catch (error) {
      return [];
    }
  }

  _pickReusableLeaf(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) return null;
    const alive = this._getExistingWebViewerLeaves();
    const aliveSet = new Set(alive);
    for (const leaf of candidates) {
      if (leaf && aliveSet.has(leaf)) return leaf;
    }
    return null;
  }

  _isWebViewerAvailable() {
    return Boolean(this._getWebViewerInstance());
  }
};

class SplitWebViewerModifierSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Split Web Viewer Modifier" });
    containerEl.createEl("p", {
      text: "为普通点击、Shift 点击、Cmd/Ctrl 点击分别配置打开方式。选项集统一，自由组合。",
    });

    const addOpenModeOptions = (dropdown) => {
      dropdown.addOption("reuse", OPEN_MODE_LABELS["reuse"]);
      dropdown.addOption("new-tab", OPEN_MODE_LABELS["new-tab"]);
      dropdown.addOption("new-split", OPEN_MODE_LABELS["new-split"]);
      dropdown.addOption("browser", OPEN_MODE_LABELS["browser"]);
    };

    new Setting(containerEl)
      .setName("普通点击行为")
      .setDesc("无修饰键直接点击外链时的打开方式。可以选择跟随 Web Viewer 的外链开关，也可以直接指定一种方式。")
      .addDropdown((dropdown) => {
        dropdown.addOption("follow-setting", "跟随 Web Viewer 的外链设置");
        addOpenModeOptions(dropdown);
        dropdown
          .setValue(this.plugin.settings.defaultAction)
          .onChange(async (value) => {
            this.plugin.settings.defaultAction = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Shift 点击行为")
      .setDesc("按住 Shift 点击时使用的打开方式。推荐“新开 Web Viewer tab”。")
      .addDropdown((dropdown) => {
        addOpenModeOptions(dropdown);
        dropdown.addOption("disabled", "不拦截（跟随普通点击）");
        dropdown
          .setValue(this.plugin.settings.shiftAction)
          .onChange(async (value) => {
            this.plugin.settings.shiftAction = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Cmd/Ctrl 点击行为")
      .setDesc("按住 Cmd（macOS）或 Ctrl（Windows/Linux）点击时的打开方式。推荐“反转默认目标”：默认进 Web Viewer 时就进浏览器，反之亦然。")
      .addDropdown((dropdown) => {
        dropdown.addOption("toggle-default", "反转默认目标（Web Viewer ↔ 浏览器）");
        addOpenModeOptions(dropdown);
        dropdown.addOption("disabled", "不拦截（跟随普通点击）");
        dropdown
          .setValue(this.plugin.settings.modifierAction)
          .onChange(async (value) => {
            this.plugin.settings.modifierAction = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("分屏方向")
      .setDesc("vertical 会在当前 pane 右侧拆分，horizontal 会在下方拆分。仅在需要新建分屏时生效。")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("vertical", "vertical（右侧分屏）")
          .addOption("horizontal", "horizontal（下方分屏）")
          .setValue(this.plugin.settings.splitDirection)
          .onChange(async (value) => {
            this.plugin.settings.splitDirection = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("打开后聚焦新分屏")
      .setDesc("开启后，网页打开后会自动切换到 Web Viewer pane。")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.focusPane)
          .onChange(async (value) => {
            this.plugin.settings.focusPane = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("无法使用 Web Viewer 时回退到浏览器")
      .setDesc("当 Web Viewer 未启用或打开失败时，自动用系统默认浏览器打开。")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.fallbackToBrowserWhenWebViewerUnavailable)
          .onChange(async (value) => {
            this.plugin.settings.fallbackToBrowserWhenWebViewerUnavailable = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("自动检测失败时的回退行为")
      .setDesc("仅在你把“普通点击行为”设为“跟随 Web Viewer 的外链设置”，且插件没能识别 Web Viewer 内部开关时生效。")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("browser", "按“未开启外链 Web Viewer”处理（走默认浏览器）")
          .addOption("webviewer", "按“已开启外链 Web Viewer”处理（走 Web Viewer）")
          .setValue(this.plugin.settings.detectionFallback)
          .onChange(async (value) => {
            this.plugin.settings.detectionFallback = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("调试日志")
      .setDesc("开启后在开发者工具 Console 打印拦截日志，排查链接没走 Web Viewer 时很有用。")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.debugLog)
          .onChange(async (value) => {
            this.plugin.settings.debugLog = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("p", {
      text: "提示：如果你把 Web Viewer 的“打开外部链接”关掉，并且这里的 Cmd/Ctrl 点击行为设为“反转默认目标”，那 Cmd/Ctrl + 点击就会在 Web Viewer 中打开。",
      cls: "setting-item-description",
    });
  }
}

/* nosourcemap */