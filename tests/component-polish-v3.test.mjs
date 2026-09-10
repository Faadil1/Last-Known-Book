import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('component polish v3 stays live, branded and accessible', async () => {
  const hero = await readFile('hero-interactions.js', 'utf8');
  const js = await readFile('component-polish.js', 'utf8');
  const css = await readFile('component-polish.css', 'utf8');
  const notFound = await readFile('404.html', 'utf8');

  assert.match(hero, /import '\/component-polish\.js'/);
  assert.match(js, /installNavbarState/);
  assert.match(js, /installFinalCTA/);
  assert.match(js, /upgradeFooter/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /Start an Investigation/);
  assert.match(js, /Open the Judge Packet/);
  assert.match(css, /\.topbar\.is-scrolled/);
  assert.match(css, /\.lkb-final-cta/);
  assert.match(css, /footer\.lkb-footer/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(notFound, /This evidence trail ends here/);
  assert.match(notFound, /Missing route ≠ missing evidence/);
  assert.ok((await stat('component-polish.css')).size > 3000);
});
