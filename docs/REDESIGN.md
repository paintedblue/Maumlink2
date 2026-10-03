# Teal / ivory visual redesign — 2026-10-03

The user explicitly requested a substantial professional redesign after reviewing the earlier incremental polish at https://maumlink.vercel.app/. This revision changes the visual identity and composition, not only individual control styles. It supersedes the original PRD's specific palette/radius values while retaining its learning scope and accessibility requirements.

## Direction

Visual thesis: a considered educational product, with deep teal chrome, warm neutral reading surfaces, restrained contrast and consistent picture-book scenes.

Content plan: branded start screen; illustrated four-domain library; familiar five-step lesson workspace; quiet closing screen. Use only existing content and UI strings.

Interaction thesis: tactile press feedback, gentle cover reveal on pointer hover, a clear progressing line and brief screen entrances. Reduced-motion settings suppress animation and transformation.

## What looks different

| Before | This revision |
| --- | --- |
| Off-white start screen with a small pastel mark | Deep teal start screen, large connected-heart identity, subtle line artwork and contrasting Start action |
| Pastel pictogram cards on a mostly empty Home | Full-width branded header and an illustrated lesson library; each domain shows its scene and existing key sentence |
| Green buttons among several competing pastel colors | One teal action family, neutral surfaces, blue selection states, limited peach/mint brand accents |
| Puffy circles and thick borders across routine controls | Squarer 16px controls, 20px surfaces, quieter borders and consistent icon weights |
| White lesson header with pink dots | Teal lesson header, inset-ring progress, clear active-step caption on wider screens |
| Repeated speech/card boxes | Editorial story text with a simple rule, a distinct key-sentence panel and full-scene illustration |
| Same-looking action/setting choices | Dedicated selectable action surfaces, integrated selection check, separated read-aloud controls and clear setting segments |
| Differing source-art styles | Four matching picture-book scenes; source originals remain untouched |
| Old install icon after a website refresh | Matching favicon, 192/512px PWA icons, Apple touch icon and browser theme color |

## Palette

| Role | Value |
| --- | --- |
| Brand / navigation | `#123F3A` |
| Primary action | `#15594E` |
| Main canvas | `#F4F5F0` |
| Main text | `#203B3A` |
| Secondary text | `#536966` |
| Selection / keyboard focus | `#315E83` |
| Mint brand accent | `#BCD8CF` |
| Peach brand accent | `#E3BCA8` |

Calculated WCAG contrast: primary button white text 8.17:1; main text on canvas 10.96:1; secondary text 5.35:1; white on blue selection 6.86:1. These calculations do not replace a rendered accessibility audit.

Shared visual rules are in `src/design/surfaces.css`; semantic tokens, reading scales and touch dimensions are in `src/design/tokens.css`. Normal lesson reading sizes and the large-text setting remain, along with 64px minimum controls, visible focus, safe-area handling and scrollable lesson content. No accounts, data collection, scores, dashboards or new teaching copy were added.

## Assets and deployment

The new playground asset is `public/img/generated/social-playground-v2-{800,1600}.webp` plus its PNG fallback. The exact built-in image-generation prompt and inspection notes are in `ILLUSTRATIONS.md`. App icons can be regenerated with `pnpm app-icons` from `public/favicon.svg`.

`vercel.json` provides the SPA deep-link fallback described in [Vercel's Vite documentation](https://vercel.com/docs/frameworks/frontend/vite), plus revalidation headers for the HTML shell and service worker. The HTML has a nonvisible `maumlink-design=teal-ivory-v2` meta marker to distinguish this build from the previous one without putting developer information in the child's UI.

## Verification and remaining limits

- Content comparison: all lesson strings, options, feedback and draft flags match the previous release; only the playground illustration reference changed.
- `pnpm lint`, `pnpm test` (65 tests), and `pnpm build` pass. Build includes content validation and TypeScript checks.
- Generated illustrations inspected; generated WebP files remain below 300 KB each.
- Existing UI snapshots are deliberately not rewritten without browser inspection.
- Current environment cannot launch Chromium or WebKit; computer-use and native browser access are unavailable. Browser responsive, axe and visual acceptance remain pending.
- The supplied Vercel URL could not be fetched through either the web tool or shell networking. A successful Git push must not be reported as proof that Vercel deployed it.

This is a substantial visual redesign, not a claim of enterprise certification or completed real-device validation.
