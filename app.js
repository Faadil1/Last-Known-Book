const CASE_FILES = [
  'mint-pair-indexer-lag.json',
  'resting-sell-escrow.json',
  'expected-vs-actual.json'
];

const state = { cases: [], active: 0 };

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

  return { claims, rootCause, semantics, policy };
}

function shortHash(value) {
  if (!value || typeof value !== 'string') return value;
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function renderCase(index) {
  state.active = index;
  const data = state.cases[index];
  const result = browserAnalyze(data);
  document.querySelectorAll('[data-case]').forEach((el, i) => el.classList.toggle('active', i === index));
  document.querySelector('#case-id').textContent = data.caseId;
  document.querySelector('#case-title').textContent = data.title;
  document.querySelector('#case-source').textContent = `${data.provenance.sourceRepository} · ${data.provenance.truthClass}`;
  document.querySelector('#intent').textContent = data.intent.expected;
  document.querySelector('#reality').textContent = data.venueReality.summary;
  document.querySelector('#root-cause').textContent = result.rootCause.replaceAll('_', ' ');
  document.querySelector('#semantic').textContent = result.semantics.join(' + ');
  document.querySelector('#action').textContent = result.policy.action;
  document.querySelector('#policy-reason').textContent = result.policy.reason;
  document.querySelector('#write-state').textContent = result.policy.writeAuthorized ? 'WRITE AUTHORIZED' : 'WRITE REFUSED';
  document.querySelector('#write-state').dataset.state = result.policy.writeAuthorized ? 'yes' : 'no';
  document.querySelector('#reconcile').textContent = data.reconciliation.finalState;

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
  const txs = data.evidence.tx ? Object.entries(data.evidence.tx) : data.evidence.txHash ? [['execution', data.evidence.txHash]] : [];
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

async function boot() {
  state.cases = await Promise.all(CASE_FILES.map(async (name) => {
    const r = await fetch(`/data/cases/${name}`, { cache: 'no-store' });
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
}

boot().catch((error) => {
  document.body.innerHTML = `<pre>BOOT_FAILED\n${error.stack}</pre>`;
});
