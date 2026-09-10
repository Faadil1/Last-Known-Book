const CASE_FILES = [
  'mint-pair-indexer-lag.json',
  'resting-sell-escrow.json',
  'expected-vs-actual.json',
  'exact-market-residual-settlement.json'
];

const LIVE_SHANNON = {
  api: '/api/shannon-readback',
  rpc: 'https://dream-rpc.somnia.network/',
  expectedChainId: 50312,
  publicCapturedTx: '0xbe1b148423553b21f7c4177248dc6be19406e1416b1f065cc556279de4da03be',
  explorerApiBase: 'https://shannon-explorer.somnia.network/api/v2/transactions/',
  pollMs: 15000
};

const state = {
  cases: [],
  active: 0,
  activeTab: 'overview',
  activeEvent: 0,
  liveTimer: null,
  toastTimer: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function money(n, digits = 6) { return Number(n).toFixed(digits); }
function shortHash(value) {
  if (!value || typeof value !== 'string') return value;
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function browserAnalyze(data) {
  const claims = [];
  let rootCause = 'UNKNOWN';
  let semantics = [];
  let policy = { action: 'ESCALATE', writeAuthorized: false, reason: 'Evidence insufficient.' };

  if (data.type === 'MINT_PAIR_INDEXER_LAG') {
    const net = Number((data.evidence.grossContractValue - data.evidence.soldLegProceeds).toFixed(6));
    semantics = ['MINT_A_PAIR', 'CHAIN_INDEXER_DIVERGENCE'];
    rootCause = 'MIXED';
    claims.push(
      ['OBSERVED', 'Fill path', 'MINT_A_PAIR', 'fill.kind'],
      ['OBSERVED', 'Chain truth', 'Transaction confirmed SUCCESS', 'public Shannon evidence'],
      ['OBSERVED', 'Indexer truth', 'Verification returned UNAVAILABLE', 'bounded indexer reads'],
      ['OBSERVED', 'Corrected net escrow', `${money(net)} tUSDC`, 'gross value − sold-leg proceeds'],
      ['INFERRED', 'Naive interpretation', `quoteQuantity ≈ ${data.evidence.quoteQuantityApprox} would understate the economics by >60×`, 'deterministic comparison'],
      ['UNKNOWN', 'Counterparty intent', 'Not established', '—']
    );
    policy = { action: 'RETRY_READ', writeAuthorized: false, reason: 'Chain success outranks lagging indexed confirmation. Do not resubmit.' };
  }

  if (data.type === 'RESTING_SELL_ESCROW') {
    semantics = ['RESTING_SELL_ESCROW'];
    rootCause = 'VENUE_SEMANTICS';
    claims.push(
      ['OBSERVED', 'Before rest', `${data.evidence.visibleYesBeforeRaw} raw YES visible`, 'captured balance'],
      ['OBSERVED', 'While resting', `${data.evidence.visibleYesAfterPlacementRaw} visible / ${data.evidence.committedOutcomeRaw} committed`, 'order + balance'],
      ['OBSERVED', 'After cancel', `${data.evidence.visibleYesAfterCancelRaw} raw YES visible`, data.evidence.tx.cancel],
      ['INFERRED', 'Root cause', 'Venue escrow, not lost inventory', 'before/after reconciliation'],
      ['UNKNOWN', 'Counterparty demand', 'Not relevant to the incident', '—']
    );
    policy = { action: 'NO_ACTION', writeAuthorized: false, reason: 'The state is explained. A compensating trade would create a second incident.' };
  }

  if (data.type === 'EXPECTED_VS_OBSERVED') {
    const delta = data.evidence.requestedPrice - data.evidence.averageFillPrice;
    semantics = ['EXPECTED_VS_ACTUAL_FILL'];
    rootCause = 'EXPECTED_VS_OBSERVED';
    claims.push(
      ['OBSERVED', 'Intent', `BUY_NO ${data.evidence.requestedQuantity} @ ${data.evidence.requestedPrice}`, 'request'],
      ['OBSERVED', 'Execution', `avg ${data.evidence.averageFillPrice} / block ${data.evidence.block}`, data.evidence.txHash],
      ['OBSERVED', 'Position', `${data.evidence.positionBefore} → ${data.evidence.positionAfter} NO`, 'position reconciliation'],
      ['INFERRED', 'Execution quality', `Price improved by ${delta.toFixed(3)} versus limit`, 'deterministic delta'],
      ['UNKNOWN', 'Counterparty pricing intent', 'Not required for reconciliation', '—']
    );
    policy = { action: 'NO_ACTION', writeAuthorized: false, reason: 'The execution is reconciled and favorable versus the submitted limit.' };
  }

  if (data.type === 'EXACT_MARKET_RESIDUAL_SETTLEMENT') {
    const residuals = Array.isArray(data.evidence.residuals) ? data.evidence.residuals : [];
    const redeemed = residuals.filter((r) => r.redeemTxHash && r.payoutRaw !== '0');
    const zeroValue = residuals.filter((r) => !r.redeemTxHash && r.payoutRaw === '0');
    semantics = ['EXACT_MARKET_RESIDUAL', 'SETTLEMENT_LIFECYCLE'];
    rootCause = 'EXACT_MARKET_SETTLEMENT';
    claims.push(
      ['OBSERVED', 'Winning residuals', `${redeemed.length} exact-market NO residuals redeemed`, 'captured settlement receipts'],
      ['OBSERVED', 'Zero-value residuals', `${zeroValue.length} losing NO residual skipped`, 'resolved payout vector'],
      ['OBSERVED', 'Repeat writes', `${data.reconciliation.repeatWritesRequired ?? 0} required after reconciliation`, 'captured final state'],
      ['INFERRED', 'Settlement rule', 'Claimability is market-scoped, not inferred from a nonzero wallet balance alone', 'exact market + payout vector'],
      ['UNKNOWN', 'Fresh redeem authority', 'Not established by historical claimability', 'requires fresh predicates + human confirmation']
    );
    policy = { action: 'ESCALATE', writeAuthorized: false, reason: 'Historical winning status does not authorize a fresh redeem. Re-read exact market predicates and require explicit authority.' };
  }

  return { claims, rootCause, semantics, policy };
}

function reconciliationText(data) {
  if (data.reconciliation?.finalState) return data.reconciliation.finalState;
  if (data.type === 'EXACT_MARKET_RESIDUAL_SETTLEMENT') {
    return `${data.reconciliation.winningResidualsRedeemed ?? 0} winning residuals redeemed, ${data.reconciliation.knownZeroValueResidualsSkipped ?? 0} zero-value residual skipped, ${data.reconciliation.repeatWritesRequired ?? 0} repeat writes required.`;
  }
  return 'Reconciliation evidence available in the captured casefile.';
}

function timelineForCase(data) {
  if (data.type === 'MINT_PAIR_INDEXER_LAG') {
    return [
      { title: 'Execution confirmed on chain', body: 'Shannon receipt status is SUCCESS.', evidence: 'receiptStatus: SUCCESS', tag: 'CHAIN' },
      { title: 'MINT_A_PAIR decoded', body: 'The fill path used DreamDEX complementary-side mint semantics.', evidence: 'fill.kind: MINT_A_PAIR', tag: 'VENUE' },
      { title: 'Indexer verification unavailable', body: 'The bounded indexer path lagged behind chain truth.', evidence: 'indexerVerification: UNAVAILABLE', tag: 'INDEXER' },
      { title: 'Write refused; read retried', body: 'Chain success outranks a lagging indexed read, so no compensating transaction is justified.', evidence: 'policy: RETRY_READ / writeAuthorized=false', tag: 'POLICY' }
    ];
  }
  if (data.type === 'RESTING_SELL_ESCROW') {
    return [
      { title: 'Complete set minted', body: `Visible YES started at ${data.evidence.visibleYesBeforeRaw} raw.`, evidence: data.evidence.tx.mint, tag: 'MINT' },
      { title: 'SELL_YES rested', body: `${data.evidence.committedOutcomeRaw} raw outcome tokens moved into venue escrow.`, evidence: data.evidence.tx.sellYes, tag: 'ORDER' },
      { title: 'Exact order cancelled', body: `Visible YES returned to ${data.evidence.visibleYesAfterCancelRaw} raw.`, evidence: data.evidence.tx.cancel, tag: 'CANCEL' },
      { title: 'Set burned and collateral restored', body: 'The final position returned to zero and tUSDC returned to the original raw balance.', evidence: data.evidence.tx.burnSet, tag: 'CLOSE' }
    ];
  }
  if (data.type === 'EXPECTED_VS_OBSERVED') {
    return [
      { title: 'Bounded BUY_NO intent captured', body: `Requested ${data.evidence.requestedQuantity} contracts at a ${data.evidence.requestedPrice} limit.`, evidence: 'request', tag: 'INTENT' },
      { title: 'Execution landed on Shannon', body: `Average fill ${data.evidence.averageFillPrice} in block ${data.evidence.block}.`, evidence: data.evidence.txHash, tag: 'CHAIN' },
      { title: 'Position reconciled', body: `${data.evidence.positionBefore} → ${data.evidence.positionAfter} NO.`, evidence: 'position reconciliation', tag: 'STATE' },
      { title: 'No compensating write', body: 'Execution was favorable versus the submitted limit and fully reconciled.', evidence: 'policy: NO_ACTION', tag: 'POLICY' }
    ];
  }
  if (data.type === 'EXACT_MARKET_RESIDUAL_SETTLEMENT') {
    const residuals = data.evidence.residuals ?? [];
    return residuals.map((r, index) => ({
      title: r.redeemTxHash ? `Exact-market residual ${index + 1} redeemed` : `Residual ${index + 1} intentionally left untouched`,
      body: r.redeemTxHash ? `${r.balanceBeforeRaw} raw ${r.heldOutcome} resolved as winner and reconciled to ${r.balanceAfterRaw}.` : `${r.balanceBeforeRaw} raw ${r.heldOutcome} resolved losing with zero payout; no redeem was attempted.`,
      evidence: r.redeemTxHash ?? `market ${shortHash(r.marketId)} · payoutRaw ${r.payoutRaw}`,
      tag: r.redeemTxHash ? 'REDEEM' : 'NO WRITE'
    })).concat([{ title: 'Fresh authority remains unresolved', body: 'Historical claimability does not authorize a new redeem today.', evidence: 'fresh predicates + explicit human confirmation required', tag: 'POLICY' }]);
  }
  return [];
}

function publicTransactions(data) {
  if (data.evidence.tx) return Object.entries(data.evidence.tx);
  if (data.evidence.txHash) return [['execution', data.evidence.txHash]];
  if (Array.isArray(data.evidence.residuals)) {
    return data.evidence.residuals.filter((r) => r.redeemTxHash).map((r, i) => [`redeem-${i + 1}`, r.redeemTxHash]);
  }
  return [];
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function setActiveTab(tab) {
  state.activeTab = tab;
  $$('.case-tab').forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  $$('.tab-panel').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === tab));
}

function openEventDialog(event) {
  if (!event) return;
  setText('#dialog-kicker', `${event.tag ?? 'EVENT'} · EVIDENCE DETAIL`);
  setText('#dialog-title', event.title);
  setText('#dialog-body', event.body);
  setText('#dialog-evidence', event.evidence ?? 'No additional evidence string.');
  const dialog = $('#event-dialog');
  if (dialog?.showModal) dialog.showModal();
}

function renderTimeline(events) {
  const timeline = $('#timeline');
  if (!timeline) return;
  timeline.innerHTML = '';
  events.forEach((event, index) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `timeline-row${index === state.activeEvent ? ' is-active' : ''}`;
    row.innerHTML = `<small>${event.tag ?? `STEP ${index + 1}`}</small><strong>${event.title}</strong><p>${event.body}</p>`;
    row.addEventListener('click', () => {
      state.activeEvent = index;
      renderTimeline(events);
      renderEventChain(events);
      openEventDialog(event);
    });
    timeline.appendChild(row);
  });
}

function renderEventChain(events) {
  const chain = $('#event-chain');
  if (!chain) return;
  chain.innerHTML = '';
  events.slice(0, 5).forEach((event, index) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `event-row${index === state.activeEvent ? ' is-active' : ''}`;
    row.innerHTML = `<span class="event-dot"></span><span class="event-copy"><strong>${event.title}</strong><small>${event.body}</small></span><small>${event.tag ?? ''}</small>`;
    row.addEventListener('click', () => {
      state.activeEvent = index;
      renderEventChain(events);
      renderTimeline(events);
      openEventDialog(event);
    });
    chain.appendChild(row);
  });
}

function renderClaims(claims) {
  const table = $('#claims');
  if (!table) return;
  table.innerHTML = '';
  for (const [truth, label, claim, evidence] of claims) {
    const row = document.createElement('div');
    row.className = 'claim-row';
    row.innerHTML = `<div class="truth truth-${truth.toLowerCase()}">${truth}</div><div><b>${label}</b><span>${claim}</span></div><code>${shortHash(evidence)}</code>`;
    table.appendChild(row);
  }
}

function renderEvidenceLinks(data) {
  const links = $('#evidence-links');
  if (!links) return;
  links.innerHTML = '';
  const txs = publicTransactions(data);
  for (const [label, tx] of txs) {
    const a = document.createElement('a');
    a.href = `https://shannon-explorer.somnia.network/tx/${tx}`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.textContent = `${label.toUpperCase()} ↗ ${shortHash(tx)}`;
    links.appendChild(a);
  }
  if (!txs.length) {
    const note = document.createElement('span');
    note.textContent = data.evidence.sourceTxHashRedacted ? `Source tx: ${data.evidence.sourceTxHashRedacted} (public source redacts middle)` : 'No full public transaction hash in this captured source.';
    links.appendChild(note);
  }
}

function renderCase(index, { updateUrl = true } = {}) {
  if (!state.cases.length) return;
  state.active = Math.max(0, Math.min(index, state.cases.length - 1));
  state.activeEvent = 0;
  const data = state.cases[state.active];
  const result = browserAnalyze(data);
  const timeline = timelineForCase(data);
  const truthClass = data.provenance.truthClass ?? data.provenance.truth ?? 'CAPTURED_EVIDENCE';

  $$('#case-nav [data-case]').forEach((el, i) => el.classList.toggle('active', i === state.active));
  setText('#case-id', data.caseId);
  setText('#case-title', data.title);
  setText('#case-source', `${data.provenance.sourceRepository} · ${truthClass}`);
  setText('#intent', data.intent.expected ?? data.intent.summary ?? 'Intent captured in casefile.');
  setText('#reality', data.venueReality.summary);
  setText('#root-cause', result.rootCause.replaceAll('_', ' '));
  setText('#semantic', result.semantics.join(' + '));
  setText('#action', result.policy.action);
  setText('#policy-reason', result.policy.reason);
  setText('#hero-action', result.policy.action);
  setText('#reconcile', reconciliationText(data));
  setText('#event-chain-label', data.caseId);
  setText('#metric-action', result.policy.action);
  setText('#metric-write', result.policy.writeAuthorized ? 'Write authorized by grounded predicates' : 'No corrective write authorized');

  const counts = result.claims.reduce((acc, [truth]) => ({ ...acc, [truth]: (acc[truth] ?? 0) + 1 }), {});
  setText('#observed-count', String(counts.OBSERVED ?? 0));
  setText('#inferred-count', String(counts.INFERRED ?? 0));
  setText('#unknown-count', String(counts.UNKNOWN ?? 0));

  const writeLabel = result.policy.writeAuthorized ? 'WRITE AUTHORIZED' : 'WRITE REFUSED';
  ['#write-state', '#hero-write'].forEach((selector) => {
    const el = $(selector);
    if (!el) return;
    el.textContent = writeLabel;
    el.dataset.state = result.policy.writeAuthorized ? 'yes' : 'no';
  });

  renderClaims(result.claims);
  renderTimeline(timeline);
  renderEventChain(timeline);
  renderEvidenceLinks(data);
  setActiveTab(state.activeTab);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('case', data.caseId);
    history.replaceState(null, '', url);
  }
}

function buildCaseNav() {
  const nav = $('#case-nav');
  nav.innerHTML = '';
  state.cases.forEach((c, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.case = c.caseId;
    button.dataset.search = `${c.caseId} ${c.title} ${c.type}`.toLowerCase();
    button.innerHTML = `<span>${c.caseId}</span><strong>${c.title}</strong>`;
    button.addEventListener('click', () => renderCase(i));
    nav.appendChild(button);
  });
}

function initTabs() {
  $$('.case-tab').forEach((button) => button.addEventListener('click', () => setActiveTab(button.dataset.tab)));
  $('#jump-method')?.addEventListener('click', () => setActiveTab('method'));
}

function initSearchAndKeyboard() {
  const input = $('#case-search');
  input?.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    $$('#case-nav [data-case]').forEach((button) => button.classList.toggle('hidden', term && !button.dataset.search.includes(term)));
  });

  window.addEventListener('keydown', (event) => {
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (event.key === '/' && !typing) {
      event.preventDefault();
      input?.focus();
      return;
    }
    if (typing) return;
    if (event.key.toLowerCase() === 'j') renderCase((state.active + 1) % state.cases.length);
    if (event.key.toLowerCase() === 'k') renderCase((state.active - 1 + state.cases.length) % state.cases.length);
  });
}

async function shareCurrentCase() {
  const data = state.cases[state.active];
  const url = new URL(window.location.href);
  url.searchParams.set('case', data.caseId);
  try {
    await navigator.clipboard.writeText(url.toString());
    showToast(`${data.caseId} link copied`);
  } catch {
    window.prompt('Copy case link', url.toString());
  }
}

function exportCurrentCase() {
  const data = state.cases[state.active];
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${data.caseId.toLowerCase()}-public-case.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
  showToast(`${data.caseId} public case exported`);
}

function initNavigation() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $$('[data-scroll-target]').forEach((button) => button.addEventListener('click', () => scrollTo(button.dataset.scrollTarget)));
  $('#top-open-case')?.addEventListener('click', () => scrollTo('investigations'));
  $('#hero-explore')?.addEventListener('click', () => scrollTo('investigations'));
  $('#hero-live')?.addEventListener('click', () => scrollTo('live-readback'));
  $('#share-case')?.addEventListener('click', shareCurrentCase);
  $('#export-case')?.addEventListener('click', exportCurrentCase);
  $('#open-event-detail')?.addEventListener('click', () => openEventDialog(timelineForCase(state.cases[state.active])[state.activeEvent]));
}

async function rpc(method, params = []) {
  const response = await fetch(LIVE_SHANNON.rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC_${body.error.code ?? 'ERROR'}`);
  return body.result;
}

async function explorerTxFallback() {
  const response = await fetch(`${LIVE_SHANNON.explorerApiBase}${LIVE_SHANNON.publicCapturedTx}`, { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`EXPLORER_HTTP_${response.status}`);
  const body = await response.json();
  return {
    chainId: LIVE_SHANNON.expectedChainId,
    head: null,
    status: String(body.status ?? body.result ?? '').toLowerCase().includes('success') ? 'CONFIRMED' : String(body.status ?? body.result ?? 'UNKNOWN').toUpperCase(),
    confirmations: null,
    checkedAt: new Date().toISOString(),
    source: 'EXPLORER_FALLBACK'
  };
}

async function directRpcFallback() {
  const [chainHex, headHex, receipt] = await Promise.all([
    rpc('eth_chainId'),
    rpc('eth_blockNumber'),
    rpc('eth_getTransactionReceipt', [LIVE_SHANNON.publicCapturedTx])
  ]);
  const chainId = Number.parseInt(chainHex, 16);
  const head = Number.parseInt(headHex, 16);
  const receiptBlock = receipt?.blockNumber ? Number.parseInt(receipt.blockNumber, 16) : null;
  const receiptOk = receipt ? Number.parseInt(receipt.status ?? '0x0', 16) === 1 : false;
  return {
    chainId,
    head,
    status: receipt ? (receiptOk ? 'CONFIRMED' : 'REVERTED') : 'NOT FOUND',
    confirmations: receiptBlock == null ? null : Math.max(0, head - receiptBlock + 1),
    checkedAt: new Date().toISOString(),
    source: 'BROWSER_RPC_FALLBACK'
  };
}

function paintLive(data, { degraded = false } = {}) {
  const card = $('#live-readback');
  card?.classList.toggle('is-error', !data || data.ok === false);
  setText('#live-chain', data?.chainId == null ? String(LIVE_SHANNON.expectedChainId) : String(data.chainId));
  setText('#live-head', Number.isFinite(data?.head) ? data.head.toLocaleString() : '—');
  setText('#live-tx-status', data?.status ?? 'READ UNAVAILABLE');
  setText('#live-confirms', data?.confirmations == null ? '—' : Number(data.confirmations).toLocaleString());
  const timestamp = data?.checkedAt ? new Date(data.checkedAt).toLocaleTimeString() : new Date().toLocaleTimeString();
  setText('#live-read-state', data?.ok === false ? 'FAIL-CLOSED DISPLAY · NETWORK READ UNAVAILABLE · NO WRITE ATTEMPTED' : `${degraded ? 'FALLBACK' : 'LIVE'} · ${timestamp} · READ ONLY · NO WRITES`);
}

async function refreshLivePulse() {
  const button = $('#live-refresh');
  if (button) button.disabled = true;
  setText('#live-read-state', 'READING SHANNON · READ ONLY · NO WALLET · NO SIGNING');

  try {
    const response = await fetch(LIVE_SHANNON.api, { cache: 'no-store' });
    if (!response.ok) throw new Error(`API_HTTP_${response.status}`);
    const body = await response.json();
    if (!body.ok) throw new Error(body.error ?? 'API_READ_FAILED');
    paintLive({ chainId: body.chainId, head: body.blockNumber, status: body.txStatus, confirmations: body.confirmations, checkedAt: body.checkedAt, ok: true });
  } catch (apiError) {
    try {
      const direct = await directRpcFallback();
      paintLive({ ...direct, ok: direct.chainId === LIVE_SHANNON.expectedChainId }, { degraded: true });
    } catch (rpcError) {
      try {
        const explorer = await explorerTxFallback();
        paintLive({ ...explorer, ok: true }, { degraded: true });
      } catch (explorerError) {
        paintLive({ chainId: LIVE_SHANNON.expectedChainId, ok: false, checkedAt: new Date().toISOString() });
        console.warn('LIVE_SHANNON_READ_UNAVAILABLE', { apiError: apiError.message, rpcError: rpcError.message, explorerError: explorerError.message });
      }
    }
  } finally {
    if (button) button.disabled = false;
  }
}

function startLivePulse() {
  $('#live-refresh')?.addEventListener('click', refreshLivePulse);
  refreshLivePulse();
  if (state.liveTimer) clearInterval(state.liveTimer);
  state.liveTimer = setInterval(refreshLivePulse, LIVE_SHANNON.pollMs);
}

async function boot() {
  state.cases = await Promise.all(CASE_FILES.map(async (name) => {
    const response = await fetch(`/data/cases/${name}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`CASE_LOAD_FAILED_${name}_${response.status}`);
    return response.json();
  }));

  buildCaseNav();
  initTabs();
  initSearchAndKeyboard();
  initNavigation();

  const requestedCase = new URL(window.location.href).searchParams.get('case');
  const requestedIndex = state.cases.findIndex((item) => item.caseId === requestedCase);
  renderCase(requestedIndex >= 0 ? requestedIndex : 0, { updateUrl: requestedIndex < 0 });
  startLivePulse();
}

boot().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<pre style="padding:24px">BOOT_FAILED\n${error.stack}</pre>`;
});
