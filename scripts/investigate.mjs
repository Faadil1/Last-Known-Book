import { readFile } from 'node:fs/promises';
import { ingestIncident } from '../src/agent-native.mjs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run investigate -- <incident.json>');
  process.exit(2);
}

const payload = JSON.parse(await readFile(inputPath, 'utf8'));
const result = ingestIncident(payload);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
