# PRD v1 — Maum:Link (마음잇다)
## Social-Emotional Learning Web App for 3rd-Grade Slow Learners

| | |
|---|---|
| **Status** | v1.0 — ready for implementation |
| **Date** | 2026-10-03 |
| **Audience of this document** | The AI coding agent (and human developers) building the app |
| **Upstream documents** | `APP_PROPOSAL.md` (what we promised the client), `ANALYSIS_REPORT.md` (what the client's materials say) |
| **Source materials** | 4 content decks (`*.pptx` / `eng-ver/*.pdf`), flowchart `KakaoTalk_Photo_2026-10-03-15-18-00.png`, `content-source/` |

---

## 0. Instructions for the AI agent

Read this section before touching code.

### 0.1 Document precedence
1. **This PRD** is the single source of truth for *what to build*.
2. `APP_PROPOSAL.md` explains *why* and the client-facing commitments. If the PRD is silent, follow the proposal.
3. `ANALYSIS_REPORT.md` holds the raw findings and the original Korean/English content. Use it to verify content wording.
4. If these documents conflict, the PRD wins. Log the conflict in `docs/DECISIONS.md`.

### 0.2 Rules of engagement
- **Do not invent pedagogy.** Every child-facing string must come from §7 (Content) of this PRD. Strings marked `draft: true` are placeholders we wrote to fill gaps; keep the flag in the data so the client can review them. Never silently add new feedback, feelings or actions.
- **No failure states, ever.** No scores, points, stars, timers, streaks, "wrong," "X" icons, red error colors on the child's path, or negative sounds. If you find yourself adding one, stop.
- **No backend, no accounts, no analytics, no third-party trackers.** The app is static and collects no personal data.
- **Content is data.** The lesson engine must not contain scenario-specific code. Adding a scenario = adding a JSON file (FR-ENG-01).
- **Korean is the primary language.** English is a secondary locale loaded from the same content files. Both must render.
- **Work milestone by milestone (§13).** At the end of each milestone: run the content validator, run tests, update `docs/PROGRESS.md`, commit. Then report to the human with a short summary and anything that needs a decision.
- **When blocked by a genuine product decision**, choose the option most consistent with §0.3 and §4, implement it, and record it in `docs/DECISIONS.md` with the reasoning. Do not stall. Ask the human only if the choice would be expensive to reverse.
- **Keep the design system (§6).** Do not introduce new colors, font sizes or radii outside the tokens.

### 0.3 Guiding principles (tie-breakers)
1. **Calm over exciting.** The child should never feel rushed or judged.
2. **Hear it, see it, tap it.** Every text is spoken; every feeling has a face; every action is a big button.
3. **One thing per screen.** One question, one set of choices, one Next.
4. **The child always wins.** Any path through a lesson ends in a warm wrap-up.
5. **Teachers can trust it.** Content wording is exactly what the content team wrote (or clearly flagged as draft).

---

## 1. Product overview

### 1.1 Problem
Slow learners (느린학습자; borderline intellectual functioning) in Korean elementary schools struggle to recognize feelings, link them to causes, and choose constructive responses in everyday peer situations. Existing SEL materials assume reading fluency and abstract reasoning they do not yet have.

### 1.2 Product
**Maum:Link (마음잇다, "connecting hearts")** is a web app in which a child works through a short, illustrated everyday situation using a fixed five-step loop:

```
상황 보기 → 감정 알아보기 → 왜 그럴까? → 어떻게 할까? → 피드백
Situation → Feeling     → Thought    → Action      → Feedback
```

Each lesson takes 5–10 minutes. There are no right or wrong feelings; every action receives explanatory feedback; every lesson ends with a closing message.

### 1.3 Goals for v1
| Goal | Measure |
|---|---|
| A child can complete every lesson alone on a tablet | 100% of pilot children finish ≥1 lesson without adult help on navigation |
| Content team can add lessons without a developer | New JSON appears on Home and plays with zero code changes (demonstrated) |
| Zero failure signals | Audit: no screen on the child path shows negative feedback |
| Fully voiced | 100% of child-facing text has a working read-aloud |

### 1.4 Non-goals for v1
Accounts, cloud sync, teacher dashboard, content authoring UI, recorded voice-over, native store apps, the fifth SEL domain's content, gamification.

---

## 2. Users

### 2.1 Primary: the child
- Age 9–10 (Korean 3rd grade), borderline intellectual functioning.
- Reads slowly; decodes short sentences; abstract words are hard; working memory is short; easily discouraged by failure cues; benefits from routine and predictability.
- Uses a school tablet, usually in landscape, often with a teacher nearby but not driving.

**Design consequences:** audio-first; ≤ 1 sentence visible at a time in stories; concrete words; identical layout every lesson; large targets; immediate gentle confirmation of every tap; no time pressure.

### 2.2 Secondary: the teacher / special-education aide
- Launches the app, picks a domain with the child, observes.
- Needs: settings (text size, sound), a way to go Home instantly, no login friction.

### 2.3 Tertiary: the content team (students)
- Author lessons as data; need a validator that tells them what is missing in plain language.

---

## 3. Scope

### 3.1 In scope (v1)
- Home with 4 domain cards (+1 reserved)
- Lesson Engine: screens S1–S6, three Step-3 variants, hints, "Tell me more," "Try another way"
- 4 scenarios fully playable (§7)
- Shared emotion library (15 feelings) with SVG face icons and TTS
- Read-aloud (Web Speech API), progress dots, text-size toggle, soft sounds, settings
- Local progress ("completed" marks) and settings in `localStorage`
- Korean only for children and teachers (D17); `?lang=en` dev/demo render with Korean fallback
- Installable PWA with offline support
- Content validator CLI + "How to add a scenario" guide
- Unit tests for engine and validator; happy-path e2e per scenario

### 3.2 Out of scope (v1)
Everything in §1.4. Also: parental gates, print/export, multiplayer, AI-generated content at runtime.

---

## 4. Locked product decisions

These were open in the client materials. They are now decided (see `APP_PROPOSAL.md` §4 for rationale). Do not reopen.

| ID | Decision |
|---|---|
| D1 | **Fully responsive is a hard requirement (see D16).** Design reference is tablet landscape, but every screen must work equally in tablet portrait, phone portrait/landscape and desktop |
| D2 | v1 ships all four domains with one scenario each |
| D3 | Every action gets feedback. Actions tagged `reconsider` additionally offer "Try another way." No forced loops, no "wrong" |
| D4 | Feeling screen has a visible "Help me" button; an automatic gentle hint appears after 20 s of inactivity (once per visit to the screen) |
| D5 | After Step 3: buttons "Got it" (→ Step 4) and "Tell me more" (shows one extra example, then same buttons) |
| D6 | Feelings are single-select unless the scenario sets `multiSelect: true`. v1 content: all single-select |
| D7 | The flowchart's "View result" is the outcome panel at the top of the Feedback screen |
| D8 | Audio = browser TTS (ko-KR / en-US). Every text node has an optional `audio` field for future MP3s; if present, play it instead of TTS |
| D9 | Missing illustrations use styled placeholder art generated from the written brief (soft gradient card + domain icon + brief text for the teacher). Real art is a file swap |
| D10 | Emotion icons: 15 SVG faces, round, soft line, consistent style (§6.6) |
| D11 | "Not sure" (잘 모르겠어요) is the last feeling option in every scenario. Choosing it opens the hint panel; after the hint the child chooses again (Not sure stays available; choosing it twice proceeds with the hint's first suggested feeling, announced warmly) |
| D12 | Typos in source content are corrected (§7 uses corrected text). Gaps are filled with `draft: true` strings |
| D13 | Stack: client-side SPA — **latest stable** React 19.x + TypeScript + Vite + Tailwind + Zustand + React Router + vite-plugin-pwa + Zod + Vitest + Playwright. Node ≥ 20 LTS. Package manager: pnpm. Always install the current stable major of each; pin exact versions in `package.json` at M0 and record them in `docs/DECISIONS.md`. **Not** Next.js / App Router: the app is fully static and offline-first with no server, no data fetching, no SEO and two routes, so a meta-framework adds a server mental model and PWA friction for no benefit (see `docs/DECISIONS.md` entry "Why SPA, not Next") |
| D14 | Fonts: self-hosted Noto Sans KR (weights 400/700) for offline; no external font requests at runtime |
| D15 | No external network calls at runtime at all (except the app's own static assets) |
| D16 | **Responsive, non-negotiable.** The app must be usable, with no horizontal scrolling, no clipped text, no overlapping controls and every tap target ≥ 64 px, at every viewport from 360 × 640 to 2560 × 1440 in both orientations, and must survive an orientation change mid-lesson without losing state. Enforced by FR-RES-01…07, an automated viewport matrix (§12) and acceptance criterion §14.8. A build that fails any viewport in the matrix is not shippable |
| D17 | **Korean is the only shipped locale.** Children and teachers never see a language control. `en` strings are optional in the schema and used only for development/demo via `?lang=en`. The content team writes Korean only |

---

## 5. Information architecture & user flows

### 5.1 Routes
| Route | Screen | Notes |
|---|---|---|
| `/` | S0 Home | Domain cards, settings button |
| `/lesson/:scenarioId` | Lesson Engine | Step kept in engine state, mirrored to `?step=` for refresh-safety |
| `/lesson/:scenarioId/done` | S6 Wrap-up | Reached only via engine |
| `*` | Redirect to `/` | No 404 page for children |

Settings is a modal/sheet, not a route.

### 5.2 Lesson state machine

```
            ┌──────────┐
   start ──►│ situation │──next──►┐
            └──────────┘          │
                                  ▼
                           ┌───────────┐   help / idle 20s / "not sure"
                           │  feeling  │◄──────────────┐
                           └─────┬─────┘               │
                      next (≥1 selected)        ┌──────┴──────┐
                                 ▼               │ feeling.hint│
                           ┌───────────┐         └─────────────┘
                           │   step3   │◄──────┐
                           └─────┬─────┘       │ "tell me more"
                        got it   │        ┌────┴──────┐
                                 ▼        │ step3.more│
                           ┌───────────┐  └───────────┘
                           │  action   │◄──────────────┐
                           └─────┬─────┘               │
                        choose   │                     │ "try another way"
                                 ▼                     │ (only if quality=reconsider)
                           ┌───────────┐               │
                           │ feedback  │───────────────┘
                           └─────┬─────┘
                        continue │
                                 ▼
                           ┌───────────┐
                           │  wrapup   │──► home | next scenario
                           └───────────┘
```

**Back button rules:** `situation` ← Home (confirm sheet "처음으로 갈까요?"); `feeling` ← situation; `step3` ← feeling (selection preserved); `action` ← step3; `feedback` ← action (choice preserved, feedback hidden); `wrapup` has no Back.

**Persistence:** on every transition write `{scenarioId, step, feelingIds, actionId}` to `sessionStorage` so a page refresh restores the exact screen.

### 5.3 End-to-end flow (happy path)
Home → tap domain card → S1 story auto-reads sentence by sentence → Next → S2 tap feeling (spoken) → Next → S3 reads linked explanation → Got it → S4 tap action → Choose this → S5 outcome + feedback read → Continue → S6 closing read + chime → "Practice another" or Home.

---

## 6. UI / UX design

The design must feel **simple, warm and unmistakably Maum:Link** — not a generic kids' quiz app. Every rule below exists because of §2.1.

### 6.1 Design concept: "Two hearts, one line"
- **Motif:** two soft rounded shapes (hearts/faces) connected by a gentle curved line — the "link." It appears in the logo, the progress indicator (dots connected by a line), the wrap-up animation, and as a subtle divider.
- **Metaphor for the child:** "We connect what happened → what I feel → what I do." The connecting line grows across the five steps as the child progresses.
- **Mood words:** calm, soft, daylight, friendly, steady. **Not:** flashy, cartoonish, loud, competitive.

### 6.2 Layout system
- **Canvas:** fluid; design reference 1180 × 820 (iPad landscape, safe area). Breakpoints: `sm` < 640 (phone portrait: single column, stacked), `md` 640–1023 (tablet portrait), `lg` ≥ 1024 (tablet landscape / desktop: two columns where specified).
- **Grid:** 12 columns, 24 px gutters, 32 px page margin on `lg`, 16 px on `sm`.
- **Fixed chrome (all lesson screens):**
  - Top bar, 72 px: Home button (left), progress link-dots (center), speaker/replay + settings (right).
  - Bottom bar, 96 px: Back (left, secondary), primary action (right, large). On `sm`, primary is full-width above Back.
- **Content zone:** everything between the bars; vertically centered when short. No scrolling on `lg` for v1 content; `md`/`sm` may scroll but the primary button stays sticky.
- **One primary button per screen**, always bottom-right (or full-width bottom on phones), always the same color. The child learns "the big green button moves me forward."

#### 6.2.1 Responsive rules (binding — implements D16)
- **Mobile-first CSS.** Base styles target 360 px portrait; `md`/`lg` add columns. Never write a desktop layout and "fix" phones afterwards.
- **Fluid, not fixed.** No fixed pixel widths on layout containers; use `%`, `fr`, `minmax()`, `clamp()`. Max content width 1280 px, centered on wider screens with the same 32 px margins.
- **Viewport units:** use `100dvh` (not `100vh`) for full-height layouts so mobile browser bars don't hide the bottom button. Respect `env(safe-area-inset-*)` on all four sides (iPad home indicator, notches).
- **No horizontal scroll, ever.** `html, body { overflow-x: hidden }` is *not* the fix — the fix is layouts that don't overflow. Long Korean words wrap with `word-break: keep-all; overflow-wrap: anywhere`.
- **Type is fluid within the token scale:** each role uses `clamp(min, vw-based, max)` with the min/max from §6.4 so text never shrinks below the "normal" size nor grows above "large".
- **Orientation change** (resize/`orientationchange`) re-lays out in place; lesson state is unaffected (it lives in the store, not the DOM); any open sheet stays open; speech is not interrupted.
- **Per-screen behavior across breakpoints:**

| Screen | `sm` (< 640, phone portrait) | `md` (640–1023, tablet portrait / phone landscape) | `lg` (≥ 1024) |
|---|---|---|---|
| S0 Home | Cards 1 per row, 100% width, 200 px tall | 2 per row | 4 per row (+ reserved on row 2) |
| S1 Situation | Illustration on top (16:10, max 40 dvh), sentence below; bottom bar sticky | Illustration top, text below, larger | Side by side 7 / 5 columns |
| S2 Feeling | Tiles 2 per row, 100% of half width, min 144 px tall; grid scrolls; Help button sticky above bottom bar | 3 per row | 3 per row (4 when 7 options) |
| S3 Step 3 | Body outline above text (body-reaction); stacked cards (multiple-choice) | Same as `sm`, wider | Side by side |
| S4 Action | 4 cards stacked, full width, min 96 px tall | 2 × 2 | 2 × 2 |
| S5 Feedback | Outcome panel above feedback card, stacked | Stacked | Stacked (centered, max 880 px) |
| S6 Wrap-up | Stacked; two buttons stacked full-width | Two buttons side by side | Two buttons side by side |
| Bottom bar | Primary button full-width on top, Back below (both 64 px) | Back left, primary right | Back left, primary right |
| Sheets (Hint/Settings/Confirm) | Full-width bottom sheet, max 70 dvh, drag handle | Bottom sheet, max 60 dvh | Centered dialog, max 560 px wide |

- **Phone landscape (height < 500 px):** top bar shrinks to 56 px, bottom bar to 80 px, illustration in S1 becomes a 96 px thumbnail beside the text, emotion tiles 128 px. Nothing is hidden; everything is reachable by scrolling the content zone while bars stay fixed.
- **Pointer types:** hover styles only under `@media (hover: hover)`; all interactions work with touch, mouse and keyboard.
- **Images:** `<img>` with `width`/`height` attributes and `srcset` (800 / 1600) + `sizes`; `object-fit: cover` inside a fixed-ratio frame so layout never shifts while loading.

### 6.3 Color tokens
Soft pastel surfaces, dark readable text, one accent for "go." Domain colors reuse the five from the client's decks.

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FBF8F3` | Page background (warm off-white; less glare than pure white) |
| `--surface` | `#FFFFFF` | Cards |
| `--ink` | `#23313F` | Primary text (contrast on bg ≥ 12:1) |
| `--ink-soft` | `#5B6B7B` | Secondary text (≥ 7:1) |
| `--line` | `#E6E1D8` | Borders, dividers |
| `--go` | `#3E9B6E` | Primary button bg (white text, 4.6:1) |
| `--go-ink` | `#FFFFFF` | Primary button text |
| `--select` | `#2F6FB5` | Selection border/check (not red, not a "correct" green) |
| `--link` | `#E9A6B8` | The connecting line / motif pink |
| `--domain-self` | surface `#FCF0C2` / edge `#D9B64E` | Self-Awareness (yellow) |
| `--domain-social` | surface `#DCEBFA` / edge `#7FAEE0` | Social Awareness (blue) |
| `--domain-relation` | surface `#F9DEDC` / edge `#E29A93` | Relationship Management (red/pink) |
| `--domain-mind` | surface `#DDEFE0` / edge `#86C494` | Mental Health Care (green) |
| `--domain-reserved` | surface `#E7E0F5` / edge `#B39DDB` | 5th domain placeholder (purple) |
| `--focus` | `#1D4ED8` 3 px outline | Keyboard focus |

Rules: no pure red on the child path (reserved for nothing — we have no errors); `--go` is the only saturated green and is used only for the primary button so it never reads as "correct answer."

### 6.4 Typography
- **Family:** Noto Sans KR (self-hosted), fallbacks `"Apple SD Gothic Neo", "Malgun Gothic", sans-serif`. Latin text uses the same family.
- **Scale (normal / large setting):**

| Role | Normal | Large | Weight | Line-height |
|---|---|---|---|---|
| Story sentence / key question | 28 px | 34 px | 700 | 1.5 |
| Body / card text | 22 px | 27 px | 400 | 1.6 |
| Button label | 22 px | 26 px | 700 | 1.2 |
| Emotion word under icon | 20 px | 24 px | 700 | 1.2 |
| Caption (teacher-facing only) | 16 px | 18 px | 400 | 1.5 |

- Max line length 22 Korean characters / 48 Latin characters per line in story text.
- Never justify; never all-caps; never italics for Korean.
- Text size toggle switches the whole scale (CSS variable), persists.

### 6.5 Shape, spacing, elevation
- Radius: cards 24 px, buttons 20 px, emotion tiles 28 px, chips 999 px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Elevation: cards `0 2px 0 var(--line)` (flat, paper-like) — no drop shadows that imply depth or urgency.
- Minimum tap target **64 × 64 px**; minimum gap between targets 16 px.
- Borders 2 px; selected state adds a 4 px `--select` border + check badge, never color-fill change alone (color-blind safe).

### 6.6 Iconography
- **Emotion faces (15):** single circular face, 2.5 px soft stroke, two dot eyes + mouth + at most one extra cue (eyebrows, tear, sweat drop, blush). No teeth, no exaggerated mouths. Each on a pastel disc of a per-emotion tint (muted; no red for anger — use warm peach). Delivered as SVG with `currentColor` strokes. File names = emotion ids (§7.1).
- **UI icons:** rounded line set (Lucide-style, 2.5 px). Home = house; Speaker = speaker with one wave; Settings = sliders; Back = left arrow; Help = question mark in a speech bubble; Replay = circular arrow.
- **Domain icons (5):** simple pictograms — mirror (self), two people (social), handshake (relation), heart-with-leaf (mind), star (reserved).
- **Body outline** (Step-3 body-reaction): front-facing simplified child silhouette, gender-neutral, with soft highlight blobs on head/eyes/mouth/chest/stomach/hands/body.

### 6.7 Components

| Component | Spec |
|---|---|
| `PrimaryButton` | 64 px tall, `--go` bg, white 22 px bold label, left icon optional, right chevron. Disabled = 40% opacity + no pointer; still focusable with a spoken hint "먼저 하나를 골라요." |
| `SecondaryButton` | 64 px, white bg, 2 px `--line` border, `--ink` text |
| `IconButton` | 64 × 64, circular, white bg, border; tooltip text for teachers |
| `ChoiceCard` (actions) | Full-width on `sm`; 2 × 2 grid on `lg`; min 120 px tall; letter badge A–D at left (48 px circle, domain tint), text 22 px, speaker icon at right; selected = `--select` border + check |
| `EmotionTile` | 160 × 176 px (icon 96 px + word); grid wraps; tapping speaks the word and selects; selected = border + check + 2% scale; `--select` |
| `StoryCard` | Illustration + one sentence at a time; "·  ·  ·" sentence dots under the text; tap anywhere on the card or Next to advance; last sentence shows the key sentence in a speech bubble |
| `SpeechBubble` | White, 24 px radius, tail toward the character side |
| `HintPanel` | Bottom sheet, 40% height, `--domain` tint; hint text 22 px, read aloud; two suggested `EmotionTile`s inline; "알겠어요" closes |
| `OutcomePanel` | Top of S5: chosen action text + small illustrated outcome (v1: icon + tinted card; later: art) |
| `ProgressLink` | 5 dots connected by a line; completed dots filled `--link`, current dot larger with a soft pulse (respects reduced-motion) |
| `SettingsSheet` | Text size (A / A+), Sound (on/off), Read aloud automatically (on/off). **No language control** (D17) |
| `ConfirmSheet` | Only used for Home-from-lesson: "처음으로 갈까요?" buttons "네" / "아니요" |

### 6.8 Screen wireframes (lg, landscape)

**S0 Home**
```
┌──────────────────────────────────────────────────────────────┐
│  ♡—♡ 마음잇다                                     [⚙]       │
│                                                              │
│      오늘은 어떤 마음을 배워볼까요?                 [🔊]       │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  🪞        │ │  👥        │ │  🤝        │ │  💚        │ │
│  │ 자기 인식   │ │ 관계 인식   │ │ 관계 관리   │ │ 마음건강    │ │
│  │ 상황 1개    │ │ 상황 1개    │ │ 상황 1개    │ │ 상황 1개    │ │
│  │   ✓ 완료   │ │            │ │            │ │            │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                                 ┌────────────┐ (greyed)      │
│                                 │ 준비 중     │               │
│                                 └────────────┘               │
└──────────────────────────────────────────────────────────────┘
```
- Cards are 240 × 280, domain-tinted, icon 96 px. Tap → `/lesson/:id` (if a domain later has several scenarios, tap opens a scenario list in the same card style).
- First-ever visit shows a one-time full-screen "시작하기" button (needed to unlock audio autoplay); after tap, Home appears and greets by voice.

**S1 Situation**
```
┌ [⌂]        ●—●—○—○—○           [🔊] [⚙] ┐
│                                            │
│  ┌──────────────────┐  ┌─────────────────┐ │
│  │                  │  │ 상황 제목        │ │
│  │   illustration   │  │                 │ │
│  │                  │  │ "쉬는 시간이에요."│ │
│  │                  │  │                 │ │
│  │                  │  │   ● ○ ○         │ │
│  └──────────────────┘  └─────────────────┘ │
│                                            │
│ [← 이전]                        [다음 →]   │
└────────────────────────────────────────────┘
```
- Sentences advance on tap/Next; Next's label is "다음" throughout; on the last sentence the key sentence appears in a `SpeechBubble` over the illustration and Next proceeds to S2.

**S2 Feeling**
```
┌ [⌂]        ●—●—○—○—○           [🔊] [⚙] ┐
│   이 상황에서 나는 어떤 기분이 들까요?        │
│                                            │
│  [😟 걱정돼요] [😢 속상해요] [😠 화가 나요]     │
│  [😳 당황스러워요] [🙂 재미있어요] [❔ 잘 모르겠어요] │
│                                            │
│                       [? 도와줘요]          │
│ [← 이전]                        [다음 →]   │
└────────────────────────────────────────────┘
```
- Tiles max 6 per screen, 3 × 2 on `lg`, 2 × 3 on `md`, 1 column scroll on `sm`.
- "도와줘요" is a `SecondaryButton` with the help icon, placed above the bottom bar, right.

**S3 Why / Body**
```
┌ [⌂]        ●—●—●—○—○           [🔊] [⚙] ┐
│  [😢] 속상해요 를 골랐어요.                   │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 왜 그런 마음이 들었을까요?              │  │
│  │ 친구가 내 앞으로 자주 새치기를 해서      │  │
│  └──────────────────────────────────────┘  │
│  같은 상황에서도 사람마다 다른 마음이 들 수 있어요. │
│                                            │
│ [← 이전]     [더 알려줘요]     [알겠어요 →]   │
└────────────────────────────────────────────┘
```
- Body-reaction variant: left = body outline with highlighted parts; right = the sentence.
- Multiple-choice variant: question + four `ChoiceCard`s; tapping one shows its acknowledgment line under it and enables "알겠어요".

**S4 Action**
```
┌ [⌂]        ●—●—●—●—○           [🔊] [⚙] ┐
│  그런 마음이 들 때 어떻게 하면 좋을까요?        │
│  ┌─A────────────────┐ ┌─B────────────────┐ │
│  │ 내 마음 말하기 …   │ │ 바라는 것 말하기 … │ │
│  └──────────────────┘ └──────────────────┘ │
│  ┌─C────────────────┐ ┌─D────────────────┐ │
│  │ 함께 해결하기 …    │ │ 도움 요청하기 …    │ │
│  └──────────────────┘ └──────────────────┘ │
│ [← 이전]                   [이걸로 할래요 →] │
└────────────────────────────────────────────┘
```

**S5 Feedback**
```
┌ [⌂]        ●—●—●—●—●           [🔊] [⚙] ┐
│  ┌ 내가 고른 방법 ───────────────────────┐  │
│  │ [A] 내 마음 말하기  → (outcome icon)   │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │ 친구에게 마음을 말했어요.               │  │
│  │ 내 마음을 잘 표현했어요.                │  │
│  └──────────────────────────────────────┘  │
│                                            │
│ [← 이전]  [다른 방법 해보기]*   [계속 →]     │
└────────────────────────────────────────────┘
```
`*` only when `quality === "reconsider"`.

**S6 Wrap-up**
```
┌                                 [🔊] [⚙] ┐
│        ♡————————♡  (link animation)        │
│  ┌──────────────────────────────────────┐  │
│  │  "내 마음을 말하고 도움을 요청하는 것은  │  │
│  │   나를 지키는 좋은 방법이에요. …"        │  │
│  └──────────────────────────────────────┘  │
│   오늘의 길:  [😢] → 💬 → [A]               │
│                                            │
│   [처음으로]            [다른 상황 연습하기]  │
└────────────────────────────────────────────┘
```

### 6.9 Interaction & feedback rules
- **Every tap gets an immediate response** (≤ 100 ms): visual press state + soft "tick" (if sound on) + the tapped text is spoken.
- **Selection is reversible** until Next; tapping a selected tile again deselects it (single-select: tapping another switches).
- **Auto-read on screen entry** (if setting on): reads the question, then nothing else — the child explores the options by tapping. Exception: S1 reads the current sentence; S5/S6 read the whole card.
- **Idle hint (S2 only):** 20 s with no tap → `HintPanel` slides up once with a soft chime. Never repeats on the same visit unless "도와줘요" is tapped.
- **Disabled Next:** tapping it speaks "먼저 하나를 골라요." and gently wiggles the options (1 cycle, 300 ms; skipped under reduced-motion).
- **No modal errors.** Nothing on the child's path can fail visibly. If TTS is unavailable, the speaker icons show a small "muted" badge and a teacher-facing caption appears once on Home: "이 기기에서는 읽어주기를 사용할 수 없어요."
- **Audio unlock:** first Home visit shows the "시작하기" screen (D-note in 6.8). All speech is queued and cancelled on navigation (no overlapping voices).

### 6.10 Motion
- Durations 200–300 ms, ease-out. Screen transitions: horizontal slide 24 px + fade.
- `ProgressLink` current dot: 2 s soft pulse.
- S6: the link line draws from left heart to right heart over 1.2 s, then a 3-petal sparkle; chime once.
- Honor `prefers-reduced-motion`: replace all motion with instant state changes (keep the chime).

### 6.11 Sound
- Three sounds total, all soft, ≤ 400 ms, −12 dBFS: `tick` (tap), `chime` (hint appears / wrap-up), `turn` (sentence advance). No sound on Next/Back. Sound off → all three muted; TTS stays (separate setting).

### 6.12 Accessibility checklist (binding)
- WCAG 2.2 AA minimum; all text contrast ≥ 7:1 where possible.
- Full keyboard operation; visible focus ring; logical tab order (question → options → help → back → next).
- `aria-pressed` on tiles/cards; `aria-live="polite"` region announces spoken text for screen readers.
- `lang` attribute switches with locale.
- All images have alt text (from `imageBrief` / `alt` fields).
- No content relies on color alone.
- Respect reduced motion; no flashing.

### 6.13 Copy voice (UI strings)
- Korean: 해요체, warm, short. Address the child as 나/우리, never 너/학생.
- Buttons are verbs the child can do: 다음, 이전, 알겠어요, 더 알려줘요, 이걸로 할래요, 다른 방법 해보기, 계속, 처음으로, 다른 상황 연습하기, 도와줘요, 시작하기.
- English equivalents: Next, Back, Got it, Tell me more, Choose this, Try another way, Continue, Home, Practice another situation, Help me, Start.
- Full UI string table in §7.5.

---

## 7. Content

Korean strings are authoritative (typos corrected). English comes from `content-source/translations_ko_en.json` (the table used to produce `eng-ver/*.pdf`); strings not in that file are given inline here. Any string marked **(draft)** must carry `"draft": true` in the data.

### 7.1 Emotion library (`content/emotions.json`)

| id | ko | en | icon | tint |
|---|---|---|---|---|
| `angry` | 화가 나요 | Angry | angry.svg | peach `#F8D7C4` |
| `annoyed` | 짜증나요 | Annoyed | annoyed.svg | apricot `#F9E0C7` |
| `upset` | 속상해요 | Upset | upset.svg | sky `#D6E6F7` |
| `hurt` | 서운해요 | Hurt | hurt.svg | lilac `#E4DDF3` |
| `frustrated` | 답답해요 | Frustrated | frustrated.svg | sand `#F2E6C9` |
| `unfair` | 억울해요 | Unfair | unfair.svg | mauve `#EBD9E3` |
| `worried` | 걱정돼요 | Worried | worried.svg | mist `#DCE7EC` |
| `nervous` | 긴장돼요 | Nervous | nervous.svg | mint `#D9EFE6` |
| `embarrassed` | 창피해요 | Embarrassed | embarrassed.svg | rose `#F6DCE4` |
| `flustered` | 당황스러워요 | Flustered | flustered.svg | cream `#F7EFD6` |
| `shy` | 부끄러워요 | Shy | shy.svg | blush `#F9E3E8` |
| `scared` | 무서워요 | Scared | scared.svg | slate `#DEE3EA` |
| `sorry` | 미안해요 | Sorry | sorry.svg | lavender `#E6E0F2` |
| `amused` | 재미있어요 | Amused | amused.svg | lemon `#F7F0C8` |
| `not-sure` | 잘 모르겠어요 | Not sure | not-sure.svg | grey `#ECEAE6` |

> Note: `eng-ver` PDFs rendered 창피해요 as "Shy" and 당황스러워요 as "Embarrassed." The app uses the mapping above so that 부끄러워요 can be "Shy." Record in `DECISIONS.md`.

### 7.2 Content schema (TypeScript — implement with Zod in `src/content/schema.ts`)

```ts
type Locale = 'ko' | 'en';
type LString = { ko: string; en?: string; audio?: { ko?: string; en?: string }; draft?: boolean };
// ko is required and is the shipped language (D17). en is optional, dev/demo only; the resolver falls back to ko.

interface Scenario {
  id: string;                       // kebab-case, unique
  domain: 'self' | 'social' | 'relation' | 'mind' | 'reserved';
  order: number;                    // position within domain
  title: LString;                   // content title (deck slide 01)
  learningGoal: LString;            // teacher-facing
  estimatedMinutes: number;
  situation: {
    title: LString;
    story: LString[];               // one sentence each; shown one at a time
    keySentence: LString;
    image?: string;                 // path under /img; if absent → placeholder from imageBrief
    imageBrief: LString;            // alt text + placeholder caption
  };
  feeling: {
    subject: 'self' | 'other';
    question: LString;
    options: string[];              // emotion ids; last must be 'not-sure'
    multiSelect: boolean;
    hint: { text: LString; suggest: [string, string] };
  };
  step3:
    | { type: 'reason';        question: LString; byFeeling: Record<string, LString>; principle: LString; more: LString }
    | { type: 'body-reaction'; question: LString; byFeeling: Record<string, { text: LString; parts: BodyPart[] }>; principle: LString; more: LString }
    | { type: 'multiple-choice'; question: LString; options: { id: 'A'|'B'|'C'|'D'; text: LString; ack: LString }[]; principle: LString; more: LString };
  action: {
    question: LString;
    options: { id: 'A'|'B'|'C'|'D'; text: LString; quality: 'recommended'|'acceptable'|'reconsider'; feedback: LString; outcomeIcon: string }[];
  };
  closing: LString;
}
type BodyPart = 'head'|'eyes'|'mouth'|'chest'|'stomach'|'hands'|'body';
```

Validator rules (§10) enforce: every `feeling.options` id (except `not-sure`) has a `step3.byFeeling` entry for reason/body types; all four actions have feedback; `not-sure` is last; every `LString` has `ko` (`en` optional, D17).

### 7.3 UI strings (`content/ui.json`)

| key | ko | en |
|---|---|---|
| `app.name` | 마음잇다 | Maum:Link |
| `home.greeting` | 오늘은 어떤 마음을 배워볼까요? | Which feeling shall we learn about today? |
| `home.start` | 시작하기 | Start |
| `home.done` | 완료 | Done |
| `home.count` | 상황 {n}개 | {n} situation(s) |
| `home.reserved` | 준비 중 | Coming soon |
| `domain.self` | 자기 인식 | Self-Awareness |
| `domain.social` | 관계 인식 | Social Awareness |
| `domain.relation` | 관계 관리 | Relationship Management |
| `domain.mind` | 마음건강관리 | Mental Health Care |
| `nav.next` | 다음 | Next |
| `nav.back` | 이전 | Back |
| `nav.home` | 처음으로 | Home |
| `nav.continue` | 계속 | Continue |
| `nav.gotIt` | 알겠어요 | Got it |
| `nav.tellMore` | 더 알려줘요 | Tell me more |
| `nav.chooseThis` | 이걸로 할래요 | Choose this |
| `nav.tryAnother` | 다른 방법 해보기 | Try another way |
| `nav.practiceAnother` | 다른 상황 연습하기 | Practice another situation |
| `nav.help` | 도와줘요 | Help me |
| `feeling.chose` | {emotion} 를 골랐어요. | You chose {emotion}. |
| `feeling.pickFirst` | 먼저 하나를 골라요. | Choose one first. |
| `feeling.notSureTwice` | 괜찮아요. 함께 {emotion} 부터 살펴봐요. | That's okay. Let's look at {emotion} together. |
| `feedback.myChoice` | 내가 고른 방법 | What I chose |
| `wrapup.path` | 오늘의 길 | Today's path |
| `confirm.home` | 처음으로 갈까요? | Go back home? |
| `confirm.yes` | 네 | Yes |
| `confirm.no` | 아니요 | No |
| `settings.title` | 설정 | Settings |
| `settings.textSize` | 글자 크기 | Text size |
| `settings.sound` | 소리 | Sound |
| `settings.autoRead` | 자동으로 읽어주기 | Read aloud automatically |
| `tts.unavailable` | 이 기기에서는 읽어주기를 사용할 수 없어요. | Read-aloud is not available on this device. |

### 7.4 Scenarios

#### 7.4.1 `relation-pencil-prank` — Relationship Management (관계 관리)
- **title:** 친구와 친해져요! 관계관리 프로그램 / Let's Be Friends! Relationship Management Program
- **learningGoal:** 친구와 친해질 수 있는 말과 행동을 알고 상황에 맞게 사용할 수 있다. / Can know words and actions that help make friends, and use them to fit the situation.
- **estimatedMinutes:** 7
- **situation.title:** 나는 장난이었는데, 친구는 속상해요 / It was a joke to me, but my friend is upset
- **situation.story:**
  1. 쉬는 시간이에요. / It's break time.
  2. 나는 친구를 웃겨주려고 친구의 연필을 살짝 숨겼어요. / I secretly hid my friend's pencil to make them laugh.
  3. 그런데 친구는 연필을 찾으며 웃지 않고 표정이 좋지 않아요. / But my friend isn't laughing while looking for the pencil, and looks unhappy.
- **situation.keySentence:** "어? 친구가 웃지 않아요." / "Huh? My friend isn't laughing."
- **situation.image:** none → placeholder
- **situation.imageBrief:** 초등학교 교실 / 주인공이 친구 연필을 살짝 숨기는 모습 / 친구는 연필을 찾고 있음 / 표정은 과하게 강조하지 않기 / Elementary classroom; main character secretly hides a friend's pencil; friend is looking for it; don't exaggerate facial expressions
- **feeling.subject:** `other`
- **feeling.question:** 연필을 찾는 친구는 어떤 기분일까요? / How does the friend looking for the pencil feel?
- **feeling.options:** `worried`, `upset`, `angry`, `flustered`, `amused`, `not-sure`
- **feeling.hint (draft):** 친구의 얼굴을 봐요. 웃지 않고 연필을 찾고 있어요. / Look at your friend's face. They aren't smiling and they're looking for the pencil. — suggest `worried`, `upset`
- **step3.type:** `multiple-choice`
- **step3.question:** 친구는 왜 그런 기분이 들었을까요? / Why did my friend feel that way?
- **step3.options:**
  - A: 연필이 없어져서 걱정이 되었어요 / Worried because the pencil went missing — ack (draft): 그럴 수 있어요. 아끼는 물건이 없어지면 걱정돼요. / That could be. Losing something you care about is worrying.
  - B: 누가 연필을 가져갔다고 생각했어요. / Thought someone took the pencil. — ack (draft): 그럴 수 있어요. 누가 가져갔다고 생각하면 마음이 불편해요. / That could be. Thinking someone took it feels uncomfortable.
  - C: 연필을 찾지 못해 속상했어요. / Upset at not finding the pencil. — ack (draft): 그럴 수 있어요. 찾아도 없으면 속상해요. / That could be. It's upsetting when you can't find it.
  - D: 친구가 장난친 것이 재미있었어요. / Thought the friend's prank was funny. — ack (draft): 그렇게 느낄 수도 있어요. 그런데 친구의 표정을 다시 한번 볼까요? / Maybe. But let's look at your friend's face once more.
- **step3.principle:** 나는 친구를 웃겨주려고 장난을 했어요. 하지만 친구는 속상하거나 걱정할 수 있어요. / I played a prank to make my friend laugh. But my friend may feel upset or worried.
- **step3.more (draft):** 예를 들어, 내가 아끼는 물건이 갑자기 없어지면 나도 걱정되고 속상할 거예요. / For example, if something I care about suddenly went missing, I'd feel worried and upset too.
- **action.question:** 친구의 표정을 보니 내가 생각한 것과 다른 것 같아요. 어떻게 하면 좋을까요? / My friend's face looks different from what I expected. What should I do?
- **action.options:**
  - A `reconsider` — 재미있는 장난이라고 생각하고 계속 숨겨요. / Think it's a fun joke and keep hiding it. → 친구가 왜 그런 표정을 지었는지 생각해봐요. / Think about why your friend made that face. — outcomeIcon `think`
  - B `reconsider` — 친구가 찾을 때까지 아무 말도 하지 않아요. / Say nothing until the friend finds it. → 없어진 물건이 있다면 속상하겠죠? 친구 마음을 생각해봐요. / You'd be upset if something of yours went missing, right? Think about your friend's feelings. — outcomeIcon `think`
  - C `recommended` — 연필을 돌려주고 "미안해. 나는 네가 웃을 줄 알았어."라고 말해요. / Give the pencil back and say, "Sorry. I thought you'd laugh." → 용기 있는 선택이네요. 미안한 마음이 들 때 바로 사과하는 멋진 모습입니다. / That's a brave choice. Apologizing right away when you feel sorry is wonderful. — outcomeIcon `handshake`
  - D `recommended` — "내가 장난으로 숨겼는데 속상했어?"라고 친구에게 물어봐요. / Ask the friend, "I hid it as a joke. Did that upset you?" → 친구의 마음을 직접 물어보고 확인했다니 친구도 마음이 살짝 풀렸을 거예요. / You asked and checked how your friend feels, so your friend probably feels a bit better. — outcomeIcon `talk`
- **closing:** 나는 재미있어도 친구는 재미없을 수 있어요. 친구의 표정과 마음도 살펴봐요. / Even if it's fun for me, it may not be fun for my friend. Let's look at my friend's face and feelings too.

#### 7.4.2 `social-playground` — Social Awareness (관계 인식)
- **title:** 나와 너의 생각이 다를 수 있어! / You and I Can Think Differently!
- **learningGoal:** 또래 상황에서 자신의 감정을 알아차리고, 상대의 관점을 생각하며 적절한 대처방법을 탐색할 수 있다. / In peer situations, can notice own feelings, consider the other's view, and explore suitable ways to respond.
- **estimatedMinutes:** 7
- **situation.title:** 친구들과 함께 놀고 싶어요 / I want to play with my friends
- **situation.story:**
  1. 쉬는 시간에 친구들이 운동장에서 함께 놀고 있어요. / At break, my friends are playing together on the playground.
  2. 나는 친구들과 같이 놀고 싶지만, 친구들은 아직 나를 부르지 않았어요. / I want to join them, but they haven't called me yet.
- **situation.keySentence:** "나도 같이 놀고 싶어!" / "I want to play too!"
- **situation.image:** `content-source/images/sa-playground.png` → copy to `public/img/social-playground.png` (resize to max 1600 px wide, WebP + PNG fallback)
- **situation.imageBrief:** 학교 운동장 / 친구 2~3명이 함께 놀이 중 / 주인공이 조금 떨어진 곳에서 바라보는 장면 / School playground; 2–3 friends playing together; main character watching from a little way off
- **feeling.subject:** `self`
- **feeling.question:** 이 상황에서 나는 어떤 기분이 들까요? / How would I feel in this situation?
- **feeling.options:** `annoyed`, `angry`, `embarrassed`, `hurt`, `worried`, `not-sure`
- **feeling.hint (draft):** 나는 친구들과 놀고 싶은데 아직 아무도 나를 부르지 않았어요. 어떤 마음이 들까요? / I want to play, but nobody has called me yet. How might that feel? — suggest `hurt`, `worried`
- **step3.type:** `reason`
- **step3.question:** 왜 그런 기분이 들었을까요? / Why did I feel that way?
- **step3.byFeeling:**
  - `annoyed`: 친구들이 나와 놀기 싫어한다고 생각해서 / I think my friends don't want to play with me
  - `angry`: 나만 빼고 노는 것 같아서 / It feels like they're leaving me out
  - `embarrassed`: 어떻게 같이 놀자고 말해야 할지 몰라서 / I don't know how to ask to play
  - `hurt` **(draft)**: 친구들이 나를 불러주지 않아서 / Because my friends didn't call me
  - `worried`: 친구들이 거절할까 봐 걱정돼서 / Afraid my friends will say no
- **step3.principle:** 같은 상황에서도 사람마다 다른 마음이 들 수 있어요. / People can feel differently in the same situation.
- **step3.more (draft):** 같은 일이 있어도 어떤 친구는 서운하고, 어떤 친구는 걱정돼요. 둘 다 괜찮아요. / In the same situation, one friend may feel hurt and another may feel worried. Both are okay.
- **action.question:** 친구들과 함께 놀고 싶다면 어떻게 해볼 수 있을까요? / What can I do if I want to play with my friends?
- **action.options:**
  - A `reconsider` — 친구들에게 화를 내며 "왜 나만 빼고 놀아!"라고 말해요. / Get angry and say, "Why are you leaving me out?!" → 화가 날 수 있어요. 하지만 화를 내며 말하면 친구들이 놀라거나 속상할 수 있어요. "나도 같이 놀고 싶어."라고 말해보면 어떨까요? / It's okay to feel angry. But speaking angrily may scare or upset your friends. How about saying, "I want to play too"? — outcomeIcon `think`
  - B `acceptable` — 가까이에 가서 조용히 친구들을 기다려요. / Go close and quietly wait for my friends. → 가까이에서 기다리면 친구들이 내 마음을 알아줄 수도 있지만, 모를 수도 있어요. 함께 놀고 싶다면 내 마음을 말해보는 건 어떨까요? / If you wait nearby, your friends might notice how you feel, or they might not. If you want to play together, why not tell them? — outcomeIcon `wait`
  - C `recommended` — 친구들에게 "나도 같이 놀아도 돼?"라고 물어봐요. / Ask my friends, "Can I play too?" → 좋은 방법이에요. "나도 같이 놀아도 돼?" 함께하고 싶은 마음을 말로 표현하면 친구가 내 마음을 알 수 있어요. / Good idea! "Can I play too?" When you say you want to join, your friends can know how you feel. — outcomeIcon `talk`
  - D `acceptable` — 친구에게 말하기 어렵다면 선생님에게 "저도 같이 놀고 싶어요"라고 말해요. / If it's hard to tell my friends, tell the teacher, "I want to play too." → 도움이 필요할 때 선생님에게 말할 수 있어요. 다음에는 용기를 내어 친구에게 내 마음을 직접 말해보는 것도 좋아요. / You can tell your teacher when you need help. Next time, you could also be brave and tell your friend how you feel. — outcomeIcon `teacher`
- **closing:** 내 마음은 말로 표현할 수 있어요. 친구에게 내가 원하는 것을 말해보고, 어려울 때 어른에게 도움을 요청해요. / I can put my feelings into words. I tell my friend what I want, and ask an adult for help when it's hard.

#### 7.4.3 `mind-lunch-line` — Mental Health Care (마음건강관리)
- **title:** 내 마음을 표현하고 도움을 요청해요 / Express My Feelings and Ask for Help
- **learningGoal:** 자신의 감정을 알고, 이유를 생각하며, 도움을 요청할 수 있다. / Can recognize own feelings, think about why, and ask for help.
- **estimatedMinutes:** 7
- **situation.title:** 내 차례인데 친구가 새치기를 했어요 / It was my turn, but a friend cut in line
- **situation.story:**
  1. 급식실에서 내 앞으로 슬그머니 새치기를 하는 친구가 있어요. / In the lunchroom, a friend sneaks in line in front of me.
  2. 이번이 첫 번째가 아니에요. / It's not the first time.
  3. 뭐라고 이야기하고 싶은데, 친구에게 어떻게 말해야 할지 모르겠어요. / I want to say something, but I don't know how to say it to my friend.
- **situation.keySentence:** 새치기 하는 친구가 있어요 / A friend cuts in line
- **situation.image:** none → placeholder
- **situation.imageBrief:** 학교 급식실에서 줄을 선 아이들 사이에 슬쩍 들어가 서는 아이의 모습. 뒤에 서 있는 아이는 어떻게 해야 할지 난감해하는 표정. / In the school lunchroom, a child slips into the line. The child behind hesitates, unsure what to do.
- **feeling.subject:** `self`
- **feeling.question:** 이 상황에서 나는 어떤 기분이 들까요? / How would I feel in this situation?
- **feeling.options:** `upset`, `frustrated`, `unfair`, `sorry`, `not-sure`
- **feeling.hint (draft):** 내 차례였는데 친구가 앞에 섰어요. 뭐라고 말하고 싶은데 말이 잘 안 나와요. / It was my turn, but my friend stepped in front. I want to say something but the words won't come. — suggest `upset`, `frustrated`
- **step3.type:** `reason`
- **step3.question:** 왜 그런 마음이 들었을까요? / Why did I feel that way?
- **step3.byFeeling:**
  - `upset`: 친구가 내 앞으로 자주 새치기를 해서 / My friend often cuts in front of me
  - `frustrated`: 친구에게 뭐라고 이야기하고 싶은데 말이 잘 안 나와서 / I want to say something to my friend but the words won't come
  - `unfair`: 내 차례였는데 친구가 새치기를 하니 내 순서가 뒤로 밀려서 / It was my turn, but my friend cut in and pushed me back
  - `sorry`: 뒤에 서 있는 친구들에게 미안한 마음이 들어서 / I feel bad for the friends standing behind me
- **step3.principle:** 같은 상황에서도 사람마다 다른 마음이 들 수 있어요. / People can feel differently in the same situation.
- **step3.more (draft):** 여러 가지 마음이 한꺼번에 들 수도 있어요. 속상하면서 미안할 수도 있어요. / You can have several feelings at once. You can feel upset and sorry at the same time.
- **action.question:** 그런 마음이 들 때 어떻게 하면 좋을까요? / What can I do when I feel that way?
- **action.options:**
  - A `recommended` — 내 마음 말하기 – "네가 새치기해서 나는 속상했어"라고 말하기 / Say how I feel – "I was upset when you cut in front of me" → 친구에게 마음을 말했어요. 내 마음을 잘 표현했어요. / You told your friend how you feel. You expressed yourself well. — outcomeIcon `talk`
  - B `recommended` — 바라는 것 말하기 – "다음에는 순서를 지켜주면 좋겠어"라고 말해요 / Say what I want – "Next time, please wait your turn" → 친구에게 바라는 것을 말한 '나', 자랑스러워요. / I'm proud of myself for telling my friend what I want. — outcomeIcon `talk`
  - C `recommended` — 함께 해결하기 – 친구들과 함께 "우리 순서대로 줄을 서자"라고 이야기해요 / Solve it together – say with friends, "Let's line up in order" → 혼자 해결하기 어려울 땐 힘을 합쳐요. / When it's hard alone, work together. — outcomeIcon `together`
  - D `recommended` — 도움 요청하기 – 선생님에게 "친구와 해결하기 어려워요. 도와주세요"라고 말해요 / Ask for help – tell the teacher, "It's hard to solve this with my friend. Please help me." → 선생님께 도움을 요청했군요. 혼자 참는 것보다 때로는 도움을 요청하는 것이 더 좋아요. / You asked your teacher for help. Sometimes asking for help is better than holding it in alone. — outcomeIcon `teacher`
- **closing:** 내 마음을 말하고 도움을 요청하는 것은 나를 지키는 좋은 방법이에요. 힘들 때는 혼자 참지 말고 믿을 만한 어른에게 이야기해요. / Saying how I feel and asking for help are good ways to protect myself. When it's hard, don't hold it in—talk to a trusted adult.

#### 7.4.4 `self-presentation-teasing` — Self-Awareness (자기 인식)
- **title:** 나를 느끼는 여행 – 내 마음을 알아가면 더 잘 할 수 있어! / A Journey to Feel Myself – Knowing my feelings helps me do better!
- **learningGoal:** 내 일상생활 속 내 기분에 반응하는 신체반응과 대처 방법을 탐색할 수 있다. / Can explore how my body reacts to my feelings in daily life, and ways to cope.
- **estimatedMinutes:** 7
- **situation.title:** 친구들이 내 발표 실수를 듣고 놀려요 / Friends tease me about a mistake in my presentation
- **situation.story:**
  1. **(draft)** 나는 열심히 준비한 발표를 했어요. / I gave a presentation I worked hard on.
  2. **(draft)** 그런데 친구들이 내 발표 실수를 듣고 놀려요. / But my friends heard my mistake and teased me.
  3. 내가 노력하여 만든 발표를 친구들이 놀리니 속상해요. / I'm upset that friends teased the presentation I worked hard on.
- **situation.keySentence:** 속상한 마음을 혼자 해결하고 싶어 / I want to handle my upset feelings on my own
- **situation.image:** `content-source/images/self-presentation-teasing.png` → `public/img/self-presentation-teasing.png` (Korean text baked in; acceptable for `ko`; for `en` show the placeholder instead — implement via optional `imageByLocale`)
- **situation.imageBrief:** 교실에서 발표를 마친 아이가 고개를 숙이고 있고, 친구들이 웃으며 놀리는 장면. 표정은 과하게 강조하지 않기. / A child who just finished presenting looks down while classmates laugh and tease. Don't exaggerate faces. **(draft)**
- **feeling.subject:** `self`
- **feeling.question:** 그때 내 기분은 어떨까요? / How do I feel then?
- **feeling.options:** `angry`, `worried`, `upset`, `nervous`, `shy`, `scared`, `not-sure`  *(shy, scared added per the student's note; max 6 tiles + not-sure → show 7 as 4 + 3 on lg)*
- **feeling.hint (draft):** 열심히 준비했는데 친구들이 놀렸어요. 내 몸은 지금 어떤가요? / I prepared hard and my friends teased me. What is my body doing right now? — suggest `upset`, `angry`
- **step3.type:** `body-reaction`
- **step3.question:** 그때 내 몸의 반응은 어떤가요? / How does my body react then?
- **step3.byFeeling:**
  - `angry`: 머리에 열이 오르고, 눈이 뜨거워지고, 목소리가 커져요. / My head gets hot, my eyes burn, and my voice gets louder. — parts `head, eyes, mouth`
  - `nervous`: 가슴이 쿵쿵 뛰고, 입술이 말라요. / My heart pounds and my lips get dry. — parts `chest, mouth`
  - `upset`: 눈물이 나오고, 고개가 숙여지고, 몸에 힘이 빠져요. / Tears come out, my head drops, my body feels weak. — parts `eyes, head, body`
  - `worried`: 배가 아프고, 머리가 아파요. / My stomach hurts and my head hurts. — parts `stomach, head`
  - `shy` **(draft)**: 얼굴이 빨개지고, 눈을 마주치기 어려워요. / My face turns red and it's hard to look at people. — parts `head, eyes`
  - `scared` **(draft)**: 몸이 떨리고, 숨이 빨라져요. / My body shakes and my breathing gets fast. — parts `body, chest`
- **step3.principle:** 내 몸의 반응을 보면 내 감정을 알 수 있어요. / I can recognize my feelings from my body's reactions.
- **step3.more (draft):** 마음이 바뀌면 몸도 바뀌어요. 몸의 신호를 알면 내 마음을 더 잘 알 수 있어요. / When my feelings change, my body changes too. Knowing my body's signals helps me know my feelings.
- **action.question:** 이런 마음과 몸의 반응이 나타날 때 나에게 필요한 것은? / What do I need when I have these feelings and body reactions?
- **action.options:**
  - A `recommended` — 발표가 끝나고 혼자서 산책하기 / Take a walk alone after the presentation → 발표가 끝난 뒤 쉬는 시간에 운동장에 나가 가볍게 산책을 해봐요. 어떤 마음이 들까요? / After the presentation, take a short walk on the playground during break. How might you feel? — outcomeIcon `walk`
  - B `recommended` — 마음을 위로하기 위해 그림을 그려보기 / Draw a picture to comfort myself → 그림을 그려 내 마음을 표현하는 방법은 어떤가요? 그림을 그린다면 어떤 마음이 들까요? / How about drawing to express your feelings? How might drawing make you feel? — outcomeIcon `draw`
  - C `recommended` — 조용한 곳에 잠시 혼자 있기 / Spend a moment alone in a quiet place → 좋은 방법이에요. 잠시 조용히 앉아 있으면 어떤 마음이 들까요? / Good idea. How might you feel sitting quietly for a moment? — outcomeIcon `quiet`
  - D `recommended` — 숨을 크게 내쉬어보기 / Take a deep breath → 숨을 크게 내쉬어 봐요. 그래도 기분이 풀리지 않는다면 선생님께도 이야기할 수 있어요. / Take a deep breath. If you still don't feel better, you can also talk to your teacher. — outcomeIcon `breathe`
- **closing:** 앞으로 혼자 속상한 일이 있거나 같은 상황이 있을 때 오늘과 같이 해보는 거예요. 우리 모두는 소중하니까요. / Next time you feel upset or face the same situation, try what you did today. Because every one of us matters.

### 7.5 Outcome icons (`public/icons/outcome/*.svg`)
`think`, `wait`, `talk`, `together`, `teacher`, `handshake`, `walk`, `draw`, `quiet`, `breathe` — same line style as §6.6.

---

## 8. Functional requirements

Each requirement is testable. IDs are stable; reference them in commits and tests.

### 8.1 Engine & content
- **FR-ENG-01** Adding a valid scenario JSON under `content/scenarios/` and rebuilding makes it appear on Home under its domain and fully playable with no code change.
- **FR-ENG-02** Content is validated at build time; an invalid file fails the build with a plain-language message naming file, field and problem.
- **FR-ENG-03** The engine implements the state machine in §5.2 exactly, including Back rules and session persistence.
- **FR-ENG-04** Step 3 renders the correct variant from `step3.type`; for `reason`/`body-reaction` it shows entries for every selected feeling (stacked, in selection order).
- **FR-ENG-05** The app ships in Korean only. A `?lang=en` URL parameter (dev/demo only, not persisted, not exposed in UI) renders English where `en` strings exist and falls back to Korean otherwise, and switches TTS to `en-US`.

### 8.1a Responsive (hard requirement — D16)
- **FR-RES-01** At every viewport in the matrix (§12, "Viewport matrix") no screen produces horizontal overflow (`document.documentElement.scrollWidth <= clientWidth`) at any step of any scenario.
- **FR-RES-02** At every viewport, every interactive element has a rendered hit area ≥ 64 × 64 px and does not overlap another interactive element (asserted via bounding boxes in e2e).
- **FR-RES-03** At every viewport, the primary action button and the Back button are visible without scrolling on every lesson screen (sticky bottom bar within `100dvh` + safe-area insets).
- **FR-RES-04** No text is clipped or truncated with ellipsis on the child path at any viewport with either text-size setting; all content is reachable by vertical scroll where it does not fit.
- **FR-RES-05** Rotating the device (or resizing the window across a breakpoint) at any lesson step preserves step, selections, open sheet and ongoing speech, and re-lays out without a page reload.
- **FR-RES-06** Images never cause layout shift (CLS ≤ 0.05 on S1 at all viewports) and are served at an appropriate resolution via `srcset`.
- **FR-RES-07** The layout respects `env(safe-area-inset-*)`: on iPad in standalone mode no control sits under the home indicator; on notched phones no control sits under the notch in landscape.

### 8.2 Home
- **FR-HOME-01** First visit shows a full-screen "시작하기" button; tapping it unlocks audio and shows Home with a spoken greeting.
- **FR-HOME-02** Four domain cards + one reserved card; cards show scenario count and a "완료" badge if any scenario in the domain is completed.
- **FR-HOME-03** Tapping a domain with one scenario starts it directly; with several, shows a scenario picker in the same card style.

### 8.3 Situation (S1)
- **FR-S1-01** Story sentences display one at a time with sentence dots; tap or Next advances; the current sentence is spoken on display.
- **FR-S1-02** The key sentence appears in a speech bubble after the last story sentence; Next then goes to S2.
- **FR-S1-03** If `image` is absent, a placeholder card renders using the domain tint and `imageBrief` (brief text at caption size, teacher-facing).

### 8.4 Feeling (S2)
- **FR-S2-01** Emotion tiles render from `feeling.options` in order, each with icon + localized word; tapping speaks the word and toggles selection per `multiSelect`.
- **FR-S2-02** Next is disabled until ≥1 feeling is selected; tapping disabled Next speaks `feeling.pickFirst` and wiggles tiles once.
- **FR-S2-03** "도와줘요" opens `HintPanel` with `feeling.hint.text` (spoken) and the two suggested tiles (tappable, selecting and closing the panel).
- **FR-S2-04** After 20 s without any tap on S2, `HintPanel` opens automatically once per visit.
- **FR-S2-05** Selecting `not-sure` opens the hint panel; if `not-sure` is selected again after the hint, the first suggested feeling is auto-selected and `feeling.notSureTwice` is spoken, then Next enables.

### 8.5 Step 3 (S3)
- **FR-S3-01** Header shows the chosen emotion icon + `feeling.chose`.
- **FR-S3-02** `reason`: shows question + the `byFeeling` sentence(s) + principle. `body-reaction`: additionally shows the body outline with `parts` highlighted. `multiple-choice`: shows A–D cards; selecting one reveals its `ack` and enables "알겠어요".
- **FR-S3-03** "더 알려줘요" reveals `step3.more` (spoken) below the content; the button then hides; "알겠어요" always proceeds to S4.

### 8.6 Action (S4) & Feedback (S5)
- **FR-S4-01** Four `ChoiceCard`s A–D; tapping speaks the card; "이걸로 할래요" is enabled after a selection and proceeds to S5.
- **FR-S5-01** S5 shows `OutcomePanel` (chosen action + outcomeIcon) and the feedback text, spoken.
- **FR-S5-02** If `quality === 'reconsider'`, a "다른 방법 해보기" button returns to S4 with the tried card visually dimmed (still selectable). Otherwise only "계속" shows.
- **FR-S5-03** "계속" marks the scenario completed in `localStorage` and goes to S6.

### 8.7 Wrap-up (S6)
- **FR-S6-01** Plays the link animation + chime, speaks `closing`, shows the path recap (emotion icon → step-3 icon → action letter).
- **FR-S6-02** "다른 상황 연습하기" goes to the next scenario in the same domain by `order`, or Home if none; "처음으로" goes Home.

### 8.8 Settings & audio
- **FR-SET-01** Settings sheet: text size (normal/large), sound (on/off), auto-read (on/off); all persist in `localStorage` and apply immediately. No language setting (D17).
- **FR-AUD-01** `speak(text)` uses Web Speech API with the locale's voice (prefer `ko-KR` Google/Apple voices; rate 0.9; pitch 1.0); new speech cancels any ongoing speech; navigation cancels speech.
- **FR-AUD-02** If an `audio` URL exists for the text/locale, play it instead of TTS.
- **FR-AUD-03** If TTS is unsupported, speaker buttons show a muted badge; a one-time teacher caption appears on Home; nothing else breaks.
- **FR-AUD-04** Three UI sounds per §6.11, muted by the sound setting.

### 8.9 PWA & offline
- **FR-PWA-01** Installable (manifest with name 마음잇다, icons 192/512, `display: standalone`, `orientation: any`, theme `#FBF8F3`).
- **FR-PWA-02** After first load, all screens, content, images, fonts, icons and sounds work offline (precache via vite-plugin-pwa; content JSON included in the bundle).

---

## 9. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | First load ≤ 2.5 s on a 2019 iPad over school Wi-Fi; route transitions ≤ 100 ms; total bundle ≤ 1.5 MB gzipped excluding images; images ≤ 300 KB each (WebP) |
| Compatibility | Safari iPadOS 15+, Chrome Android 100+, Chrome/Edge desktop current; Samsung Internet 18+ |
| Responsiveness | D16 / FR-RES-01…07 at every viewport in the §12 matrix, both orientations, both text sizes |
| Accessibility | §6.12 in full; Lighthouse a11y ≥ 95 |
| Privacy | No network requests after load except own assets; no cookies; `localStorage` holds only settings + completion flags |
| Reliability | Refresh on any lesson screen restores that screen; no uncaught errors in console on the happy path of all four scenarios |
| Maintainability | Engine code has zero scenario-specific branches; content schema versioned (`schemaVersion: 1`) |
| Localization | Shipped locale is Korean only (D17). All strings still go through `LString` / `ui.json` (no hard-coded text in components) so a future locale is a content change |

---

## 10. Content validator (`scripts/validate-content.ts`)
Run via `pnpm validate` and as a Vite build plugin. Checks, each with a human-readable message:
1. Schema (Zod) passes; `schemaVersion === 1`.
2. `id` unique; file name equals `id`.
3. Every emotion id in `feeling.options` and `hint.suggest` exists in `emotions.json`; `not-sure` is last in `options` and never in `suggest`.
4. For `reason`/`body-reaction`: `byFeeling` has an entry for every option except `not-sure`; no extra keys.
5. `action.options` has exactly four ids A–D in order; each has non-empty `feedback`; `outcomeIcon` file exists.
6. Every `LString` has non-empty `ko`; `en` is optional (warn, don't fail, if missing); `draft` strings are listed in a summary at the end (count per file).
7. Story sentences ≤ 60 Korean characters; key sentence ≤ 30.
8. Referenced images exist under `public/img`.
Exit code non-zero on any error; warnings (drafts, long sentences) do not fail.

---

## 11. Technical architecture

### 11.1 Stack (locked, D13/D14)
Latest stable majors at M0 (expected: React 19.x, TypeScript 5.x, Vite 7.x, Tailwind 4.x, React Router 7.x in library/data mode), Zustand (settings + lesson store), vite-plugin-pwa, Zod, Vitest + Testing Library, Playwright, ESLint + Prettier, pnpm. The agent verifies current versions with `pnpm view <pkg> version` at M0 rather than trusting the numbers here.

Architecture is a **client-side SPA**, not a meta-framework. Rationale (record in `docs/DECISIONS.md` as "Why SPA, not Next"): no server, no data fetching, no auth, no SEO; offline PWA is a core requirement and is a one-plugin setup in Vite; the lesson steps are state-machine states, not routes, so only `/` and `/lesson/:id` exist. Revisit only if v2 adds accounts or a teacher dashboard with a real backend.

Use React 19 features where they simplify code: `use()` for the content loader, native `<title>`/`<meta>` hoisting for per-screen titles, `ref` as a prop; avoid Server Components / Actions (no server exists).

### 11.2 Repository layout
```
maumlink/
├─ PRD-v1.md  APP_PROPOSAL.md  ANALYSIS_REPORT.md        # keep at repo root
├─ content/
│  ├─ emotions.json
│  ├─ ui.json
│  └─ scenarios/
│     ├─ relation-pencil-prank.json
│     ├─ social-playground.json
│     ├─ mind-lunch-line.json
│     └─ self-presentation-teasing.json
├─ content-source/            # client originals (images, translation table) — read-only
├─ public/
│  ├─ img/                    # scenario illustrations (webp + png)
│  ├─ icons/emotions/*.svg  icons/outcome/*.svg  icons/domain/*.svg  icons/ui/*.svg
│  ├─ sounds/tick.mp3 chime.mp3 turn.mp3
│  ├─ fonts/NotoSansKR-*.woff2
│  └─ manifest.webmanifest, pwa icons
├─ scripts/validate-content.ts
├─ src/
│  ├─ app/            router, providers, App.tsx
│  ├─ content/        schema.ts (Zod + types), loader.ts (imports all JSON, validates in dev)
│  ├─ engine/         lessonMachine.ts (pure reducer), selectors.ts, persistence.ts
│  ├─ services/       speech.ts (TTS/audio queue), sound.ts, storage.ts, idle.ts
│  ├─ i18n/           useT.ts (ui.json + LString resolver)
│  ├─ design/         tokens.css, Button.tsx, IconButton.tsx, Card.tsx, EmotionTile.tsx,
│  │                  ChoiceCard.tsx, SpeechBubble.tsx, ProgressLink.tsx, Sheet.tsx, BodyOutline.tsx
│  ├─ screens/        Home.tsx, StartGate.tsx, lesson/{Situation,Feeling,Step3,Action,Feedback,Wrapup}.tsx,
│  │                  lesson/LessonShell.tsx (top/bottom bars), SettingsSheet.tsx
│  └─ main.tsx
├─ tests/
│  ├─ unit/           lessonMachine.test.ts, validator.test.ts, speech.test.ts, i18n.test.ts
│  └─ e2e/            happy-path.spec.ts (parametrized over 4 scenarios), settings.spec.ts
├─ docs/
│  ├─ ADDING_A_SCENARIO.md   DECISIONS.md   PROGRESS.md   TABLET_TEST_CHECKLIST.md
└─ README.md
```

### 11.3 Key modules
- **`engine/lessonMachine.ts`** — pure `(state, event) => state`. States per §5.2; events: `NEXT`, `BACK`, `SELECT_FEELING(id)`, `OPEN_HINT`, `CLOSE_HINT`, `SELECT_STEP3_OPTION(id)`, `TELL_MORE`, `GOT_IT`, `SELECT_ACTION(id)`, `CHOOSE`, `TRY_ANOTHER`, `CONTINUE`, `IDLE_TICK`. 100% unit-tested.
- **`services/speech.ts`** — `speak({text, locale, audioUrl?}) : Promise<void>`, `cancel()`, `isSupported()`; single queue; picks voice by `lang` prefix; falls back to default voice; resolves on `end`/`error`.
- **`services/idle.ts`** — `useIdle(ms, onIdle, deps)`; resets on pointer/key events within the screen.
- **`content/loader.ts`** — `import.meta.glob('/content/scenarios/*.json', { eager: true })`, parses with Zod in dev, exports `scenarios`, `byDomain`, `emotions`, `ui`.
- **`i18n/useT.ts`** — `t(key, params)` for `ui.json`; `L(lstring)` resolves locale with `ko` fallback.

### 11.4 Data stored on device
| Key | Shape |
|---|---|
| `maumlink.settings.v1` | `{ textSize: 'normal'|'large', sound: boolean, autoRead: boolean, locale: 'ko'|'en', started: boolean }` |
| `maumlink.progress.v1` | `{ [scenarioId]: { completedAt: ISO, times: number } }` |
| `sessionStorage maumlink.session.v1` | `{ scenarioId, step, feelingIds, step3OptionId?, actionId?, triedActionIds[] }` |

---

## 12. Testing requirements
- **Unit (Vitest):** lesson machine (all transitions incl. Back, try-another, not-sure-twice), validator (each rule has a failing fixture), i18n resolver, speech queue (mocked `speechSynthesis`).
- **Component (Testing Library):** EmotionTile selection/aria, ChoiceCard, Disabled-Next behavior, HintPanel open/close, Settings persistence.
- **E2E (Playwright, Chromium + WebKit):** for each of the 4 scenarios: Start → Home → complete lesson via recommended path → Wrap-up → Home; plus: reconsider path shows "Try another way"; refresh mid-lesson restores screen; offline reload works (service worker); `?lang=en` renders with Korean fallback.
- **Responsive e2e (Playwright, runs the full happy path of every scenario at every entry below, both text sizes; asserts FR-RES-01…04 on every step):**

  **Viewport matrix**

  | Name | Size (CSS px) | DPR | Represents |
  |---|---|---|---|
  | `phone-s-portrait` | 360 × 640 | 3 | Small Android phone |
  | `phone-s-landscape` | 640 × 360 | 3 | Small Android phone rotated (height < 500 rules) |
  | `phone-m-portrait` | 390 × 844 | 3 | iPhone 12–15 |
  | `phone-m-landscape` | 844 × 390 | 3 | iPhone rotated |
  | `tablet-portrait` | 768 × 1024 | 2 | iPad 9.7"/10.2" portrait |
  | `tablet-landscape` | 1024 × 768 | 2 | iPad landscape (design reference) |
  | `tablet-l-portrait` | 820 × 1180 | 2 | iPad Air / Galaxy Tab S portrait |
  | `tablet-l-landscape` | 1180 × 820 | 2 | iPad Air / Galaxy Tab S landscape |
  | `laptop` | 1366 × 768 | 1 | School laptop / Chromebook |
  | `desktop` | 1920 × 1080 | 1 | Classroom PC / projector |
  | `desktop-xl` | 2560 × 1440 | 1 | Large monitor (checks max-width centering) |

  Plus an **orientation-change test**: at step S2 with a feeling selected and the hint sheet open, resize `tablet-portrait` → `tablet-landscape` → back; assert step, selection and sheet persist (FR-RES-05). Plus a **visual regression snapshot** per screen per viewport (Playwright `toHaveScreenshot`, 0.2% threshold) to catch layout drift.
- **Manual (docs/TABLET_TEST_CHECKLIST.md):** iPad Safari + Android Chrome: audio unlock, TTS voice quality, tap target comfort, landscape/portrait, install to home screen, offline.
- **Quality gates per milestone:** `pnpm validate && pnpm lint && pnpm test && pnpm build` green; Lighthouse a11y ≥ 95 on Home and S2.

---

## 13. Milestones (execute in order)

Each milestone ends with: validator + tests + build green, `docs/PROGRESS.md` updated, a commit `feat(mN): …`, and a short report to the human.

### M0 — Scaffold (½ day)
- Init repo per §11.2 with pnpm, Vite React-TS, Tailwind, ESLint/Prettier, Vitest, Playwright, vite-plugin-pwa.
- Add tokens (§6.3–6.5) as CSS variables + Tailwind theme; self-host Noto Sans KR.
- Add `content/emotions.json`, `content/ui.json`, Zod schema, loader, validator CLI (all rules in §10) with tests.
- Copy `content-source/images/*` → `public/img/` (converted to WebP + PNG, ≤ 1600 px).
- **Done when:** `pnpm validate` passes on an empty scenarios folder; `pnpm dev` shows a blank Home shell.

### M1 — Engine + Social Awareness lesson (2–3 days)
- Implement `lessonMachine` + persistence + unit tests.
- Build design components (§6.7) and `LessonShell` with top/bottom bars and `ProgressLink`.
- Implement S0 (StartGate + Home), S1, S2 (incl. hint, idle, not-sure), S3 `reason`, S4, S5 (incl. try-another), S6.
- `speech.ts`, `sound.ts`, Settings sheet.
- Author `content/scenarios/social-playground.json` from §7.4.2 (it has real art).
- E2E happy path for this scenario.
- Responsive from day one: build every screen mobile-first per §6.2.1; wire the viewport-matrix e2e in this milestone (not M3) so layout regressions are caught as screens are added.
- **Done when:** FR-HOME-*, FR-S1-*, FR-S2-*, FR-S3-01/03 (reason), FR-S4-*, FR-S5-*, FR-S6-*, FR-SET-01, FR-AUD-01/03/04 pass, **and FR-RES-01…05 pass for this scenario at all 11 viewports**.

### M2 — Remaining scenarios + Step-3 variants (2 days)
- Author `mind-lunch-line.json`, `relation-pencil-prank.json`, `self-presentation-teasing.json` from §7.4.
- Implement Step-3 `multiple-choice` and `body-reaction` (with `BodyOutline`).
- Placeholder illustration component (FR-S1-03); `imageByLocale` support.
- Emotion SVG set (15), domain icons (5), outcome icons (10) per §6.6.
- Parametrize e2e over all four scenarios.
- **Done when:** all four lessons complete end-to-end in e2e; validator reports only the expected `draft` warnings; FR-ENG-01 demonstrated by adding a copy of a scenario with a new id and seeing it on Home (then remove it).

### M3 — PWA, polish, accessibility (1–2 days)
- Manifest, service worker precache, offline e2e.
- Motion (§6.10), sounds (§6.11), reduced-motion handling.
- Full keyboard/a11y pass (§6.12); Lighthouse ≥ 95.
- `?lang=en` dev render check (FR-ENG-05); confirm no language control is visible anywhere (D17).
- Responsive hardening: FR-RES-06/07 (CLS, safe areas), visual-regression baselines for all 11 viewports × 2 text sizes, manual rotation test on real iPad and Android tablet mid-lesson.
- Performance budget check (§9).
- **Done when:** all FR-PWA-*, §9 and §6.12 items pass; tablet checklist executed on at least one iPad and one Android device by the human (agent prepares the checklist and a deployable build).

### M4 — Handover (½ day)
- `docs/ADDING_A_SCENARIO.md` (step-by-step for the content team, with the JSON template and validator usage).
- `README.md` (run, build, deploy to static host, where content lives).
- Draft list extracted automatically into `docs/DRAFT_STRINGS.md` for client sign-off.
- Deploy preview to a static host (Vercel/Netlify/GitHub Pages — whichever the human provides credentials for; otherwise produce `dist/` and instructions).
- **Done when:** a fresh clone + `pnpm i && pnpm validate && pnpm test && pnpm build` succeeds and the human can play all four lessons on a tablet from the deployed URL.

---

## 14. Acceptance criteria (v1 sign-off)
1. All FR-* in §8 pass (automated where specified, manual otherwise) — tracked in `docs/PROGRESS.md`.
2. All four scenarios complete on iPad Safari and Android Chrome using touch only, fully voiced.
3. No "wrong/X/red/negative sound" anywhere on the child path (manual audit).
4. `FR-ENG-01` demonstrated live.
5. Lighthouse: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, PWA installable.
6. `docs/DRAFT_STRINGS.md` lists every `draft: true` string for client review.
7. Repository passes `pnpm validate && pnpm lint && pnpm test && pnpm build` from a clean clone.
8. **Responsive (D16):** the responsive e2e suite passes for all 4 scenarios × 11 viewports × 2 text sizes with zero FR-RES violations; a human has rotated a real iPad and a real Android tablet mid-lesson on at least three screens without any layout break or lost state; no language control is visible (D17).

---

## 15. Open items (not blocking v1)
| # | Item | Owner | Needed by |
|---|---|---|---|
| 1 | Client sign-off on `draft` strings (§7, ~20 strings) | Content team | Before pilot |
| 2 | Three missing illustrations + rework of teasing card without baked text | Content team / illustrator | Before pilot (placeholders ship) |
| 3 | Recorded voice-over | Client | Post-v1 |
| 4 | Name and content of the 5th SEL domain | Content team | Post-v1 |
| 5 | Static host account for deployment | Human developer | M4 |
| 6 | Pilot group (2–3 children, 1 teacher) | Client | After M3 |

---

## Appendix A — Traceability to upstream documents

| PRD section | APP_PROPOSAL | ANALYSIS_REPORT |
|---|---|---|
| §1 Overview | §2.1, §3.1 | §1 |
| §2 Users | §2.3 | §1, §6.2 |
| §3 Scope | §5 | §6.4 |
| §4 Decisions D1–D12 | §4 (same IDs) | §7 (questions) |
| §5 Flows | §3.2, Appendix B | §3.2, §3.3 (flowchart) |
| §6 UI/UX | §3.6 | §6.2 |
| §7 Content | §3.3 | §4 (full inventory), §4.5 (emotion list) |
| §8 FRs | §3.2, §9 | §6.1 |
| §11 Architecture | §3.5, §8.2 (schema) | §8.1–8.2 |
| §13 Milestones | §7 (phases) | §8.3 |

## Appendix B — Source → scenario id map
| Deck | Author | Scenario id |
|---|---|---|
| …관계 관리-박수빈.pptx | Park Subin | `relation-pencil-prank` |
| …관계 인식-양수정.pptx | Yang Sujeong | `social-playground` |
| …마음건강관리-김시은.pptx | Kim Sieun | `mind-lunch-line` |
| …자기 인식-홍은비.pptx | Hong Eunbi | `self-presentation-teasing` |
