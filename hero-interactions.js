const heroScene = document.querySelector('.hero-reference-scene');
const heroPhoto = document.querySelector('.hero-reference-photo');
const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = motionQuery?.matches ?? false;

function scrollToInvestigations() {
  document.getElementById('investigations')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function activateProductView(tab) {
  scrollToInvestigations();
  window.setTimeout(() => {
    const button = document.querySelector(`.case-tab[data-tab="${tab}"]`);
    button?.click();
  }, prefersReducedMotion ? 0 : 320);
}

if (heroScene && heroPhoto && !prefersReducedMotion) {
  let raf = 0;
  heroScene.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = heroScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroScene.style.setProperty('--photo-x', `${(-x * 8).toFixed(2)}px`);
      heroScene.style.setProperty('--photo-y', `${(-y * 5).toFixed(2)}px`);
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
      scrollToInvestigations();
      return;
    }
    if (['evidence', 'timeline', 'method'].includes(target)) {
      activateProductView(target);
    }
  });
});

document.getElementById('hero-sample')?.addEventListener('click', scrollToInvestigations);

motionQuery?.addEventListener?.('change', () => {
  if (!heroScene) return;
  heroScene.style.setProperty('--photo-x', '0px');
  heroScene.style.setProperty('--photo-y', '0px');
});
