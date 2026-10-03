# Senior implementation review — 2026-10-03

Implemented against PRD-v1 and APP_PROPOSAL. This remains a static, Korean-first, offline-capable learning app with four scenarios, no accounts, no backend, no analytics, and no scoring. Every lesson string, option, feedback, and draft flag was compared with HEAD and is unchanged. Only illustration references changed in scenario data.

## Design direction

- Visual thesis: warm paper surfaces, quiet pastel pictograms and legible story illustrations, with the green forward action in a predictable place.
- Content plan: Start → four domain choices → the existing five-step lesson → wrap-up. No additional teaching content or marketing sections.
- Interaction thesis: gentle choice lift/press, brief screen entrance, and the existing connecting-heart completion animation. Reduced motion disables transitions and animation.

## Findings and fixes

| Priority | Finding | Resolution |
| --- | --- | --- |
| High | The parent's passive effect cancelled narration after the child began speaking. StrictMode also cancelled narration permanently because the read-once ref survived cleanup. | Cancel old-screen speech in a layout effect; restart auto-read after cleanup. Integration and lifecycle regressions added. |
| High | Closing a hint could cancel the newly selected feeling's spoken label. | Narration cleanup is scoped to its own request and cannot cancel a newer request. |
| High | Parsed session data was cast directly to a type, allowing bad steps, indexes or emotion IDs to crash a lesson. | Validate structure and scenario membership; quietly restart invalid sessions. Sanitize persisted settings and progress as well. |
| Medium | Completion was counted whenever Wrap-up mounted, including reload/StrictMode. | Count only the reducer's first transition into completion. |
| Medium | Sheet effect depended on an inline callback, repeatedly resetting focus when settings changed. | Stable effect-event callback, focus restoration and body scroll lock. |
| Medium | Wrap-up omitted replay and settings. | Both controls are now available, including replaying an optional recorded closing. |
| Medium | Primary green was documented as 4.6:1 against white but measured 3.43:1. | Darken only the action token to #28794F, measured 5.33:1. |
| Medium | Large text exceeded PRD maxima; long labels could overflow fixed minimum widths; vertically centered tall content could become unreachable. | Restore 34/27px story/body maxima, allow labels to wrap, use a flexible footer grid, min-height:0 scroll region and auto margins. |
| Medium | Story frames cropped images, two stories displayed technical placeholders, and one displayed a low-resolution slide with embedded text. | Contain complete images; integrate three optimized, text-free story illustrations. Preserve original client files. |
| Medium | Close icon showed an X on the child path; muted audio used another X. | Labeled Close button and neutral muted indicator. |
| Medium | Radio-like choices lacked arrow-key behavior; narration announcements lacked a shared live region. | Add arrow/Home/End support to action and setting groups; focus each lesson heading; publish spoken text to a polite status region. |
| Low | Selected emotion tiles scaled beyond their grid bounds; selected action borders were too thin. | Stable-size 4px visual selection outline with a check indicator. |
| Low | A domain was marked complete after only one of several lessons. | Require every scenario in the domain to be complete. |
| Low | Package ranges drifted from the PRD's exact-version requirement. | Pin the already installed versions and synchronize the lockfile offline; no dependency upgrade performed. |
| Low | Content tools used a CLI IPC listener, preventing validation in restricted environments. | Run the same TS scripts through Node's tsx import hook without the extra listener. |

## Visual changes

Home now gives the four available domains a consistent pictogram, larger white choice surface, quiet count and directional affordance. The reserved domain is a compact secondary row. Self-awareness uses the requested mirror symbol; relationship awareness uses two people; relationship management uses a handshake. SVG assets explicitly use the app's ink color instead of falling back to black through an image boundary.

Lesson chrome separates white controls from the warm content surface, keeps touch controls at least 64px and adds desktop step labels. Safe-area padding is combined with normal gutters instead of replacing them. Story art preserves the whole scene. Sheets offer more usable vertical space on short screens. The existing emotion palette, Korean content, hints, optional reconsideration and five-step sequence remain.

Generated assets and exact prompts: [ILLUSTRATIONS.md](ILLUSTRATIONS.md). The three image sets live in `public/img/generated/`, with 800/1600px WebP sources and PNG fallbacks. The largest generated WebP is approximately 128 KiB, below the PRD's 300 KB limit. New illustrations still need the content team's pedagogical review. The supplied playground illustration remains in use.

## Verification

- `pnpm validate`: four scenarios valid; the original 18 draft strings remain flagged.
- `pnpm test`: 65 passing tests, including narration integration, request ownership, invalid-storage recovery, completion idempotency and sheet focus stability.
- `pnpm lint`: clean after the review changes.
- `pnpm build`: production bundle and service worker generated. JS approximately 150 KB gzip; CSS approximately 7.5 KB gzip; precache approximately 3.3 MiB including fonts and illustrations.
- Semantic comparison with HEAD: no lesson text, answer, feedback, or draft-flag changes.
- Generated illustrations inspected directly. Static UI review fixtures were produced, but **could not be viewed in a browser**.

### Browser verification remains open

The environment denied the local server with `listen EPERM`; its permission policy rejected escalation. Chromium also failed to launch, and computer-use reported that no enabled surface was available. Consequently **no current browser, responsive, axe, offline-reload or Lighthouse pass is claimed**. Earlier results in PROGRESS.md apply to the previous UI.

The existing screenshot baselines represent the previous design and are intentionally preserved. In an environment allowing local browsers:

1. `pnpm test:e2e --project=chromium --grep-invert 'viewport '` to check flows, a11y and rotation without obsolete screenshot comparisons.
2. Visually inspect Home and S1–S6 at 360×640, 640×360, 768×1024 and 1180×820, both text sizes; include open sheets and reconsideration controls.
3. `pnpm test:e2e --project=chromium --update-snapshots` to produce the new baselines; inspect every change before accepting it.
4. `pnpm test:e2e` for both browser engines, then execute the real-device checklist and Lighthouse.

This review is implemented, but responsive and accessibility acceptance is **pending browser verification**, not signed off.
