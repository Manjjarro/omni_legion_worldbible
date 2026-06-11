/**
 * Generate a vault manifest with SHA-256 hashes.
 * Excludes MANIFEST.json itself and generated runtime reports.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IGNORED = new Set([
  'MANIFEST.json',
  '03_SYSTEM/health_report.json',
  '03_SYSTEM/generated/health_report.json',
]);

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function walk(dir, baseDir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, baseDir, out);
    } else if (entry.isFile()) {
      const rel = path.relative(baseDir, abs).replace(/\\/g, '/');
      if (IGNORED.has(rel)) continue;
      out.push(rel);
    }
  }
  return out;
}

function main() {
  const vaultRoot = path.resolve(__dirname, '..', '..');
  const manifestPath = path.join(vaultRoot, 'MANIFEST.json');
  const files = walk(vaultRoot, vaultRoot).sort((a, b) => a.localeCompare(b));

  const payload = {
    manifest_version: '4.3',
    integrity: 'sha256',
    generated_at: new Date().toISOString(),
    files: files.map((rel) => {
      const abs = path.join(vaultRoot, rel);
      return {
        path: rel,
        sha256: sha256(fs.readFileSync(abs)),
      };
    }),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${manifestPath} with ${payload.files.length} file hashes.`);
}

if (require.main === module) {
  main();
}
