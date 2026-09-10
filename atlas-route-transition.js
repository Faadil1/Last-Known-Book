const CASE_ROUTE_PATTERN = /^LKB-00[1-4]$/;
const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');

function selectedCaseFromLocation() {
  const value = new URLSearchParams(window.location.search).get('case');
  return CASE_ROUTE_PATTERN.test(value || '') ? value : null;
}

function ensureWorkspaceIntro() {
  if (document.querySelector('.atlas-workspace-intro')) return;
  const shell = document.getElementById('investigations');
  if (!shell) return;
  const intro = document.createElement('section');
  intro.className = 'atlas-workspace-intro';
  intro.innerHTML = `
    <div><small>CASE ROOM</small><h1>Reconstruct the execution.</h1></div>
    <div><p>Pick a captured incident, inspect the evidence, then follow the causal path to the bounded next action.</p><a href="/" data-atlas-home-link>← Back to overview</a></div>`;
  shell.before(intro);
}

function focusCase(caseId) {
  const activate = () => {
    document.querySelector(`#case-nav [data-case="${caseId}"]`)?.click();
    document.getElementById('investigations')?.scrollIntoView({
      behavior: motionQuery?.matches ? 'auto' : 'smooth',
      block: 'start'
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(activate));
}

function enterCaseRoom(caseId, { push = true } = {}) {
  if (!CASE_ROUTE_PATTERN.test(caseId || '')) caseId = 'LKB-001';
  document.body.classList.remove('atlas-home-mode');
  document.body.classList.add('atlas-room-v4', 'atlas-workspace-mode');
  ensureWorkspaceIntro();
  if (push) history.pushState({ atlasCase: caseId }, '', `/?case=${encodeURIComponent(caseId)}`);
  focusCase(caseId);
}

function enterHome({ push = true } = {}) {
  document.body.classList.remove('atlas-workspace-mode');
  document.body.classList.add('atlas-room-v4', 'atlas-home-mode');
  document.querySelector('.atlas-workspace-intro')?.remove();
  if (push) history.pushState({ atlasHome: true }, '', '/');
  window.scrollTo({ top: 0, behavior: motionQuery?.matches ? 'auto' : 'smooth' });
}

// The Case Room is already present in the live DOM. Transition in place instead of
// reloading index.html, which would briefly expose the legacy pre-Atlas hero.
document.addEventListener('click', (event) => {
  if (!document.body.classList.contains('atlas-home-mode')) {
    const homeLink = event.target.closest('[data-atlas-home-link]');
    if (homeLink) {
      event.preventDefault();
      event.stopImmediatePropagation();
      enterHome();
    }
    return;
  }

  const caseCard = event.target.closest('[data-feature-case]');
  if (caseCard) {
    event.preventDefault();
    event.stopImmediatePropagation();
    enterCaseRoom(caseCard.dataset.featureCase);
    return;
  }

  const caseEntry = event.target.closest('#hero-explore, #top-open-case, .hotspot-main, a[href="/investigations.html"]');
  if (caseEntry) {
    event.preventDefault();
    event.stopImmediatePropagation();
    enterCaseRoom('LKB-001');
  }
}, true);

window.addEventListener('popstate', () => {
  const caseId = selectedCaseFromLocation();
  if (caseId) enterCaseRoom(caseId, { push: false });
  else enterHome({ push: false });
});
