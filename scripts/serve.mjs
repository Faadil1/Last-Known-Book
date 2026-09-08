import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.yaml': 'text/yaml; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  try {
    const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const safe = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
    const target = path.join(root, safe);
    if (!target.startsWith(root)) throw new Error('unsafe path');
    const body = await readFile(target);
    res.writeHead(200, { 'content-type': types[path.extname(target)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});
server.listen(port, () => console.log(`Last Known Book: http://localhost:${port}`));
