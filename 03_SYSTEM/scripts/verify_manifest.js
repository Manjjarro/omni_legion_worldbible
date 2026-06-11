/**
 * Verify a vault manifest against current file hashes.
 * Skips MANIFEST.json itself and generated runtime reports.
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

function main() {
  const vaultRoot = path.resolve(__dirname, '..', '..');
  const manifestPath = path.join(vaultRoot, 'MANIFEST.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('MANIFEST.json not found.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expected = new Map(
    (manifest.files || [])
      .filter((f) => !IGNORED.has(f.path))
      .map((f) => [f.path, f.sha256])
  );
  const issues = [];

  for (const [rel, hash] of expected.entries()) {
    const abs = path.join(vaultRoot, rel);
    if (!fs.existsSync(abs)) {
      issues.push(`MISSING ${rel}`);
      continue;
    }
    const actual = sha256(fs.readFileSync(abs));
    if (actual !== hash) {
      issues.push(`MISMATCH ${rel}`);
    }
  }

  const actualFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile()) {
        const rel = path.relative(vaultRoot, abs).replace(/\\/g, '/');
        if (IGNORED.has(rel)) continue;
        actualFiles.push(rel);
      }
    }
  }
  walk(vaultRoot);

  for (const rel of actualFiles) {
    if (!expected.has(rel)) issues.push(`UNTRACKED ${rel}`);
  }

  if (issues.length) {
    console.error('Manifest verification failed:');
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`Manifest verified: ${expected.size} files checked.`);
}

if (require.main === module) {
  main();
}
