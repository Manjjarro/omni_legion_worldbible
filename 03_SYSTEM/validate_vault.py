#!/usr/bin/env python3
"""Grimverse vault validator.

Checks:
- frontmatter link normalization
- scene -> episode links
- shot -> scene links
- active character state presence
- status schema compliance
- asset file existence for completed shots
- manifest consistency
"""

from __future__ import annotations
from pathlib import Path
import re, sys, json, hashlib
import yaml

STATUS = {"Draft","Planned","Prompted","Generating","Review","Winner","Approved","Complete","Failed","Pending","Canonical","Review Needed"}
LIST_FIELDS = {"aliases","characters","shots","linked_scenes","linked_shots","linked_characters","participants","locations","factions","consequences","triggers","forbids","linked_state","run_reviewed"}

def split_frontmatter(text: str):
    m = re.match(r'^(---\n.*?\n---\n)(.*)$', text, re.S)
    return (m.group(1), m.group(2)) if m else (None, text)

def strip_link(s):
    if isinstance(s, str):
        m = re.fullmatch(r'\[\[([^\[\]]+)\]\]', s.strip())
        return m.group(1) if m else s
    return s

def normalize(v):
    if isinstance(v, str):
        return strip_link(v)
    if isinstance(v, list):
        return [normalize(i) for i in v]
    if isinstance(v, dict):
        return {k: normalize(val) for k, val in v.items()}
    return v

def find_root(start: Path) -> Path:
    for p in [start, *start.parents]:
        if (p / "MANIFEST.json").exists():
            return p
    raise SystemExit("Could not locate vault root (MANIFEST.json not found).")

def load_fm(p: Path):
    txt = p.read_text(encoding="utf-8", errors="ignore")
    fm_text, body = split_frontmatter(txt)
    if fm_text is None:
        return None, body
    raw = fm_text[len('---\n'):-len('---\n')]
    try:
        fm = yaml.safe_load(raw) or {}
    except Exception as e:
        return {"__parse_error__": str(e)}, body
    return fm, body

def key_variants(val):
    if val is None:
        return []
    val = strip_link(val)
    if isinstance(val, list):
        out = []
        for x in val:
            out.extend(key_variants(x))
        return list(dict.fromkeys(out))
    s = str(val)
    return list(dict.fromkeys([s, Path(s).stem, s.replace(".md","")]))

def resolve_index(pages):
    idx = {}
    for rel, fm in pages.items():
        if not isinstance(fm, dict):
            continue
        stem = Path(rel).stem
        keys = {stem, rel, fm.get("id")}
        for a in fm.get("aliases", []) if isinstance(fm.get("aliases"), list) else []:
            keys.add(strip_link(a))
        for k in list(keys):
            if k:
                idx[str(k)] = rel
    return idx

def has_file(root: Path, ref: str) -> bool:
    ref = strip_link(ref)
    if not ref:
        return False
    p = (root / ref)
    return p.exists() or (root / f"{ref}.md").exists() or (root / ref.replace("[[","").replace("]]","")).exists()

def main():
    root = find_root(Path(__file__).resolve().parent)
    md_files = [p for p in root.rglob("*.md")]
    pages = {}
    errors = []
    warnings = []
    # load all frontmatter
    for p in md_files:
        fm, body = load_fm(p)
        rel = p.relative_to(root).as_posix()
        if fm is None:
            continue
        if "__parse_error__" in fm:
            errors.append(f"{rel}: frontmatter parse error: {fm['__parse_error__']}")
            continue
        pages[rel] = normalize(fm)

    idx = resolve_index(pages)

    def resolve(ref):
        if ref is None:
            return None
        if isinstance(ref, list):
            if len(ref) == 1:
                return resolve(ref[0])
            return [resolve(x) for x in ref]
        s = strip_link(ref)
        variants = [s, Path(str(s)).stem, str(s).replace(".md","")]
        for k in variants:
            if k in idx:
                return idx[k]
        # direct path?
        if (root / s).exists() or (root / f"{s}.md").exists():
            return s
        return None

    # validate scenes
    scenes = [(rel,fm) for rel,fm in pages.items() if rel.startswith("01_NODES/scenes/")]
    shots = [(rel,fm) for rel,fm in pages.items() if rel.startswith("01_NODES/shots/")]
    chars = [(rel,fm) for rel,fm in pages.items() if rel.startswith("01_NODES/characters/")]
    states = [(rel,fm) for rel,fm in pages.items() if rel.startswith("01_NODES/state/")]
    events = [(rel,fm) for rel,fm in pages.items() if rel.startswith("01_NODES/events/")]

    # scene->episode
    for rel,fm in scenes:
        ep = resolve(fm.get("episode"))
        if not ep:
            errors.append(f"{rel}: broken or missing episode link")
        if not fm.get("shots"):
            errors.append(f"{rel}: missing shots list")
        if fm.get("status") and fm["status"] not in STATUS:
            errors.append(f"{rel}: invalid status {fm['status']}")

    # shot->scene and asset refs
    for rel,fm in shots:
        sc = resolve(fm.get("scene"))
        if not sc:
            errors.append(f"{rel}: broken or missing scene link")
        if not fm.get("characters"):
            warnings.append(f"{rel}: no characters listed")
        if fm.get("status") and fm["status"] not in STATUS:
            errors.append(f"{rel}: invalid status {fm['status']}")
        completed = str(fm.get("status","")) in {"Winner","Approved","Complete"}
        if completed:
            for field in ("image_source","video_source"):
                ref = fm.get(field)
                if not ref:
                    errors.append(f"{rel}: completed shot missing {field}")
                elif not has_file(root, strip_link(ref)):
                    errors.append(f"{rel}: {field} does not exist -> {ref}")

    # character state existence for characters referenced in shots/scenes
    state_char_refs = set()
    for rel,fm in states:
        state_char_refs.update(key_variants(fm.get("character")))
    for rel,fm in shots + scenes:
        refs = fm.get("characters") or []
        flat = []
        for r in refs:
            if isinstance(r, list):
                if len(r)==1:
                    flat.append(strip_link(r[0]))
                else:
                    flat.extend(strip_link(x) for x in r)
            else:
                flat.append(strip_link(r))
        for ref in flat:
            if ref and ref not in state_char_refs:
                # only warn, because some characters may not need a state node yet
                warnings.append(f"{rel}: character {ref} has no state node")

    # event checks
    for rel,fm in events:
        if fm.get("status") and fm["status"] not in STATUS:
            errors.append(f"{rel}: invalid status {fm['status']}")
        if fm.get("delta_applied") is False:
            warnings.append(f"{rel}: delta_applied is false")

    # manifest consistency (include all files, not only markdown)
    manifest = root / "MANIFEST.json"
    if manifest.exists():
        try:
            man = json.loads(manifest.read_text(encoding="utf-8"))
            listed = {f["path"] for f in man.get("files", []) if isinstance(f, dict) and "path" in f}
            actual = {p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file()}
            missing = sorted(actual - listed)
            extra = sorted(listed - actual)
            if missing:
                warnings.append(f"MANIFEST missing {len(missing)} files")
            if extra:
                warnings.append(f"MANIFEST lists {len(extra)} nonexistent files")
        except Exception as e:
            errors.append(f"MANIFEST.json parse error: {e}")

    print("ERRORS")
    for e in errors: print("-", e)
    print("WARNINGS")
    for w in warnings: print("-", w)

    return 1 if errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
