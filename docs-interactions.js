const navLinks = [...document.querySelectorAll('.docs-nav a[data-doc-target]')];
const sections = navLinks
  .map((link) => document.getElementById(link.dataset.docTarget))
  .filter(Boolean);

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.getElementById(link.dataset.docTarget);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
});

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.docTarget === visible.target.id));
  }, { rootMargin: '-18% 0px -64% 0px', threshold: [0.08, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}

const expandAll = document.getElementById('qa-expand-all');
expandAll?.addEventListener('click', () => {
  const questions = [...document.querySelectorAll('.qa-item')];
  const shouldOpen = questions.some((item) => !item.open);
  questions.forEach((item) => { item.open = shouldOpen; });
  expandAll.textContent = shouldOpen ? 'Collapse all' : 'Expand all';
});

function exposeAgentNativeLayer() {
  const fastLane = document.querySelector('#fast-lane .fast-lane');
  if (fastLane && !fastLane.querySelector('[data-agent-fast-lane]')) {
    const item = document.createElement('article');
    item.dataset.agentFastLane = 'true';
    item.innerHTML = '<span>5</span><strong>See the agent interface</strong><p>Hand an incident to LKB and get back a bounded machine-readable Authority Receipt.</p><a href="/agent.html">Open agent interface →</a>';
    fastLane.appendChild(item);
  }

  const sourceGrid = document.querySelector('#sources .doc-grid');
  if (sourceGrid && !sourceGrid.querySelector('[data-agent-doc-card]')) {
    const card = document.createElement('a');
    card.className = 'doc-card';
    card.dataset.agentDocCard = 'true';
    card.href = '/agent.html';
    card.innerHTML = '<small>AGENT NATIVE</small><strong>Bring Your Own Incident</strong><p>HTTP, webhook, MCP/stdio, CLI, read-only network normalization and machine-readable Authority Receipts.</p><span class="arrow">Open agent interface →</span>';
    sourceGrid.prepend(card);
  }
}

exposeAgentNativeLayer();
