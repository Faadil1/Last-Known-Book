# Atlas Room V5 — Runtime Gate

**Trigger:** user runtime recording + explicit feedback that the root page repeated “investigation” too heavily and embedded too much case detail for a jury-first landing experience.

## Decision
- Keep **Featured Case Files** as concrete examples.
- Remove the duplicated four-path index from the root.
- Do not render the full Case Room workspace on the default root.
- Root becomes a concise judge-facing overview: hero → three-question explainer → case examples → proof fast lane → DreamDEX differentiation → footer.
- Detailed evidence remains available on demand through `/investigations.html` / `?case=LKB-*`.
- Methodology, Proof, Agent and Docs remain dedicated pages.
- Mobile reactivity is a load-bearing acceptance condition, not optional polish.

## Source status
- Product implementation head: `246cbab5b72871ae6df5a5503c9b8b93d3197aef`
- GitHub Actions: PASS (`34522852978`)
- Cloudflare Pages: PASS
- Atomic preview: `https://e963f7d4.last-known-book.pages.dev`
- Stable branch preview: `https://rework-atlas-room-v4.last-known-book.pages.dev`

## Human/TRACE gate still required
Review:
1. root desktop,
2. root ~390–430 px mobile,
3. Case Room desktop/mobile,
4. Methodology,
5. Proof,
6. Agent navigation and continuity.

Do not promote to the PR chain or `main` solely from CI/Cloudflare green status.
