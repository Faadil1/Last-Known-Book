const facts = document.getElementById('proof-commitment-facts');

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
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
