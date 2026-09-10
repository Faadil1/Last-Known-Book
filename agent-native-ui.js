const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function installStyles() {
  if (document.querySelector('link[data-lkb-agent-native]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/agent-native-ui.css';
  link.dataset.lkbAgentNative = 'hs002';
  document.head.appendChild(link);
}

function installBYOI() {
  if (document.querySelector('.byoi-section')) return;
  const anchor = document.querySelector('.hero-metrics-strip');
  if (!anchor) return;
  const section = document.createElement('section');
  section.className = 'byoi-section';
  section.setAttribute('aria-labelledby', 'byoi-title');
  section.innerHTML = `
    <div class="byoi-shell">
      <div class="byoi-copy">
        <small>AGENT-NATIVE INTAKE · READ ONLY</small>
        <h2 id="byoi-title">Bring your own incident.</h2>
        <p>Hand Last Known Book a transaction, market identity and the agent's stated intent. The intake stays read-only until venue evidence is reconciled.</p>
        <div class="byoi-contract"><span>OBSERVED</span><span>INFERRED</span><span>UNKNOWN</span><strong>→ AUTHORITY RECEIPT</strong></div>
      </div>
      <form class="byoi-form" id="byoi-form">
        <label><span>Transaction hash <em>optional</em></span><input name="txHash" placeholder="0x…" autocomplete="off" /></label>
        <label><span>Market ID <em>optional</em></span><input name="marketId" placeholder="0x…" autocomplete="off" /></label>
        <label class="byoi-intent"><span>Agent intent</span><textarea name="intent" rows="2" placeholder="What did the agent intend to do?"></textarea></label>
        <div class="byoi-actions"><button type="submit">Investigate read-only <span>→</span></button><small>No wallet · no signing · no write</small></div>
      </form>
      <div class="byoi-result" id="byoi-result" hidden aria-live="polite"></div>
    </div>`;
  anchor.before(section);

  const form = section.querySelector('#byoi-form');
  const result = section.querySelector('#byoi-result');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries([...data.entries()].filter(([, value]) => String(value).trim()));
    result.hidden = false;
    result.innerHTML = '<small>RECONSTRUCTING</small><strong>Checking the bounded intake contract…</strong>';
    try {
      const response = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? body.error ?? 'Invalid incident');
      const receipt = body.authorityReceipt;
      result.innerHTML = `
        <div><small>${body.status}</small><strong>${body.report.caseId}</strong></div>
        <div><small>SAFE NEXT ACTION</small><strong>${receipt.recommendedAction}</strong></div>
        <div><small>WRITE AUTHORIZED</small><strong class="${receipt.writeAuthorized ? 'yes' : 'no'}">${receipt.writeAuthorized ? 'YES' : 'NO'}</strong></div>
        <button type="button" data-copy-receipt>Copy authority receipt</button>`;
      result.querySelector('[data-copy-receipt]')?.addEventListener('click', async () => {
        await navigator.clipboard?.writeText(JSON.stringify(receipt, null, 2));
        const button = result.querySelector('[data-copy-receipt]');
        if (button) button.textContent = 'Receipt copied ✓';
      });
    } catch (error) {
      result.innerHTML = `<small>INPUT HELD</small><strong>${error.message}</strong><p>Last Known Book will not invent missing evidence.</p>`;
    }
  });
}

function installReproduceButton() {
  const actions = document.querySelector('.case-toolbar-actions');
  if (!actions || actions.querySelector('[data-reproduce-case]')) return;
  const button = document.createElement('button');
  button.className = 'icon-btn';
  button.type = 'button';
  button.dataset.reproduceCase = 'true';
  button.textContent = 'Reproduce';
  button.title = 'Copy the deterministic replay command for the current case';
  actions.prepend(button);
  button.addEventListener('click', async () => {
    const caseId = document.getElementById('case-id')?.textContent?.trim() || 'LKB-001';
    const command = `npm run replay && cat evidence/generated/${caseId}.incident-report.json`;
    await navigator.clipboard?.writeText(command);
    button.textContent = 'Copied ✓';
    window.setTimeout(() => { button.textContent = 'Reproduce'; }, reducedMotion ? 0 : 1600);
  });
}

installStyles();
installBYOI();
installReproduceButton();
