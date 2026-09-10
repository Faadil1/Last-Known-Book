# Last Known Book — Atlas Room V4 Design Contract

Status: **USER SELECTED · IMPLEMENTED ON REVERSIBLE BRANCH · RUNTIME RECHECK REQUIRED**

## Why this direction exists

The previous warm-binder direction improved realism, but the product still read too much like a polished landing page around a single hero image. Atlas Room reframes Last Known Book as an investigation environment: a place where fragmented market evidence is mapped, reconstructed, proven, and handed back to humans or agents with an explicit authority boundary.

The selected reference is treated as a **composition and interaction direction only**. It is not shipped as one flattened screenshot. All navigation, hero copy, CTAs, investigation cards, Methodology, Proof, Agent Interface, evidence controls and case interactions remain live DOM.

## TRACE design principles carried forward

- domain-native, not generic AI/trading-terminal aesthetics;
- editorial hierarchy before feature density;
- physical evidence / cartographic metaphor without claiming cross-chain proof that does not exist;
- real photographic image sources rather than a screenshot as the runtime surface;
- proof and methodology become destinations, not decorative labels;
- interaction is restrained and purposeful;
- reduced-motion remains truthful;
- visual polish must never imply stronger technical evidence than the product actually has.

## Additional product-lifting decisions

1. **Removed unsupported vanity metrics from the visible runtime.** The old `12.4M+ / 320+ / AND COUNTING` strip is hidden by Atlas V4 and replaced with judge-safe facts: Shannon 50312, 4 captured incident classes, inference-cannot-spend, API/MCP/CLI.
2. **Methodology is now a real page.** It exposes Capture → Reconstruct → Classify → Explain → Decide and makes OBSERVED / INFERRED / UNKNOWN understandable as an authority boundary.
3. **Proof is now a real HTML room.** It renders the public Shannon proof commitment as HTML plus inspectable JSON rather than sending judges straight to a raw commitment file.
4. **Agent Interface becomes a first-class path.** The Atlas index links directly to the already-built agent-native surface.
5. **DreamDEX load-bearing semantics are visible before the workspace.** A dedicated note makes `marketId`, lifecycle, MINT_A_PAIR, resting escrow and native order events part of the judge story.
6. **Existing case interaction remains the real product.** Atlas cards enter the same LKB-001 → LKB-004 workspace rather than creating decorative duplicate demos.

## Real-image sourcing

The branch uses direct Unsplash image URLs under the Unsplash License. These are external photographic assets, not the approved screenshot reference.

- Hero study/globe/window photo — Trương Tuyết Ly: https://unsplash.com/photos/desk-with-globe-lamp-and-supplies-by-window-bZqWrQCXr2Q
- Investigation map/globe photo — Aslı Yılmaz: https://unsplash.com/photos/world-map-near-desk-globe-on-brown-wooden-panel-u1PX1Q26Kpo
- Methodology study/map photo — SHAKIL CHOWDHURY: https://unsplash.com/photos/a-room-with-a-desk-and-a-world-map-on-the-wall-gXDgElX7t5g
- LKB-001 editorial case image — Christian Holzinger: https://unsplash.com/photos/lighthouse-on-a-rocky-coast-overlooking-the-ocean-I_PTsLS1vs4
- LKB-002 editorial case image — Yuri Krupenin: https://unsplash.com/photos/industrial-chimneys-with-red-lights-at-night-PF_pkKey75U
- LKB-003 editorial case image — Ye Shu: https://unsplash.com/photos/lighthouse-on-a-hill-under-stormy-skies-XlU_VVUOyYg
- LKB-004 editorial case image — Evgeni Tcherkasski: https://unsplash.com/photos/lighthouse-shining-light-on-a-rocky-coast-at-night-WuHZXhs_4ZQ

The images are context illustrations. They are not evidence for any DreamDEX case and must never be presented as incident evidence.

## Interaction transition

Preserved from the earlier direction:

- sticky/compressing navbar;
- live case hotspot;
- subtle hero parallax;
- Featured Investigation deep-links;
- focus-visible states;
- reduced-motion handling;
- evidence-native final CTA/footer;
- branded 404.

Raised in Atlas V4:

- a four-path Atlas index between hero and cases;
- visual dossier cards for LKB-001–004;
- real Methodology and Proof destinations;
- judge-safe truth band;
- DreamDEX load-bearing explainer;
- Agent Interface promoted into main navigation.

## Anti-targets

- a single full-page screenshot used as the UI;
- fake cross-chain incident claims;
- generic AI copilot chat as the primary interface;
- unsupported metrics or social proof;
- black/blue crypto dashboard slop;
- decorative motion that does not improve comprehension;
- agent surface with signing/broadcast/private-key authority.

## Runtime PASS gate

Atlas V4 is not frozen until a human browser review confirms:

- hero reads as a premium investigation environment;
- remote photographic assets load reliably;
- Methodology and Proof routes work;
- Agent Interface remains coherent with the new navigation;
- Featured Investigations still open the canonical four cases;
- desktop and narrow/mobile layouts remain usable;
- no unsupported vanity numbers are visible;
- Proof clearly separates replay, product-originated testnet proof and absent production evidence;
- no regression in reduced-motion or authority boundaries.
