const facts = document.getElementById('proof-commitment-facts');
const raw = document.getElementById('proof-commitment-json');

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
}

try {
  const response = await fetch('/evidence/SHANNON-PROOF-003-COMMITMENT.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`commitment ${response.status}`);
  const data = await response.json();
  facts.innerHTML = `
    <div class="proof-fact"><small>PROOF ID</small><strong>${escapeHtml(data.proofId)}</strong></div>
    <div class="proof-fact"><small>CHAIN</small><strong>${escapeHtml(data.network)} · ${escapeHtml(data.chainId)}</strong></div>
    <div class="proof-fact"><small>COMMITMENT TYPE</small><strong>${escapeHtml(data.privateCanonicalBundle.commitmentType)}</strong></div>
    <div class="proof-fact"><small>GIT BLOB</small><strong>${escapeHtml(data.privateCanonicalBundle.gitBlobSha1.slice(0,12))}…</strong></div>
    <div class="proof-fact"><small>CANONICAL MERGE</small><strong>${escapeHtml(data.privateCanonicalBundle.canonicalProofMergeCommit.slice(0,12))}…</strong></div>
    <div class="proof-fact"><small>PROOF CLASS</small><strong>${escapeHtml(data.proofClass.map((item) => item.replaceAll('_',' ')).join(' · '))}</strong></div>`;
  raw.textContent = JSON.stringify(data, null, 2);
} catch (error) {
  facts.innerHTML = '<div class="proof-fact"><small>STATUS</small><strong>Commitment unavailable — fail closed</strong></div>';
  raw.textContent = String(error);
}
