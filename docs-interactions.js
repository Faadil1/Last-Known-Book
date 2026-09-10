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
