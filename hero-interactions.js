import '/atlas-route-transition.js';
import '/component-polish.js';
import '/atlas-room.js';

const heroScene = document.querySelector('.hero-reference-scene');
const heroPhoto = document.querySelector('.hero-reference-photo');
const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = motionQuery?.matches ?? false;

// The raw commitment JSON remains a machine-readable evidence artifact, but no
// judge-facing product link should open it directly. Route every legacy entry
// into the styled Proof Room receipt instead.
document.querySelectorAll('a[href="/evidence/SHANNON-PROOF-003-COMMITMENT.json"]').forEach((link) => {
  link.href = '/proof.html#commitment';
  link.removeAttribute('target');
  link.removeAttribute('rel');
  link.textContent = 'Open visual proof receipt →';
});

function scrollToInvestigations() {
  document.getElementById('investigations')?.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start'
  });
}

function activateProductView(tab) {
  scrollToInvestigations();
  window.setTimeout(() => {
    document.querySelector(`.case-tab[data-tab="${tab}"]`)?.click();
  }, prefersReducedMotion ? 0 : 320);
}

function openFeaturedCase(caseId, tab = 'overview') {
  scrollToInvestigations();
  window.setTimeout(() => {
    document.querySelector(`#case-nav [data-case="${caseId}"]`)?.click();
    if (tab !== 'overview') document.querySelector(`.case-tab[data-tab="${tab}"]`)?.click();
  }, prefersReducedMotion ? 0 : 320);
}

function upgradeHeroSurface() {
  const heroVisual = document.querySelector('.hero-visual');
  heroVisual?.setAttribute('aria-label', 'Atlas Room investigation environment');

  const mainHotspot = document.querySelector('.hotspot-main');
  if (mainHotspot) {
    mainHotspot.removeAttribute('data-tip');
    mainHotspot.setAttribute('aria-label', 'Open case files and explore investigation evidence');
    mainHotspot.innerHTML = `
      <span class="hotspot-plus" aria-hidden="true">+</span>
      <span class="hotspot-copy">
        <strong>Open the Atlas</strong>
        <small>Enter a real investigation</small>
      </span>`;
  }
}

function installFeaturedInvestigations() {
  const hero = document.querySelector('.hero-section');
  if (!hero || document.querySelector('.featured-investigations')) return;

  const section = document.createElement('section');
  section.className = 'featured-investigations';
  section.setAttribute('aria-labelledby', 'featured-investigations-title');
  section.innerHTML = `
    <div class="featured-header">
      <div><p>REAL CASES · REAL CONTEXT.</p><h2 id="featured-investigations-title">Featured Investigations</h2></div>
      <p>Four captured Shannon incident classes · evidence first</p>
    </div>
    <div class="featured-grid">
      <button class="featured-card" type="button" data-feature-case="LKB-001">
        <span class="featured-icon" aria-hidden="true">↳</span>
        <span class="featured-copy"><small>LKB-001</small><strong>Execution Incident</strong><span>Mint-pair + indexer divergence.</span></span>
        <span class="featured-arrow" aria-hidden="true">→</span>
      </button>
      <button class="featured-card" type="button" data-feature-case="LKB-002">
        <span class="featured-icon" aria-hidden="true">◇</span>
        <span class="featured-copy"><small>LKB-002</small><strong>Liquidity / Escrow</strong><span>Resting SELL collateral state.</span></span>
        <span class="featured-arrow" aria-hidden="true">→</span>
      </button>
      <button class="featured-card" type="button" data-feature-case="LKB-003">
        <span class="featured-icon" aria-hidden="true">≠</span>
        <span class="featured-copy"><small>LKB-003</small><strong>Fill Dislocation</strong><span>Expected vs. actual execution.</span></span>
        <span class="featured-arrow" aria-hidden="true">→</span>
      </button>
      <button class="featured-card" type="button" data-feature-case="LKB-004">
        <span class="featured-icon" aria-hidden="true">✓</span>
        <span class="featured-copy"><small>LKB-004</small><strong>Settlement Review</strong><span>Exact-market residual reconciliation.</span></span>
        <span class="featured-arrow" aria-hidden="true">→</span>
      </button>
    </div>
    <div class="featured-foot">REAL DATA · REAL CONTEXT · BOUNDED DECISIONS.</div>`;
  hero.insertAdjacentElement('afterend', section);

  section.querySelectorAll('[data-feature-case]').forEach((button) => {
    button.addEventListener('click', () => openFeaturedCase(button.dataset.featureCase));
  });
}

if (heroScene && heroPhoto && !prefersReducedMotion) {
  let raf = 0;
  heroScene.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = heroScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroScene.style.setProperty('--photo-x', `${(-x * 5).toFixed(2)}px`);
      heroScene.style.setProperty('--photo-y', `${(-y * 3).toFixed(2)}px`);
    });
  });
  heroScene.addEventListener('pointerleave', () => {
    heroScene.style.setProperty('--photo-x', '0px');
    heroScene.style.setProperty('--photo-y', '0px');
  });
}

document.querySelectorAll('.hero-hotspot[data-archive-target]').forEach((hotspot) => {
  hotspot.addEventListener('click', () => {
    const target = hotspot.dataset.archiveTarget;
    if (target === 'overview') return openFeaturedCase('LKB-001');
    if (['evidence', 'timeline', 'method'].includes(target)) activateProductView(target);
  });
});

document.getElementById('hero-explore')?.addEventListener('click', scrollToInvestigations);
document.getElementById('hero-sample')?.addEventListener('click', () => openFeaturedCase('LKB-001'));

motionQuery?.addEventListener?.('change', () => {
  if (!heroScene) return;
  heroScene.style.setProperty('--photo-x', '0px');
  heroScene.style.setProperty('--photo-y', '0px');
});

upgradeHeroSurface();
installFeaturedInvestigations();
