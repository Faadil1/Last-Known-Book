const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function installPolishStylesheet() {
  if (document.querySelector('link[data-lkb-polish]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/component-polish.css';
  link.dataset.lkbPolish = 'v3';
  document.head.appendChild(link);
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function installNavbarState() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  const update = () => topbar.classList.toggle('is-scrolled', window.scrollY > 18);
  update();
  window.addEventListener('scroll', update, { passive: true });

  const navItems = [...document.querySelectorAll('.nav-link[data-scroll-target]')];
  const sections = navItems.map((item) => document.getElementById(item.dataset.scrollTarget)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.scrollTarget === visible.target.id));
  }, { rootMargin: '-20% 0px -68% 0px', threshold: [0,.15,.35,.6] });
  sections.forEach((section) => observer.observe(section));
}

function installFinalCTA() {
  if (document.querySelector('.lkb-final-cta')) return;
  const footer = document.querySelector('footer');
  if (!footer) return;
  const cta = document.createElement('section');
  cta.className = 'lkb-final-cta';
  cta.setAttribute('aria-labelledby', 'lkb-final-cta-title');
  cta.innerHTML = `
    <div class="lkb-final-cta-inner">
      <div>
        <small>WHEN THE EXECUTION DOESN'T MATCH THE INTENT</small>
        <h2 id="lkb-final-cta-title">The chain already wrote the facts. Reconstruct the decision.</h2>
        <p>Move from raw execution evidence to a bounded incident narrative — with observed facts, inferred explanations and unknowns kept visibly separate.</p>
      </div>
      <div class="lkb-final-cta-actions">
        <button class="cta-primary" type="button" data-final-action="investigate"><span>Start an Investigation</span><span>→</span></button>
        <a class="cta-secondary" href="/docs.html"><span>Open the Judge Packet</span><span>↗</span></a>
      </div>
    </div>`;
  footer.before(cta);
  cta.querySelector('[data-final-action="investigate"]')?.addEventListener('click', () => scrollToId('investigations'));
}

function upgradeFooter() {
  const footer = document.querySelector('footer');
  if (!footer || footer.classList.contains('lkb-footer')) return;
  footer.className = 'lkb-footer';
  footer.innerHTML = `
    <div class="lkb-footer-grid">
      <div class="lkb-footer-brand">
        <img src="/brand-mark.svg" alt="" />
        <h3>Last Known Book</h3>
        <p>Post-execution investigation for autonomous DreamDEX agents. Evidence first. Inference bounded. Writes gated.</p>
      </div>
      <div class="lkb-footer-col"><small>INVESTIGATE</small><button type="button" data-footer-scroll="investigations">Case register</button><button type="button" data-footer-scroll="methodology">Methodology</button><button type="button" data-footer-scroll="proof">Proof</button></div>
      <div class="lkb-footer-col"><small>VERIFY</small><a href="/docs.html">Judge Packet</a><a href="/evidence/SHANNON-PROOF-003-COMMITMENT.json" target="_blank" rel="noreferrer">Proof commitment ↗</a><a href="https://shannon-explorer.somnia.network/tx/0xbe1b148423553b21f7c4177248dc6be19406e1416b1f065cc556279de4da03be" target="_blank" rel="noreferrer">Shannon explorer ↗</a></div>
      <div class="lkb-footer-col"><small>PROJECT</small><a href="/agent.html">Agent interface</a><a href="https://github.com/Faadil1/Last-Known-Book" target="_blank" rel="noreferrer">GitHub ↗</a><a href="/404.html">Error state</a><button type="button" data-footer-scroll="top">Back to top ↑</button></div>
    </div>
    <div class="lkb-footer-manifesto" aria-hidden="true">EVIDENCE LIVES ON.</div>
    <div class="lkb-footer-bottom"><span>LAST KNOWN BOOK · SOMNIA SHANNON</span><span>Replay evidence ≠ production proof.</span></div>`;
  footer.querySelectorAll('[data-footer-scroll]').forEach((button) => button.addEventListener('click', () => scrollToId(button.dataset.footerScroll)));
}

installPolishStylesheet();
installNavbarState();
installFinalCTA();
upgradeFooter();
