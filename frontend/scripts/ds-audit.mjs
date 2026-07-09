#!/usr/bin/env node
/**
 * Design system governance audit — catches common regressions in feature code.
 * Run: npm run ds:audit
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../src');
const FEATURES = path.join(SRC, 'features');

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_PATTERN = /\brgb\(\s*\d+/g;
const RAW_TABLE_PATTERN = /<table[\s>]/gi;

const ALLOWED_HEX_PATHS = [
  path.join(SRC, 'assets'),
  path.join(SRC, 'constants'),
  path.join(SRC, 'workflow-packs'),
  path.join(SRC, 'components'),
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function isAllowedHex(file) {
  return ALLOWED_HEX_PATHS.some((allowed) => file.startsWith(allowed));
}

async function main() {
  const files = await walk(FEATURES);
  const violations = [];

  const dataTablePath = path.join(SRC, 'components/data/DataTable.tsx');
  const layoutPath = path.join(SRC, 'components/data/data-table-layout.ts');
  const [dataTableContent, layoutContent] = await Promise.all([
    readFile(dataTablePath, 'utf8'),
    readFile(layoutPath, 'utf8'),
  ]);

  if (dataTableContent.includes('__spacer')) {
    violations.push('components/data/DataTable.tsx: __spacer column is not allowed');
  }
  if (dataTableContent.includes('w-[1%]')) {
    violations.push('components/data/DataTable.tsx: w-[1%] column compression is not allowed');
  }
  if (!dataTableContent.includes('DATA_TABLE_TABLE_CLASS')) {
    violations.push('components/data/DataTable.tsx: must use shared intrinsic-width table class');
  }
  if (!layoutContent.includes('w-max min-w-full')) {
    violations.push('components/data/data-table-layout.ts: intrinsic-width table model missing');
  }
  if (!layoutContent.includes('border-collapse')) {
    violations.push('components/data/data-table-layout.ts: border-collapse required for column alignment');
  }
  if (!layoutContent.includes('text-left')) {
    violations.push('components/data/data-table-layout.ts: header text-left alignment required');
  }

  let dataTablePages = 0;
  let formFieldPages = 0;
  let packPages = 0;

  for (const file of files) {
    const rel = path.relative(SRC, file).replace(/\\/g, '/');
    const content = await readFile(file, 'utf8');

    if (content.includes('DataTable')) dataTablePages += 1;
    if (content.includes('FormField') || content.includes('FormTextField')) formFieldPages += 1;
    if (content.includes('@workflow-packs') || content.includes('ModuleListPack') || content.includes('ModuleProfilePack') || content.includes('ModuleMarkGridPack') || content.includes('ModuleReportPack') || content.includes('ModuleSettingsPack')) {
      packPages += 1;
    }

    if (!isAllowedHex(file)) {
      const hexMatches = content.match(HEX_PATTERN);
      if (hexMatches?.length) {
        violations.push(`${rel}: raw hex color (${hexMatches.slice(0, 3).join(', ')})`);
      }
      if (RGB_PATTERN.test(content)) {
        violations.push(`${rel}: raw rgb() color`);
      }
    }

    if (RAW_TABLE_PATTERN.test(content) && !content.includes('DataTable')) {
      violations.push(`${rel}: raw <table> without DataTable`);
    }

    if (/Table\.tsx$/.test(file) && content.includes('stickyFirstColumn')) {
      violations.push(`${rel}: stickyFirstColumn is deprecated — remove and rely on DataTable scroll`);
    }
  }

  const listPages = files.filter((f) => f.endsWith('Page.tsx')).length;
  const adoption = {
    listPages,
    dataTablePages,
    formFieldPages,
    packPages,
    dataTablePct: listPages ? Math.round((dataTablePages / listPages) * 100) : 0,
    packPct: listPages ? Math.round((packPages / listPages) * 100) : 0,
  };

  console.log('Design system audit');
  console.log('───────────────────');
  console.log(`Feature pages scanned: ${listPages}`);
  console.log(`DataTable adoption: ${adoption.dataTablePct}% (${dataTablePages}/${listPages})`);
  console.log(`Workflow pack adoption: ${adoption.packPct}% (${packPages}/${listPages})`);
  console.log(`FormField adoption: ${formFieldPages} pages`);

  if (violations.length > 0) {
    console.error('\nViolations:');
    for (const v of violations) console.error(`  ✗ ${v}`);
    process.exit(1);
  }

  console.log('\n✓ No governance violations found');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
