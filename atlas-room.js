const REAL_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1771478298847-fa6b929478cd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2400',
  map: 'https://images.unsplash.com/photo-1503503330041-4cd943d2b61f?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1200',
  study: 'https://images.unsplash.com/photo-1673401188197-f88402d0b029?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1200',
  case1: 'https://images.unsplash.com/photo-1758813608902-8d7fe4037f4c?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400',
  case2: 'https://images.unsplash.com/photo-1771795172587-71ef788374e1?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400',
  case3: 'https://images.unsplash.com/photo-1772986809231-5a4462df1880?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400',
  case4: 'https://images.unsplash.com/photo-1761901364448-98d25941332e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400'
};

function installAtlasStyles() {
  if (document.querySelector('link[data-atlas-room]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/atlas-room.css';
  link.dataset.atlasRoom = 'v4';
  document.head.appendChild(link);
}

function routeTopNav() {
  const nav = document.querySelector('.topnav');
  if (!nav) return;
  const methodology = nav.querySelector('[data-scroll-target="methodology"]');
  const proof = nav.querySelector('[data-scroll-target="proof"]');
  if (methodology) {
    methodology.removeAttribute('data-scroll-target');
    methodology.addEventListener('click', () => { window.location.href = '/methodology.html'; });
  }
  if (proof) {
    proof.removeAttribute('data-scroll-target');
    proof.addEventListener('click', () => { window.location.href = '/proof.html'; });
  }
  if (!nav.querySelector('[data-atlas-agent-link]')) {
    const agent = document.createElement('a');
    agent.className = 'nav-link';
    agent.href = '/agent.html';
    agent.dataset.atlasAgentLink = 'true';
    agent.textContent = 'Agent';
    nav.insertBefore(agent, nav.querySelector('a[href="/docs.html"]'));
  }
}

function materializeAtlasHero() {
  document.body.classList.add('atlas-room-v4');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const title = document.getElementById('hero-title');
  const subhead = document.querySelector('.hero-subhead');
  const body = document.querySelector('.hero-body');
  const photo = document.querySelector('.hero-reference-photo');
  const sample = document.getElementById('hero-sample');
  const featureCards = [...document.querySelectorAll('.hero-feature')];
  if (eyebrow) eyebrow.textContent = 'MARKETS HAPPEN EVERYWHERE · WE FOLLOW THEM FURTHER.';
  if (title) title.innerHTML = 'The Atlas Room.';
  if (subhead) subhead.textContent = 'Investigate across chains. Connect the real story.';
  if (body) body.textContent = 'Last Known Book reconstructs autonomous market events into clear, verifiable narratives — giving you the context, evidence and safe next action without turning inference into authority.';
  if (sample) sample.textContent = 'Explore the Atlas';
  if (photo) {
    photo.src = REAL_IMAGES.hero;
    photo.alt = 'Real editorial study scene with desk, globe, books and window light used as the Atlas Room investigation environment';
    photo.dataset.assetState = 'real-photo';
    photo.referrerPolicy = 'no-referrer';
  }
  const copy = [
    ['REAL EVENTS','From fragmented data to complete timelines.'],
    ['VERIFIED EVIDENCE','Grounded in on-chain data and real-world context.'],
    ['AGENT READY','API · MCP · CLI for analysts, researchers and trading teams.']
  ];
  featureCards.forEach((card,index) => {
    card.querySelector('small') && (card.querySelector('small').textContent = copy[index][0]);
    card.querySelector('p') && (card.querySelector('p').textContent = copy[index][1]);
  });
  const hotspot = document.querySelector('.hotspot-main');
  if (hotspot) {
    hotspot.innerHTML = '<span class="hotspot-plus" aria-hidden="true">+</span><span class="hotspot-copy"><strong>Open the Atlas</strong><small>Enter a real investigation</small></span>';
    hotspot.setAttribute('aria-label','Open the Atlas and enter an investigation');
  }
}

function insertAtlasIndex() {
  if (document.querySelector('.atlas-index')) return;
  const featured = document.querySelector('.featured-investigations');
  if (!featured) return;
  const section = document.createElement('section');
  section.className = 'atlas-index';
  section.setAttribute('aria-label','Atlas Room pathways');
  section.innerHTML = `
    <div class="atlas-index-grid">
      <a class="atlas-index-card" href="#investigations">
        <div><small>ENTER THE CASE FILES</small><h3>Investigations</h3><p>Reconstruct complex market events across chains, contracts and time.</p><span class="atlas-link">EXPLORE INVESTIGATIONS →</span></div>
        <img src="${REAL_IMAGES.map}" alt="Real world map used as an investigation context reference" loading="lazy" referrerpolicy="no-referrer" />
      </a>
      <a class="atlas-index-card" href="/methodology.html">
        <div><small>OPEN PROCESS</small><h3>Methodology</h3><p>Structured analysis from raw evidence to a bounded operational decision.</p><span class="atlas-link">SEE OUR METHODOLOGY →</span></div>
        <img src="${REAL_IMAGES.study}" alt="Real study and map workspace representing the investigation methodology" loading="lazy" referrerpolicy="no-referrer" />
      </a>
      <a class="atlas-index-card" href="/proof.html">
        <div><small>VERIFY THE CLAIM</small><h3>Proof</h3><p>Testnet behavior, commitment data, public facts and explicit claim boundaries.</p><span class="atlas-link">VIEW PROOF STANDARDS →</span></div>
        <img src="${REAL_IMAGES.map}" alt="Real map and desk detail representing verifiable proof context" loading="lazy" referrerpolicy="no-referrer" />
      </a>
      <a class="atlas-index-card agent-preview" href="/agent.html">
        <div><small>AGENT-NATIVE</small><h3>Agent Interface</h3><p>Bring your own incident through API, MCP or CLI and receive an Authority Receipt.</p><span class="atlas-link">LEARN ABOUT AGENTS →</span></div>
        <img src="${REAL_IMAGES.hero}" alt="Real desk environment representing the agent investigation layer" loading="lazy" referrerpolicy="no-referrer" />
      </a>
    </div>`;
  featured.before(section);
}

function replaceFeaturedCasesWithVisualDossiers() {
  const cards = [...document.querySelectorAll('.featured-card')];
  if (!cards.length) return;
  const rows = [
    ['case1','LKB-001','Execution Incident','MINT_A_PAIR + indexer divergence.'],
    ['case2','LKB-002','Liquidity / Escrow','Resting SELL inventory can look missing while still being committed.'],
    ['case3','LKB-003','Fill Dislocation','Expected-vs-actual execution can reconcile without a corrective write.'],
    ['case4','LKB-004','Settlement Review','Exact-market residuals require lifecycle-aware reconciliation.']
  ];
  cards.forEach((card,index) => {
    const [imageKey,caseId,title,summary] = rows[index];
    card.innerHTML = `<img class="case-photo" src="${REAL_IMAGES[imageKey]}" alt="Editorial context image for ${caseId} ${title}" loading="lazy" referrerpolicy="no-referrer" /><span class="featured-copy"><small>${caseId}</small><strong>${title}</strong><span>${summary}</span></span><span class="featured-arrow" aria-hidden="true">→</span>`;
  });
  const footer = document.querySelector('.featured-foot');
  if (footer) footer.textContent = 'REAL DATA · REAL CONTEXT · REAL DECISIONS.';
}

function insertTruthBand() {
  if (document.querySelector('.atlas-truth-band')) return;
  const shell = document.getElementById('investigations');
  if (!shell) return;
  const section = document.createElement('section');
  section.className = 'atlas-truth-band';
  section.innerHTML = `
    <div class="atlas-truth-band-inner">
      <div class="thesis">When an agent gets the execution wrong, the worst next step is a second wrong action.</div>
      <div class="truth-item"><small>NETWORK</small><strong>Shannon 50312</strong></div>
      <div class="truth-item"><small>INCIDENT CORPUS</small><strong>4 captured classes</strong></div>
      <div class="truth-item"><small>AUTHORITY</small><strong>Inference cannot spend</strong></div>
      <div class="truth-item"><small>AGENT SURFACE</small><strong>API · MCP · CLI</strong></div>
    </div>`;
  shell.before(section);
}

function insertDreamDexNote() {
  if (document.querySelector('.atlas-dreamdex-note')) return;
  const shell = document.getElementById('investigations');
  if (!shell) return;
  const note = document.createElement('section');
  note.className = 'atlas-dreamdex-note';
  note.innerHTML = `
    <div><small>WHY DREAMDEX IS LOAD-BEARING</small><h2>This is not a generic forensic dashboard.</h2></div>
    <div><p>Last Known Book uses DreamDEX Event Contract semantics as causal evidence. Durable market identity, lifecycle state, MINT_A_PAIR, resting escrow and native order events determine what happened — and whether doing anything next is justified.</p><div class="atlas-dreamdex-primitives"><span>marketId</span><span>rolling pool binding</span><span>lifecycle</span><span>MINT_A_PAIR</span><span>resting escrow</span><span>OrderPlaced / Rested / Cancelled</span></div></div>`;
  shell.before(note);
}

function upgradeProofEntry() {
  const link = document.querySelector('.proof-card a');
  if (link) {
    link.href = '/proof.html';
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.textContent = 'Open the proof room →';
  }
}

installAtlasStyles();
routeTopNav();
materializeAtlasHero();
queueMicrotask(() => {
  insertAtlasIndex();
  replaceFeaturedCasesWithVisualDossiers();
  insertTruthBand();
  insertDreamDexNote();
  upgradeProofEntry();
});
