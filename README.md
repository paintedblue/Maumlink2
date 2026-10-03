# 마음잇다 (Maum:Link)

Social-emotional learning web app for 3rd-grade slow learners. A child works through short illustrated everyday situations using the loop **상황 → 감정 → 생각 → 행동 → 피드백**, fully voiced, with no scores and no wrong answers.

Built as a static, offline-first PWA: React 19 · TypeScript · Vite · Tailwind 4 · Zustand · Zod. No backend, no accounts, no analytics.

Current release: **1.0.0** — see [release notes and known limitations](./CHANGELOG.md).

- Product spec: [`PRD-v1.md`](./PRD-v1.md) · proposal: [`APP_PROPOSAL.md`](./APP_PROPOSAL.md) · source analysis: [`ANALYSIS_REPORT.md`](./ANALYSIS_REPORT.md)
- Visual redesign: [`docs/REDESIGN.md`](./docs/REDESIGN.md) — storybook experience, illustrated story shelf and concrete learning recap
- Latest review: [`docs/REVIEW.md`](./docs/REVIEW.md) · generated artwork and prompts: [`docs/ILLUSTRATIONS.md`](./docs/ILLUSTRATIONS.md)
- Implementation log: [`docs/PROGRESS.md`](./docs/PROGRESS.md) · decisions: [`docs/DECISIONS.md`](./docs/DECISIONS.md)
- For the content team: [`docs/ADDING_A_SCENARIO.md`](./docs/ADDING_A_SCENARIO.md) (Korean) · draft strings awaiting sign-off: [`docs/DRAFT_STRINGS.md`](./docs/DRAFT_STRINGS.md)
- Manual device test: [`docs/TABLET_TEST_CHECKLIST.md`](./docs/TABLET_TEST_CHECKLIST.md)

## Run

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

Requires Node ≥ 20 and pnpm 10. First-visit audio needs one tap on **시작하기** (browser autoplay policy).

## Quality gates

```bash
pnpm validate       # content rules (PRD §10) — also runs inside `pnpm build`
pnpm lint           # oxlint + prettier
pnpm typecheck
pnpm test           # vitest: reducer, validator, components, i18n, speech
pnpm test:e2e       # playwright: happy paths, 11-viewport responsive matrix, rotation, offline
                    # first time: pnpm test:e2e:install
pnpm build          # validate + tsc + vite build + service worker → dist/
```

`pnpm test:e2e` builds first and starts its own preview server on port 4173 (it refuses to reuse a stray one).

## Content

Everything the child sees is data:

```
content/
  emotions.json          # 15 feelings: word, icon, tint
  ui.json                # UI strings
  scenarios/*.json       # one file per situation — add a file, it appears on Home
```

Korean is the shipped language. `en` strings are optional and only used by the dev flag `?lang=en` (D17). Strings marked `"draft": true` are placeholders awaiting client review; `pnpm draft-strings` lists them.

Asset pipelines (all idempotent, outputs committed):

```bash
pnpm images   # content-source/images/*.png → public/img (WebP 800/1600 + PNG)
pnpm app-icons # favicon.svg → PWA and Apple touch icons
pnpm icons    # scripts/gen-icons.ts → public/icons/{emotions,outcome,domain}
pnpm fonts    # Noto Sans KR subset (KS X 1001 + content glyphs) → public/fonts  (needs `uv`)
```

## Deploy

The app is a static folder. After `pnpm build`, upload `dist/` to any static host; the service worker and manifest are included.

| Host | Command |
|---|---|
| Vercel | `vercel deploy dist --prod` (framework preset: Other, output dir `dist`) |
| Netlify | `netlify deploy --dir=dist --prod` |
| GitHub Pages | push `dist/` to the `gh-pages` branch; if served from a sub-path set `base` in `vite.config.ts` |
| Any web server | serve `dist/` with `index.html` as the SPA fallback for unknown paths |

Headers to set if the host allows: `Cache-Control: no-cache` for `index.html` and `sw.js`; long-lived caching for `/assets/*` (content-hashed).

## Repository layout

```
src/
  app/        router + shell
  content/    Zod schema + typed loader
  engine/     pure lesson state machine + store + session persistence
  services/   speech (TTS), sounds (WebAudio), settings, progress, idle
  design/     tokens.css + components (Button, EmotionTile, ChoiceCard, Sheet, …)
  screens/    Home, StartGate, Settings, lesson/{Situation, Feeling, Step3, Action, Feedback, Wrapup}
  i18n/       ui.json resolver
scripts/      validate-content, convert-images, gen-icons, build-fonts, draft-strings
tests/        unit (vitest) · e2e (playwright) · fixtures
```

## License notes

Noto Sans KR is used under the SIL Open Font License. Illustrations in `content-source/images` belong to the content team.
