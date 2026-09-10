const heroScene = document.querySelector('.hero-reference-scene');
const heroPhoto = document.querySelector('.hero-reference-photo');
const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = motionQuery?.matches ?? false;

const APPROVED_HERO_PARTS = 7;

async function loadApprovedHeroAsset() {
  if (!heroPhoto) return;
  heroPhoto.dataset.assetState = 'loading';
  try {
    const parts = await Promise.all(
      Array.from({ length: APPROVED_HERO_PARTS }, (_, index) => {
        const part = String(index + 1).padStart(2, '0');
        return fetch(`/assets/hero-v2/part-${part}.b64`, { cache: 'force-cache' }).then((response) => {
          if (!response.ok) throw new Error(`hero asset part ${part}: ${response.status}`);
          return response.text();
        });
      })
    );
    heroPhoto.src = `data:image/webp;base64,${parts.map((part) => part.trim()).join('')}`;
    heroPhoto.dataset.assetState = 'approved';
  } catch (error) {
    console.warn('Approved hero scene could not be assembled; retaining safe fallback.', error);
    heroPhoto.dataset.assetState = 'fallback';
  }
}

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
  const eyebrow = document.querySelector('.hero-eyebrow');
  if (eyebrow) eyebrow.textContent = 'ON-CHAIN EVIDENCE · OFF-CHAIN CLARITY.';

  const heroVisual = document.querySelector('.hero-visual');
  heroVisual?.setAttribute('aria-label', 'Warm editorial investigation workspace with physical Last Known Book case binders');
  heroPhoto?.setAttribute('alt', 'Warm evidence workspace with physical case binders, archival papers and a mountain landscape beyond the window');

  const mainHotspot = document.querySelector('.hotspot-main');
  if (mainHotspot) {
    mainHotspot.removeAttribute('data-tip');
    mainHotspot.setAttribute('aria-label', 'Open case files and explore investigation evidence');
    mainHotspot.innerHTML = `
      <span class="hotspot-plus" aria-hidden="true">+</span>
      <span class="hotspot-copy">
        <strong>Open Case Files</strong>
        <small>Explore investigation evidence</small>
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
      <h2 id="featured-investigations-title">Featured Investigations</h2>
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
      heroScene.style.setProperty('--photo-x', `${(-x * 6).toFixed(2)}px`);
      heroScene.style.setProperty('--photo-y', `${(-y * 4).toFixed(2)}px`);
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
    if (target === 'overview') {
      openFeaturedCase('LKB-001');
      return;
    }
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
loadApprovedHeroAsset();
