# TRACE Component Polish V3 — 2026-09-10

## Trigger
After approving the warm editorial realism hero direction, the user asked whether a focused set of specialist component references could raise the visual system another level without reopening product truth.

## Reference roles
The following sources are used as principle libraries, never as copy targets:

- Navbar Gallery — navigation hierarchy, sticky/static patterns, active-state clarity, mobile restraint.
- Supahero / ScreensDesign — hero composition quality bar and hierarchy discipline.
- CTA.gallery — conversion hierarchy, CTA sequencing, contrast and action clarity.
- Footer.design — utility-first footer structure plus a memorable brand-ending moment.
- 404s.design — branded recovery states that turn an error into useful navigation.

## TRACE decision
**APPROVED_FOR_REVERSIBLE_COMPONENT_POLISH**

This is a bounded visual-system delta layered on top of the already approved hero implementation. It does not reopen the hero asset direction or the product evidence contract.

## Implemented delta

### Navigation
- sticky navigation with restrained compression on scroll;
- stronger active-section indication;
- softened network status treatment;
- no mega-menu or novelty navigation.

### Hero refinement
- preserve the approved warm physical-binder scene;
- tighten editorial hierarchy and eyebrow treatment;
- add a restrained light sweep only to the live Open Case Files affordance;
- do not add new decorative cards or generated visual noise.

### Featured investigations
- retain the four live case links;
- strengthen sequence and hover/focus feedback without turning the row into a generic SaaS card grid.

### Final CTA
- add a dedicated pre-footer conversion moment;
- primary action returns to the real investigation workspace;
- secondary action opens the Judge Packet;
- copy reinforces observed/inferred/unknown separation rather than generic marketing claims.

### Footer
- replace the minimal terminal line with a structured verification/navigation footer;
- expose Investigate, Verify and Project paths;
- end with the large low-contrast brand statement `EVIDENCE LIVES ON.`;
- preserve the explicit truth boundary `Replay evidence ≠ production proof.`.

### 404
- add a branded evidence-trail recovery page;
- provide only safe known navigation paths;
- explicitly avoid inventing missing evidence/state.

## Anti-slop boundary
Still prohibited:
- generic dark trading dashboard;
- glassmorphism-heavy SaaS chrome;
- mega menus without information need;
- decorative motion unrelated to comprehension;
- copied reference layouts;
- unsupported proof or performance claims.

## Runtime acceptance gate
The component-polish branch may only be promoted after:
1. CI PASS;
2. Vercel preview READY;
3. desktop visual review confirms navbar/hero/CTA/footer coherence;
4. narrow/mobile review confirms no navigation or CTA collapse;
5. 404 route renders and returns the user to known evidence paths;
6. explicit human visual approval.

## Branch topology
- base visual implementation: `rework/approved-editorial-realism-hero-v2`
- isolated polish branch: `rework/benita-component-polish-v3`
- intended merge path: polish branch -> approved hero branch -> main only after the existing PR #17 visual gate passes.
