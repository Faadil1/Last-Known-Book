const REAL_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1771478298847-fa6b929478cd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2400',
  map: 'https://images.unsplash.com/photo-1503503330041-4cd943d2b61f?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1200',
  study: 'https://images.unsplash.com/photo-1673401188197-f88402d0b029?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1200',
  case1: 'https://images.unsplash.com/photo-1758813608902-8d7fe4037f4c?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400',
  case2: 'https://images.unsplash.com/photo-1771795172587-71ef788374e1?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400',
  case3: 'https://images.unsplash.com/photo-1772986809231-5a4462df1880?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400',
  case4: 'https://images.unsplash.com/photo-1761901364448-98d25941332e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1400'
};

const params = new URLSearchParams(window.location.search);
const WORKSPACE_MODE = params.has('case') || params.get('workspace') === '1';

function installAtlasStyles() {
  if (document.querySelector('link[data-atlas-room]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/atlas-room-v5.css';
  link.dataset.atlasRoom = 'v5';
  document.head.appendChild(link);
}

function routeTopNav() {
  const nav = document.querySelector('.topnav');
  if (!nav) return;
  nav.innerHTML = `
    <a class="nav-link${WORKSPACE_MODE ? ' is-active' : ''}" href="/investigations.html"${WORKSPACE_MODE ? ' aria-current="page"' : ''}>Cases</a>
    <a class="nav-link" href="/methodology.html">Methodology</a>
    <a class="nav-link" href="/proof.html">Proof</a>
    <a class="nav-link" href="/agent.html">Agent</a>
    <a class="nav-link" href="/docs.html">Docs</a>`;

  if (!document.querySelector('.atlas-mobile-nav')) {
    const details = document.createElement('details');
    details.className = 'atlas-mobile-nav';
    details.innerHTML = `
      <summary>Menu</summary>
      <div class="atlas-mobile-nav-panel">
        <a href="/">Home</a>
        <a href="/investigations.html">Case Files</a>
        <a href="/methodology.html">Methodology</a>
        <a href="/proof.html">Proof</a>
        <a href="/agent.html">Agent Interface</a>
        <a href="/docs.html">Judge Packet</a>
      </div>`;
    nav.insertAdjacentElement('afterend', details);
  }
}

function materializeAtlasHero() {
  document.body.classList.add('atlas-room-v4', WORKSPACE_MODE ? 'atlas-workspace-mode' : 'atlas-home-mode');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const title = document.getElementById('hero-title');
  const subhead = document.querySelector('.hero-subhead');
  const body = document.querySelector('.hero-body');
  const photo = document.querySelector('.hero-reference-photo');
  const primary = document.getElementById('hero-explore');
  const sample = document.getElementById('hero-sample');
  const topOpen = document.getElementById('top-open-case');
  const featureCards = [...document.querySelectorAll('.hero-feature')];

  if (eyebrow) eyebrow.textContent = 'POST-EXECUTION INCIDENT RESPONSE · DREAMDEX';
  if (title) title.innerHTML = 'The Atlas Room.';
  if (subhead) subhead.textContent = 'Know what happened before your agent acts again.';
  if (body) body.textContent = 'Last Known Book reconstructs venue reality after an unexpected execution, separates fact from inference, and returns a bounded next action backed by evidence.';
  if (primary) primary.firstChild.textContent = 'Open a Case ';
  if (sample) sample.textContent = 'How It Works';
  if (topOpen) topOpen.firstChild.textContent = 'Open a Case ';

  if (photo) {
    photo.src = REAL_IMAGES.hero;
    photo.alt = 'Editorial Atlas Room study environment used as contextual product imagery';
    photo.dataset.assetState = 'real-photo';
    photo.referrerPolicy = 'no-referrer';
  }

  const copy = [
    ['VENUE REALITY','Reconstruct what DreamDEX actually did.'],
    ['TRUTH CLASSES','Keep observed, inferred and unknown separate.'],
    ['BOUNDED AUTHORITY','Return a safe next action. Inference never spends.']
  ];
  featureCards.forEach((card,index) => {
    if (!copy[index]) return;
    card.querySelector('small') && (card.querySelector('small').textContent = copy[index][0]);
    card.querySelector('p') && (card.querySelector('p').textContent = copy[index][1]);
  });

  const hotspot = document.querySelector('.hotspot-main');
  if (hotspot) {
    hotspot.innerHTML = '<span class="hotspot-plus" aria-hidden="true">+</span><span class="hotspot-copy"><strong>Open the Case Room</strong><small>Start with LKB-001</small></span>';
    hotspot.setAttribute('aria-label','Open the Case Room and start with LKB-001');
  }
}

function installHomeIntentRouting() {
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('atlas-home-mode')) return;
    const caseButton = event.target.closest('[data-feature-case]');
    if (caseButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = `/?case=${encodeURIComponent(caseButton.dataset.featureCase)}`;
      return;
    }
    if (event.target.closest('#hero-explore, #top-open-case, .hotspot-main')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = '/?case=LKB-001';
      return;
    }
    if (event.target.closest('#hero-sample')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.querySelector('.atlas-explainer')?.scrollIntoView({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }, true);
}

function insertExplainer() {
  if (WORKSPACE_MODE || document.querySelector('.atlas-explainer')) return;
  const featured = document.querySelector('.featured-investigations');
  if (!featured) return;
  const section = document.createElement('section');
  section.className = 'atlas-explainer';
  section.id = 'how-it-works';
  section.innerHTML = `
    <div class="atlas-explainer-head">
      <small>ONE INCIDENT · THREE QUESTIONS</small>
      <h2>What happened? What do we actually know? What is safe to do next?</h2>
      <p>A judge should understand Last Known Book in under twenty seconds.</p>
    </div>
    <div class="atlas-explainer-grid">
      <article>
        <span>01</span><small>RECONSTRUCT</small>
        <h3>Venue reality</h3>
        <p>Read DreamDEX order events, lifecycle state, escrow and execution semantics to reconstruct what actually happened.</p>
      </article>
      <article>
        <span>02</span><small>CLASSIFY</small>
        <h3>Fact vs. inference</h3>
        <p>Every claim is separated into <b>OBSERVED</b>, <b>INFERRED</b> or <b>UNKNOWN</b>, so uncertainty stays visible.</p>
      </article>
      <article>
        <span>03</span><small>BOUND</small>
        <h3>The next action</h3>
        <p>Return <b>NO_ACTION</b>, <b>RETRY_READ</b> or <b>ESCALATE</b> plus an Authority Receipt. Inference alone cannot move funds.</p>
      </article>
    </div>`;
  featured.before(section);
}

function replaceFeaturedCasesWithVisualDossiers() {
  const section = document.querySelector('.featured-investigations');
  const cards = [...document.querySelectorAll('.featured-card')];
  if (!section || !cards.length) return;

  const title = section.querySelector('#featured-investigations-title');
  if (title) title.textContent = 'Featured Case Files';
  const eyebrow = section.querySelector('.featured-header > div > p');
  if (eyebrow) eyebrow.textContent = 'FOUR WAYS AN EXECUTION CAN NEED EXPLANATION.';
  const aside = section.querySelector('.featured-header > p');
  if (aside) aside.textContent = 'Captured Shannon incident classes · open any case';

  const rows = [
    ['case1','LKB-001','Mint + Indexer Lag','MINT_A_PAIR is confirmed on-chain while the indexed view is not yet authoritative.'],
    ['case2','LKB-002','Resting Sell Escrow','Inventory looks missing because the venue is holding it, not because funds disappeared.'],
    ['case3','LKB-003','Fill Dislocation','Expected and actual execution differ, but the state reconciles without a corrective write.'],
    ['case4','LKB-004','Settlement Residual','Lifecycle-aware reconciliation determines whether a residual is actionable or must stay untouched.']
  ];

  cards.forEach((card,index) => {
    const [imageKey,caseId,caseTitle,summary] = rows[index];
    card.innerHTML = `<img class="case-photo" src="${REAL_IMAGES[imageKey]}" alt="Editorial context image for ${caseId}" loading="lazy" referrerpolicy="no-referrer" /><span class="featured-copy"><small>${caseId}</small><strong>${caseTitle}</strong><span>${summary}</span></span><span class="featured-arrow" aria-hidden="true">→</span>`;
  });
  const footer = section.querySelector('.featured-foot');
  if (footer) footer.textContent = 'OPEN A CASE → SEE EVIDENCE → UNDERSTAND THE DECISION.';
}

function insertTruthBand() {
  if (WORKSPACE_MODE || document.querySelector('.atlas-truth-band')) return;
  const shell = document.getElementById('investigations');
  if (!shell) return;
  const section = document.createElement('section');
  section.className = 'atlas-truth-band';
  section.innerHTML = `
    <div class="atlas-truth-band-inner">
      <div class="thesis"><small>JUDGE FAST LANE</small><strong>Evidence you can verify, boundaries we do not hide.</strong></div>
      <div class="truth-item"><small>NETWORK</small><strong>Somnia Shannon · 50312</strong></div>
      <div class="truth-item"><small>REAL PROOF</small><strong>PostOnly → Rest → Exact Cancel</strong></div>
      <div class="truth-item"><small>CASE CORPUS</small><strong>4 captured incident classes</strong></div>
      <div class="truth-item"><small>AGENT SURFACE</small><strong>API · MCP · CLI</strong></div>
    </div>`;
  shell.before(section);
}

function insertDreamDexNote() {
  if (WORKSPACE_MODE || document.querySelector('.atlas-dreamdex-note')) return;
  const shell = document.getElementById('investigations');
  if (!shell) return;
  const note = document.createElement('section');
  note.className = 'atlas-dreamdex-note';
  note.innerHTML = `
    <div><small>WHY DREAMDEX IS LOAD-BEARING</small><h2>The venue semantics change the answer.</h2></div>
    <div>
      <p>This is not generic transaction analytics. Last Known Book uses DreamDEX Event Contract semantics as causal evidence: durable market identity, lifecycle state, MINT_A_PAIR, resting escrow and native order events determine both the explanation and whether another action is justified.</p>
      <div class="atlas-dreamdex-primitives"><span>marketId</span><span>lifecycle</span><span>MINT_A_PAIR</span><span>resting escrow</span><span>OrderPlaced / Rested / Cancelled</span></div>
      <div class="atlas-dreamdex-links"><a href="/methodology.html">See the method →</a><a href="/proof.html">Inspect proof →</a><a href="/agent.html">Agent interface →</a></div>
    </div>`;
  shell.before(note);
}

function installWorkspaceIntro() {
  if (!WORKSPACE_MODE || document.querySelector('.atlas-workspace-intro')) return;
  const shell = document.getElementById('investigations');
  if (!shell) return;
  const intro = document.createElement('section');
  intro.className = 'atlas-workspace-intro';
  intro.innerHTML = `
    <div><small>CASE ROOM</small><h1>Reconstruct the execution.</h1></div>
    <div><p>Pick a captured incident, inspect the evidence, then follow the causal path to the bounded next action.</p><a href="/">← Back to overview</a></div>`;
  shell.before(intro);
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
installHomeIntentRouting();

queueMicrotask(() => {
  if (!WORKSPACE_MODE) {
    insertExplainer();
    replaceFeaturedCasesWithVisualDossiers();
    insertTruthBand();
    insertDreamDexNote();
  } else {
    installWorkspaceIntro();
  }
  upgradeProofEntry();
});
