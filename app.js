const CASE_FILES = [
  'mint-pair-indexer-lag.json',
  'resting-sell-escrow.json',
  'expected-vs-actual.json',
  'exact-market-residual-settlement.json'
];

const LIVE_SHANNON = {
  rpc: 'https://dream-rpc.somnia.network/',
  expectedChainId: 50312,
  publicCapturedTx: '0xbe1b148423553b21f7c4177248dc6be19406e1416b1f065cc556279de4da03be',
  explorerApiBase: 'https://shannon-explorer.somnia.network/api/v2/transactions/',
  pollMs: 15000
};

const state = { cases: [], active: 0, liveTimer: null };

function money(n, digits = 6) { return Number(n).toFixed(digits); }

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
      ['UNKNOWN', 'Why counterparties chose their prices', 'Not required for reconciliation', '—']
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

function shortHash(value) {
  if (!value || typeof value !== 'string') return value;
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function reconciliationText(data) {
  if (data.reconciliation?.finalState) return data.reconciliation.finalState;
  if (data.type === 'EXACT_MARKET_RESIDUAL_SETTLEMENT') {
    return `${data.reconciliation.winningResidualsRedeemed ?? 0} winning residuals redeemed, ${data.reconciliation.knownZeroValueResidualsSkipped ?? 0} zero-value residual skipped, ${data.reconciliation.repeatWritesRequired ?? 0} repeat writes required.`;
  }
  return 'Reconciliation evidence available in the captured casefile.';
}

function renderCase(index) {
  state.active = index;
  const data = state.cases[index];
  const result = browserAnalyze(data);
  document.querySelectorAll('[data-case]').forEach((el, i) => el.classList.toggle('active', i === index));
  document.querySelector('#case-id').textContent = data.caseId;
  document.querySelector('#case-title').textContent = data.title;
  const truthClass = data.provenance.truthClass ?? data.provenance.truth ?? 'CAPTURED_EVIDENCE';
  document.querySelector('#case-source').textContent = `${data.provenance.sourceRepository} · ${truthClass}`;
  document.querySelector('#intent').textContent = data.intent.expected ?? data.intent.summary ?? 'Intent captured in casefile.';
  document.querySelector('#reality').textContent = data.venueReality.summary;
  document.querySelector('#root-cause').textContent = result.rootCause.replaceAll('_', ' ');
  document.querySelector('#semantic').textContent = result.semantics.join(' + ');
  document.querySelector('#action').textContent = result.policy.action;
  document.querySelector('#policy-reason').textContent = result.policy.reason;
  document.querySelector('#write-state').textContent = result.policy.writeAuthorized ? 'WRITE AUTHORIZED' : 'WRITE REFUSED';
  document.querySelector('#write-state').dataset.state = result.policy.writeAuthorized ? 'yes' : 'no';
  document.querySelector('#hero-action').textContent = result.policy.action;
  document.querySelector('#hero-write').textContent = result.policy.writeAuthorized ? 'WRITE AUTHORIZED' : 'WRITE REFUSED';
  document.querySelector('#hero-write').dataset.state = result.policy.writeAuthorized ? 'yes' : 'no';
  document.querySelector('#reconcile').textContent = reconciliationText(data);

  const table = document.querySelector('#claims');
  table.innerHTML = '';
  for (const [truth, label, claim, evidence] of result.claims) {
    const row = document.createElement('div');
    row.className = 'claim-row';
    row.innerHTML = `<div class="truth truth-${truth.toLowerCase()}">${truth}</div><div><b>${label}</b><span>${claim}</span></div><code>${shortHash(evidence)}</code>`;
    table.appendChild(row);
  }

  const links = document.querySelector('#evidence-links');
  links.innerHTML = '';
  let txs = [];
  if (data.evidence.tx) txs = Object.entries(data.evidence.tx);
  else if (data.evidence.txHash) txs = [['execution', data.evidence.txHash]];
  else if (Array.isArray(data.evidence.residuals)) {
    txs = data.evidence.residuals
      .filter((r) => r.redeemTxHash)
      .map((r, i) => [`redeem-${i + 1}`, r.redeemTxHash]);
  }
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
    note.textContent = data.evidence.sourceTxHashRedacted ? `Source tx: ${data.evidence.sourceTxHashRedacted} (public source redacts middle)` : 'No full tx hash in captured source.';
    links.appendChild(note);
  }
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
  const response = await fetch(`${LIVE_SHANNON.explorerApiBase}${LIVE_SHANNON.publicCapturedTx}`, {
    headers: { accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`EXPLORER_HTTP_${response.status}`);
  const body = await response.json();
  return {
    status: String(body.status ?? body.result ?? '').toLowerCase().includes('success') ? 'CONFIRMED' : String(body.status ?? body.result ?? 'UNKNOWN').toUpperCase(),
    block: Number(body.block_number ?? body.block ?? 0) || null,
    source: 'EXPLORER_FALLBACK'
  };
}

function setLiveText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

async function refreshLivePulse() {
  const button = document.querySelector('#live-refresh');
  if (button) button.disabled = true;
  setLiveText('#live-read-state', 'READING SHANNON · READ ONLY · NO WALLET · NO SIGNING');

  try {
    const [chainHex, headHex, receipt] = await Promise.all([
      rpc('eth_chainId'),
      rpc('eth_blockNumber'),
      rpc('eth_getTransactionReceipt', [LIVE_SHANNON.publicCapturedTx])
    ]);

    const chainId = Number.parseInt(chainHex, 16);
    const head = Number.parseInt(headHex, 16);
    const receiptBlock = receipt?.blockNumber ? Number.parseInt(receipt.blockNumber, 16) : null;
    const receiptOk = receipt ? Number.parseInt(receipt.status ?? '0x0', 16) === 1 : false;
    const confirmations = receiptBlock == null ? null : Math.max(0, head - receiptBlock + 1);

    setLiveText('#live-chain', String(chainId));
    setLiveText('#live-head', Number.isFinite(head) ? head.toLocaleString() : '—');
    setLiveText('#live-tx-status', receipt ? (receiptOk ? 'CONFIRMED' : 'REVERTED') : 'NOT FOUND');
    setLiveText('#live-confirms', confirmations == null ? '—' : confirmations.toLocaleString());

    const chainOk = chainId === LIVE_SHANNON.expectedChainId;
    setLiveText('#live-read-state', `${chainOk ? 'LIVE' : 'CHAIN MISMATCH'} · ${new Date().toLocaleTimeString()} · READ ONLY · NO WRITES`);
  } catch (rpcError) {
    try {
      const fallback = await explorerTxFallback();
      setLiveText('#live-chain', String(LIVE_SHANNON.expectedChainId));
      setLiveText('#live-head', 'RPC N/A');
      setLiveText('#live-tx-status', fallback.status);
      setLiveText('#live-confirms', fallback.block ? `BLOCK ${fallback.block.toLocaleString()}` : '—');
      setLiveText('#live-read-state', `EXPLORER FALLBACK · ${new Date().toLocaleTimeString()} · READ ONLY`);
    } catch (explorerError) {
      setLiveText('#live-chain', String(LIVE_SHANNON.expectedChainId));
      setLiveText('#live-head', 'UNAVAILABLE');
      setLiveText('#live-tx-status', 'READ UNAVAILABLE');
      setLiveText('#live-confirms', '—');
      setLiveText('#live-read-state', 'FAIL-CLOSED DISPLAY · NETWORK READ UNAVAILABLE · NO WRITE ATTEMPTED');
      console.warn('LIVE_SHANNON_READ_UNAVAILABLE', { rpcError: rpcError.message, explorerError: explorerError.message });
    }
  } finally {
    if (button) button.disabled = false;
  }
}

function startLivePulse() {
  const button = document.querySelector('#live-refresh');
  if (!button) return;
  button.addEventListener('click', refreshLivePulse);
  refreshLivePulse();
  if (state.liveTimer) clearInterval(state.liveTimer);
  state.liveTimer = setInterval(refreshLivePulse, LIVE_SHANNON.pollMs);
}

async function boot() {
  state.cases = await Promise.all(CASE_FILES.map(async (name) => {
    const r = await fetch(`/data/cases/${name}`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`CASE_LOAD_FAILED_${name}_${r.status}`);
    return r.json();
  }));

  const nav = document.querySelector('#case-nav');
  state.cases.forEach((c, i) => {
    const button = document.createElement('button');
    button.dataset.case = c.caseId;
    button.innerHTML = `<span>${c.caseId}</span><strong>${c.title}</strong>`;
    button.addEventListener('click', () => renderCase(i));
    nav.appendChild(button);
  });
  renderCase(0);
  startLivePulse();
}

boot().catch((error) => {
  document.body.innerHTML = `<pre>BOOT_FAILED\n${error.stack}</pre>`;
});
