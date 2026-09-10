const facts = document.getElementById('proof-commitment-facts');
const liveWitnesses = document.getElementById('live-proof-witnesses');
const refreshLive = document.getElementById('refresh-live-proof');

const LIVE_PROOF = {
  rpc: 'https://dream-rpc.somnia.network/',
  expectedChainId: 50312,
  publicCapturedTx: '0xbe1b148423553b21f7c4177248dc6be19406e1416b1f065cc556279de4da03be',
  dreamDexModule: '0x3ecC694Cef705358864a646142ac17A90E29e388',
  tUSDC: '0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E',
  decimalsSelector: '0x313ce567'
};

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));
}

function shortSha(value) {
  return `${String(value).slice(0,12)}…`;
}

function proofClassLabel(value) {
  return String(value)
    .replace(/_PASS$/, '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

async function rpc(method, params = []) {
  const response = await fetch(LIVE_PROOF.rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: `${method}-${Date.now()}`, method, params }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`${method} HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || `${method} failed`);
  return payload.result;
}

function hexNumber(value) {
  if (!value || typeof value !== 'string') return null;
  const parsed = Number.parseInt(value, 16);
  return Number.isFinite(parsed) ? parsed : null;
}

function witness(label, value, detail, tone = 'pass') {
  return `<div class="live-witness" data-tone="${tone}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong><span>${escapeHtml(detail)}</span></div>`;
}

async function runLiveWitnesses() {
  if (!liveWitnesses) return;
  liveWitnesses.dataset.state = 'loading';
  if (refreshLive) {
    refreshLive.disabled = true;
    refreshLive.textContent = 'CHECKING…';
  }

  try {
    const [chainHex, blockHex, receipt, moduleCode, decimalsHex] = await Promise.all([
      rpc('eth_chainId'),
      rpc('eth_blockNumber'),
      rpc('eth_getTransactionReceipt', [LIVE_PROOF.publicCapturedTx]),
      rpc('eth_getCode', [LIVE_PROOF.dreamDexModule, 'latest']),
      rpc('eth_call', [{ to: LIVE_PROOF.tUSDC, data: LIVE_PROOF.decimalsSelector }, 'latest'])
    ]);

    const chainId = hexNumber(chainHex);
    const block = hexNumber(blockHex);
    const receiptStatus = receipt ? hexNumber(receipt.status) : null;
    const receiptBlock = receipt ? hexNumber(receipt.blockNumber) : null;
    const modulePresent = typeof moduleCode === 'string' && moduleCode !== '0x' && moduleCode.length > 4;
    const decimals = hexNumber(decimalsHex);

    const rows = [
      witness(
        'NETWORK',
        chainId === LIVE_PROOF.expectedChainId ? `Shannon · ${chainId}` : `Unexpected chain · ${chainId ?? 'UNKNOWN'}`,
        block ? `Live block #${block.toLocaleString()}` : 'Block unavailable',
        chainId === LIVE_PROOF.expectedChainId && block ? 'pass' : 'boundary'
      ),
      witness(
        'PUBLIC CAPTURED TX · LKB-003',
        receiptStatus === 1 ? 'Receipt success' : receipt ? 'Receipt not successful' : 'Receipt unavailable',
        receiptBlock ? `Observed in block #${receiptBlock.toLocaleString()}` : 'Captured-case witness only; not Packet 003',
        receiptStatus === 1 ? 'pass' : 'boundary'
      ),
      witness(
        'DREAMDEX MODULE',
        modulePresent ? 'Deployed bytecode present' : 'Bytecode unavailable',
        'BinaryMarketsModule · live eth_getCode',
        modulePresent ? 'pass' : 'boundary'
      ),
      witness(
        'tUSDC UNITS',
        decimals === 6 ? '6 decimals verified' : `Decimals ${decimals ?? 'UNKNOWN'}`,
        'Live ERC-20 decimals() read',
        decimals === 6 ? 'pass' : 'boundary'
      )
    ];

    liveWitnesses.innerHTML = rows.join('');
    liveWitnesses.dataset.state = 'ready';
  } catch (error) {
    liveWitnesses.innerHTML = [
      witness('LIVE STATUS', 'UNAVAILABLE — FAIL CLOSED', 'No live pass is claimed when the RPC cannot be verified.', 'boundary'),
      witness('SAFETY', 'READ-ONLY PATH PRESERVED', 'No wallet, signing or broadcast method is used.', 'pass')
    ].join('');
    liveWitnesses.dataset.state = 'unavailable';
  } finally {
    if (refreshLive) {
      refreshLive.disabled = false;
      refreshLive.textContent = 'REFRESH LIVE';
    }
  }
}

try {
  const response = await fetch('/evidence/SHANNON-PROOF-003-COMMITMENT.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`commitment ${response.status}`);
  const data = await response.json();
  const classes = data.proofClass.map(proofClassLabel).join(' · ');
  const privateBundle = data.privateCanonicalBundle;
  const redaction = data.redaction;

  facts.innerHTML = `
    <div class="commitment-fact" data-tone="pass"><small>PROOF ID</small><strong>${escapeHtml(data.proofId)}</strong></div>
    <div class="commitment-fact" data-tone="pass"><small>NETWORK</small><strong>${escapeHtml(data.network)} · ${escapeHtml(data.chainId)}</strong></div>
    <div class="commitment-fact" data-tone="pass"><small>PROOF CLASSES</small><strong>${escapeHtml(classes)}</strong></div>
    <div class="commitment-fact"><small>GIT BLOB FINGERPRINT</small><strong>${escapeHtml(shortSha(privateBundle.gitBlobSha1))}</strong></div>
    <div class="commitment-fact"><small>CANONICAL MERGE</small><strong>${escapeHtml(shortSha(privateBundle.canonicalProofMergeCommit))}</strong></div>
    <div class="commitment-fact"><small>COMMITMENT TYPE</small><strong>Git object + canonical commit reference</strong></div>
    <div class="commitment-fact" data-tone="boundary"><small>PRODUCTION EVIDENCE</small><strong>${escapeHtml(data.productionEvidence)}</strong></div>
    <div class="commitment-fact" data-tone="pass"><small>PRIVATE IDENTIFIERS</small><strong>${redaction.walletAddressPublishedHere || redaction.transactionHashesPublishedHere || redaction.orderIdPublishedHere ? 'DISCLOSED' : 'NOT DISCLOSED'}</strong></div>
    <div class="commitment-fact" data-tone="pass"><small>PUBLIC FACT</small><strong>Exact returned order cancelled · collateral restored exactly</strong></div>`;
} catch (error) {
  facts.innerHTML = '<div class="commitment-fact" data-tone="boundary"><small>STATUS</small><strong>Commitment unavailable — fail closed</strong></div>';
}

refreshLive?.addEventListener('click', runLiveWitnesses);
runLiveWitnesses();
