import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const FORBIDDEN_WRITE_METHODS = ['eth_sendTransaction', 'eth_sendRawTransaction', 'personal_sign', 'eth_sign'];

test('Direction 6 visual identity and interactions are present', async () => {
  const html = await readFile('index.html', 'utf8');
  const app = await readFile('app.js', 'utf8');
  const logo = await readFile('brand-mark.svg', 'utf8');

  assert.match(html, /brand-mark\.svg/);
  assert.match(html, /Same chain\./);
  assert.match(html, /Clearer answers\./);
  assert.match(html, /case-search/);
  assert.match(html, /data-tab="overview"/);
  assert.match(html, /data-tab="evidence"/);
  assert.match(html, /data-tab="timeline"/);
  assert.match(html, /data-tab="method"/);
  assert.match(html, /event-dialog/);
  assert.match(app, /navigator\.clipboard/);
  assert.match(app, /Blob\(/);
  assert.match(app, /timelineForCase/);
  assert.match(app, /setActiveTab/);
  assert.match(logo, /Last Known Book mark/);
});

test('Vercel Shannon endpoint is read-only and fail-closed', async () => {
  const api = await readFile('api/shannon-readback.js', 'utf8');
  assert.match(api, /eth_chainId/);
  assert.match(api, /eth_blockNumber/);
  assert.match(api, /eth_getTransactionReceipt/);
  assert.match(api, /PUBLIC_CAPTURED_LKB003_ONLY/);
  assert.match(api, /writesAttempted: false/);
  for (const forbidden of FORBIDDEN_WRITE_METHODS) {
    assert.equal(api.includes(forbidden), false, `server readback must not include ${forbidden}`);
  }
});

test('browser live surface keeps only read methods and a server-first path', async () => {
  const app = await readFile('app.js', 'utf8');
  assert.match(app, /\/api\/shannon-readback/);
  assert.match(app, /BROWSER_RPC_FALLBACK/);
  assert.match(app, /EXPLORER_FALLBACK/);
  for (const forbidden of FORBIDDEN_WRITE_METHODS) {
    assert.equal(app.includes(forbidden), false, `browser must not include ${forbidden}`);
  }
});
