const heroScene = document.querySelector('.hero-scene');
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

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

if (heroScene && !prefersReducedMotion) {
  let raf = 0;
  heroScene.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = heroScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroScene.style.setProperty('--scene-x', `${(-x * 13).toFixed(2)}px`);
      heroScene.style.setProperty('--scene-y', `${(-y * 9).toFixed(2)}px`);
      heroScene.style.setProperty('--archive-x', `${(x * 18).toFixed(2)}px`);
      heroScene.style.setProperty('--archive-y', `${(y * 11).toFixed(2)}px`);
    });
  });

  heroScene.addEventListener('pointerleave', () => {
    heroScene.style.setProperty('--scene-x', '0px');
    heroScene.style.setProperty('--scene-y', '0px');
    heroScene.style.setProperty('--archive-x', '0px');
    heroScene.style.setProperty('--archive-y', '0px');
  });
}

document.querySelectorAll('[data-archive-target]').forEach((volume) => {
  volume.addEventListener('click', () => {
    const target = volume.dataset.archiveTarget;
    if (target === 'overview') {
      scrollToInvestigations();
      return;
    }
    if (['evidence', 'timeline', 'method'].includes(target)) {
      activateProductView(target);
    }
  });
});
