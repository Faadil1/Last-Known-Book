# Judge Docs Path Fix

Date: 2026-09-09

## Trigger

The public runtime review video showed that the top-navigation `Docs` action opened `/docs/SUBMISSION-PACKAGE.md` as raw Markdown in a new browser tab. The content was correct, but the presentation broke the Direction 6 judge-facing visual identity.

## Bounded repair

- preserve the existing `/docs/SUBMISSION-PACKAGE.md` link for compatibility;
- add `docs.html` as a styled Direction 6 judge packet;
- add a Vercel rewrite from `/docs/SUBMISSION-PACKAGE.md` to `/docs.html`;
- preserve raw source access through explicit GitHub links inside the styled view;
- add CI tests for the route and truth-boundary content.

## Scope boundary

No engine logic, blockchain proof, transaction behavior, private evidence, or submission authority is changed by this repair.
