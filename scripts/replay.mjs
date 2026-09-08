import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { analyzeCase } from '../src/engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['mint-pair-indexer-lag.json', 'resting-sell-escrow.json', 'expected-vs-actual.json'];
const outDir = path.join(root, 'evidence', 'generated');
await mkdir(outDir, { recursive: true });

for (const name of names) {
  const source = JSON.parse(await readFile(path.join(root, 'data', 'cases', name), 'utf8'));
  const report = analyzeCase(source);
  const target = path.join(outDir, `${source.caseId}.incident-report.json`);
  await writeFile(target, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${source.caseId} ${report.rootCause} ${report.policy.action} sha256:${report.reportHash.slice(0, 16)}`);
}
