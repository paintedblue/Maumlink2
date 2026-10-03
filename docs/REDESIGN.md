# Storybook redesign — 2026-10-03

This revision supersedes the earlier teal/ivory direction below. The user explicitly requested a completely different, more interesting experience for the target children, including delivery, layout, colors and positioning.

## Direction and content delivery

Visual thesis: a warm picture book with cream paper, blueberry actions, apricot/lavender heart companions and familiar school scenes. The companions express welcome, never the correctness of a feeling or action.

Content plan: a friendly first hello → choose a concrete illustrated story → scene with one spoken sentence → questions with a persistent scene reminder → face and speech choices → a recap of the child's actual feeling and action.

Interaction thesis: a brief companion greeting on entry; a restrained sentence fade when the story advances; tactile selection/press feedback. No loops, time pressure, scores, stars or new teaching text. Reduced-motion settings suppress the motion.

| Screen | New experience |
| --- | --- |
| Start | Two linked-heart characters, the existing welcoming question, one entry button |
| Home | A two-column story shelf on tablets; concrete story titles lead and domain names become secondary; compact illustrated rows on phones |
| Situation | Large centered scene with a separate dialogue caption below; the key sentence has a distinct lavender surface; artwork takes only the height left after text and compact navigation |
| Feeling / Thought / Action | The relevant scene remains beside the question; face choices and speech-shaped actions respond with clear selection states |
| Feedback | Selected action and outcome first, followed by a companion-led explanation; decoration yields space to reading on phones |
| Wrap-up | The actual selected feeling and full action text replace the former icon/letter-only recap; replay reads closing and recap |
| Shared UI | Blueberry buttons, cream canvas, softer geometry, light header, pictorial progress, matching favicon/install icons |

## Palette and accessibility

- Canvas `#FFF9EF`; ink `#343047` (12.08:1).
- Action `#5546A3`; white action text (7.52:1).
- Secondary ink `#655D73` on canvas (5.96:1).
- Selected surface `#EEE9FB`; main ink (10.65:1).
- Apricot `#F3B290` and lavender `#C6BAF2` are illustration accents.

64px minimum targets, normal/large reading scales, keyboard navigation, narration, focus management, device safe areas and compact one-row lesson navigation remain. Tall text or zoom still has accessible overflow; no content is clipped to manufacture a no-scroll pass. Every scenario JSON, UI translation, answer and existing draft flag is unchanged. First-visit copy now uses the existing Home greeting instead of the diagnostic audience label.

The heart artwork is a local, code-native SVG (`HeartFriends.tsx`), rendered and visually inspected. Existing generated school illustrations are reused; no new external asset or runtime request was added. Theme tokens and shared styles were replaced rather than adding another theme override layer.

## Verification

- `pnpm lint`, `pnpm test` (69 tests) and `pnpm build` pass.
- Four new interaction tests traverse the redesigned Home and every lesson, asserting exact story sentences, question context, selected feedback and concrete completion recap.
- Content diff is empty. Four scenarios validate; all 18 prior draft strings remain flagged.
- Browser viewport suite attempted: preview startup is blocked by `listen EPERM ::1:4173`. Chrome connection also fails with `CUA_REPL_ENABLED_SURFACES is required`. No new rendered viewport, axe or visual snapshot acceptance is claimed; prior screenshot baselines are retained, not overwritten.
- HTML build marker: `maumlink-design=storybook-v3`. Git push does not establish that Vercel deployed this version.

---

## Previous design history (superseded)

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


## Lesson viewport follow-up — 2026-10-03

The user reported that Previous / Next consumed too much space on the situation screen and requested content visible without vertical scrolling. The visual direction is a calm, viewport-sized reading workspace: compact navigation, scene artwork, then title and current sentence. Existing step transitions and reduced-motion behavior remain; no new motion or teaching copy is introduced.

- Replaced the mobile two-row navigation with one row, retaining 64px minimum touch targets. The situation footer now budgets 81px without device safe-area insets instead of approximately 170px. Primary actions are content-sized rather than full-width.
- Removed the fixed 96px footer minimum. Artwork shares the remaining height with story text, and switches to a side-by-side composition on tablets and landscape phones. It uses object-contain so the scene is not cropped.
- Reduced story padding and panel spacing. Compact emotion rows and a side-by-side body diagram recover room on shorter screens without shrinking reading fonts.
- Kept overflow available for unusually short viewports, enlarged text, and longer expanded lesson explanations. This change does not claim zero scrolling for every combination of content, zoom and screen size.
- Added `tests/e2e/lesson-viewport.spec.ts` to check every situation sentence and key sentence at 360×640, 390×844, 768×1024 and 1366×768: a single navigation row, visible 64px controls, and no content overflow.

Validation: lint, 65 unit tests and production build passed. The targeted browser suite was attempted but stopped before running tests because the preview server could not bind `::1:4173` (`listen EPERM`). The development server was likewise blocked on `127.0.0.1:5173`. Rendered viewport acceptance and Vercel deployment verification remain pending.
