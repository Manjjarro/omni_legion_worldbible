/**
 * Lightweight vault health check runner.
 * Reports missing links, duplicate IDs, unresolved placeholder markers.
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.isFile() && abs.endsWith('.md')) out.push(abs);
  }
  return out;
}

function read(rel) {
  return fs.readFileSync(rel, 'utf8');
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return null;
  return text.slice(4, end);
}

function yamlListScalar(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(yamlListScalar);
  return [String(value)];
}

function main() {
  const vaultRoot = path.resolve(__dirname, '..', '..');
  const files = walk(vaultRoot);

  const ids = new Map();
  const aliases = new Map();
  const stems = new Map();
  const issues = [];

  // Build node lookup table from frontmatter
  for (const file of files) {
    const text = read(file);
    const rel = path.relative(vaultRoot, file).replace(/\\/g, '/');
    const fm = parseFrontmatter(text);

    const stem = path.basename(rel, '.md');
    stems.set(stem, rel);

    if (!fm) continue;

    const idMatch = fm.match(/^id:\s*(.+)$/m);
    if (idMatch) {
      const id = idMatch[1].trim().replace(/^["']|["']$/g, '');
      if (ids.has(id)) issues.push(`DUPLICATE_ID ${id} (${ids.get(id)} and ${rel})`);
      else ids.set(id, rel);
    }

    const aliasMatch = fm.match(/^aliases:\s*(.*)$/m);
    if (aliasMatch) {
      const raw = aliasMatch[1].trim();
      if (raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw.replace(/'/g, '"'));
          for (const a of yamlListScalar(parsed)) aliases.set(String(a), rel);
        } catch {
          // ignore malformed inline alias syntax
        }
      }
    }

    // Multi-line aliases
    const aliasBlock = fm.match(/^aliases:\s*\n((?:\s*-\s*.*\n)+)/m);
    if (aliasBlock) {
      for (const m of aliasBlock[1].matchAll(/-\s*(.+)$/gm)) {
        aliases.set(m[1].trim().replace(/^["']|["']$/g, ''), rel);
      }
    }
  }

  function targetExists(target) {
    if (!target) return true;
    const clean = target.trim();
    if (!clean || clean.includes('<%') || /\$\{/.test(clean) || /XXX$/.test(clean)) return true;

    const candidates = [
      clean,
      clean.replace(/\.md$/i, ''),
      path.basename(clean, '.md'),
      stemLookup(clean),
      ids.get(clean),
      aliases.get(clean),
    ].filter(Boolean);

    return candidates.some((c) => {
      if (!c) return false;
      const normalized = String(c).replace(/\\/g, '/');
      const abs = path.join(vaultRoot, normalized);
      return fs.existsSync(abs)
        || fs.existsSync(abs + '.md')
        || files.some(f => path.relative(vaultRoot, f).replace(/\\/g, '/') === normalized || path.basename(f, '.md') === normalized);
    });
  }

  function stemLookup(clean) {
    if (stems.has(clean)) return stems.get(clean);
    for (const [stem, rel] of stems.entries()) {
      if (stem === clean) return rel;
    }
    return null;
  }

  for (const file of files) {
    const text = read(file);
    const rel = path.relative(vaultRoot, file).replace(/\\/g, '/');

    // Skip template files when checking wikilinks with placeholders.
    const isTemplate = rel.startsWith('Templates/');

    for (const marker of ['SCENE_XXX', 'SHOT_XXX', 'IMG_RUN_XXX', 'REVIEW_XXX']) {
      if (text.includes(marker) && !isTemplate) {
        issues.push(`PLACEHOLDER ${marker} in ${rel}`);
      }
    }

    for (const m of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const target = m[1].split('|')[0].trim();
      if (!target || target.includes('<%') || /\$\{/.test(target) || /XXX$/.test(target)) continue;
      if (isTemplate) continue; // template links are intentionally unresolved placeholders
      if (!targetExists(target)) issues.push(`BROKEN_LINK ${target} in ${rel}`);
    }
  }

  const report = {
    checked_files: files.length,
    issue_count: issues.length,
    issues,
  };

  const outDir = path.join(vaultRoot, '03_SYSTEM', 'generated');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'health_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outPath}`);
  if (issues.length) process.exit(1);
}

if (require.main === module) {
  main();
}
