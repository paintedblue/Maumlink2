# Maum:Link (마음잇다) — App Development Proposal

**Project:** Social-Emotional Learning web app for 3rd-grade slow learners
**Prepared for:** Maum:Link content team (Park Subin, Yang Sujeong, Kim Sieun, Hong Eunbi)
**Prepared by:** Development
**Date:** 2026-10-03
**Version:** 1.0 (draft for discussion)
**Companion document:** `ANALYSIS_REPORT.md` (detailed analysis of the four content design documents and the app flowchart)

---

## 1. Purpose of this proposal

You have designed four SEL lessons and asked for a **working web-app prototype**. This document explains:

- what we understand you need,
- what we propose to build, screen by screen,
- how we will handle the decisions your documents leave open (with a recommended default for each),
- how the work is split between your team and ours,
- a phased plan with deliverables and acceptance criteria.

Where we recommend a default, we will go with it unless you tell us otherwise at the kickoff meeting (§10).

---

## 2. What we understand you need

### 2.1 The product in one sentence
A calm, voice-supported, tablet-friendly web app in which a 3rd-grade slow learner works through short everyday situations using the loop **Situation → Feeling → Thought → Action → Feedback**, with no scores, no timers and no "wrong answers."

### 2.2 Requirements extracted from your documents

| # | Requirement | Source |
|---|---|---|
| R1 | 7-screen flow: Choose domain → View situation → Choose feeling → Explore reasons → Coping strategy → Feedback → Wrap-up | Slide "07. Overall Screen Flow" (all decks) |
| R2 | Basic controls: Back / Next, choice buttons, per-choice feedback, Home, "Practice another situation" | Slide 07 |
| R3 | Optional controls: read-aloud, text size, progress indicator, simple sound effects | Slide 07 |
| R4 | Feelings are never marked right/wrong; feeling word always shown with a face icon; selection highlighted; Next enabled only after a choice | Slide "03. STEP 2" (all decks) |
| R5 | Feedback is explanatory (consequence + alternative), never "wrong" | Slide "06. STEP 5" (all decks) |
| R6 | Short sentences, simple vocabulary, no exaggerated facial expressions in art | Slides 02–03 (all decks) |
| R7 | Each lesson takes ~5–10 minutes | Slide 01 (all decks) |
| R8 | Step 3 must support two variants: *reasons for the feeling* (3 decks) and *body reactions to the feeling* (Self-Awareness deck) | Slide 04 |
| R9 | Step 2 must support asking about *my* feeling or *the other person's* feeling (Relationship Management deck) | Slide 03, RM deck |
| R10 | Hint when the child cannot choose a feeling; extra explanation when a reason is not understood; feedback + chance to reconsider after a coping choice; result → summary → next situation → repeat | Flowchart image |
| R11 | Deliverable is a working **web-app** prototype | Slide "08. Checklist" |
| R12 | Prototype scope: 1–2 domains, 2–3 working scenarios each (your documents) — you have delivered 4 domains × 1 scenario | Slide 07 vs. delivered decks |

### 2.3 Audience constraints that shape every decision
Slow learners (borderline intellectual functioning) typically have limited reading fluency, difficulty with abstract or multi-step instructions, short working memory and low tolerance for failure signals. Therefore the app must be **audio-first, one-idea-per-screen, large-target, failure-free**. We treat these as hard requirements, not polish.

---

## 3. Proposed solution

### 3.1 Concept
One reusable **Lesson Engine** plus a **content library**. Each of your scenarios becomes a data file; the engine renders it. Adding a fifth domain or a second scenario later means writing content, not code.

```
┌──────────────────────────────────────────────────────┐
│  Maum:Link web app (runs in any modern browser)      │
│                                                      │
│  Home ──► Lesson Engine ──► Wrap-up ──► Home / Next  │
│               │                                      │
│               ▼                                      │
│   ┌────────────────────┐   ┌──────────────────────┐  │
│   │ Scenario content   │   │ Shared emotion       │  │
│   │ (JSON, one/lesson) │   │ library (word+icon+  │  │
│   │ 4 now, N later     │   │ audio, ~15 feelings) │  │
│   └────────────────────┘   └──────────────────────┘  │
│                                                      │
│  Services: read-aloud · progress dots · text size ·  │
│            hints · gentle sounds · local progress    │
└──────────────────────────────────────────────────────┘
```

### 3.2 Screen-by-screen specification

**S0 — Home / Choose domain** (R1 ①)
- Four large cards: Self-Awareness · Social Awareness · Relationship Management · Mental Health Care (fifth card reserved, greyed, "coming soon").
- Each card: domain icon, short name, the number of situations inside.
- Settings gear (text size, sound on/off, voice on/off). No login.

**S1 — View the situation** (R1 ②, R6, R10 "story, picture, voice")
- Illustration on the left (landscape) / top (portrait).
- Story shown **one sentence at a time** with a tap-to-advance, each sentence read aloud automatically; the full story can be replayed.
- "Key sentence" shown last, larger, in a speech bubble.
- Next button.

**S2 — Choose feeling** (R1 ③, R4, R9, R10 hint)
- Question text (read aloud): "How would I feel…?" or "How does my friend feel…?" depending on scenario.
- 4–6 emotion buttons: face icon + word; tap plays the word aloud; selected button gets a colored border and a check.
- Single-select by default; per-scenario flag allows multi-select.
- Next is disabled until a choice is made.
- **Hint**: a visible "Help me" button, plus an automatic gentle prompt after ~20 s with no interaction. The hint shows body/face clues from the situation ("Look at his face — he isn't smiling") and offers two likely feelings highlighted. No feeling is ever rejected.

**S3 — Why do I feel this way? / How does my body react?** (R1 ④, R8, R10 extra explanation)
- Renders based on the feeling(s) chosen in S2:
  - *reason* variant: "You chose **Worried**. Maybe it's because… afraid my friends will say no." (Social Awareness, Mental Health Care)
  - *body-reaction* variant: "When I'm **Angry**… my head gets hot, my eyes burn, my voice gets louder" with a simple body outline highlighting the parts. (Self-Awareness)
  - *multiple-choice* variant: question + A–D cards, each with a short acknowledgment. (Relationship Management)
- Closes with the principle line ("People can feel differently in the same situation").
- Two buttons: **"Got it"** → S4, **"Tell me more"** → one extra example or a question, then back to the same buttons. This implements the flowchart's "understood?" gate without testing the child.

**S4 — What should I do?** (R1 ⑤)
- Question read aloud; four action cards A–D with icon + short text; tap reads the card.
- Confirm button ("Choose this").

**S5 — Feedback** (R1 ⑥, R5, R10 feedback + result)
- Top: the chosen action restated with a small illustrated **outcome panel** (this is the flowchart's "View result").
- Middle: the feedback text, read aloud.
- Bottom buttons depend on the action's `quality` tag (set by you in the content):
  - `recommended` / `acceptable` → **Continue**
  - `reconsider` → **Continue** *and* **Try another way** (returns to S4 with the tried card dimmed). Never forced; never labeled wrong.

**S6 — Wrap-up** (R1 ⑦, R2)
- Closing message in a large card, read aloud, with a soft chime and a small animation (e.g., a heart linking two figures — the "Maum:Link" motif).
- A one-line recap of the path taken: feeling → reason → action (icons only).
- Buttons: **Practice another situation** (next scenario in same domain, or back to Home), **Home**.

**Persistent UI on S1–S6**
- Progress dots (5), Back, Home, replay-audio button, text-size toggle.

### 3.3 Content model
Each scenario is one JSON file following the schema in `ANALYSIS_REPORT.md` §8.2 (fields: situation, feeling, step3 with `type`, action options with `quality` and `feedback`, closing). A shared `emotions.json` lists every feeling with word (ko/en), icon file and audio file. We will convert all four of your decks into this format in Phase 1 — you do not need to write JSON.

### 3.4 Read-aloud strategy
- Prototype: browser text-to-speech (Web Speech API, Korean voice). Zero cost, available on iPad, Android tablets, Chrome and Edge.
- Production: recorded human voice (warm, slow, child-friendly). The content schema has an `audio` field on every text node, so switching is a content update, not a code change.

### 3.5 Technical approach
| Area | Choice | Why |
|---|---|---|
| Type | Single-page web app, installable as a PWA | Matches "web-app prototype"; runs on tablet, PC and phone from one URL; can be added to the home screen and used offline in classrooms with weak Wi-Fi |
| Front-end | React + TypeScript (Vite) | Component model fits "one engine, many scenarios"; strong typing catches content errors early |
| Styling | Tailwind CSS with a small design-token layer | Fast to build a consistent, soft, large-target UI; easy to tune colors/sizes globally |
| State | In-memory + `localStorage` for settings and "situations completed" | No backend, no accounts, no personal data |
| Audio | Web Speech API now; static MP3 later | See §3.4 |
| Hosting | Static hosting (Vercel / Netlify / GitHub Pages) | Free tier is sufficient; one shareable link for testing |
| Testing | Unit tests on the engine + content schema validation + manual tablet checks | Content validation catches missing feedback/reasons automatically (e.g., the "Hurt" gap in Social Awareness) |

No server, no database and no data collection in the prototype. This also keeps you clear of children's-data regulations for now.

### 3.6 Visual and interaction principles (binding for design)
1. One task per screen; one question per screen.
2. Minimum tap target 64 px; minimum body text 20 px; large text option 26 px.
3. Rounded shapes, soft pastel palette per domain (reuse the five colors from your decks: blue / red / yellow / green / purple), high text contrast.
4. Emotion icons: simple round faces, soft lines, no exaggeration (per Hong Eunbi's note).
5. Situation illustrations: neutral expressions; no implied judgment (per all decks).
6. No timers, scores, stars, streaks, "X" marks or buzzer sounds. Sounds are soft chimes only, off by default on first run if autoplay is blocked.
7. Every piece of text has a speaker button; everything auto-reads once on screen entry (toggleable).
8. Language: Korean UI and content for the prototype. The engine is locale-ready; the English translations already exist in `eng-ver/` and can be loaded as a second language later.

---

## 4. Decisions your documents leave open — our recommended defaults

| # | Open point | Recommended default | Why |
|---|---|---|---|
| D1 | Device & orientation | **Tablet, landscape first**; fully responsive to PC and phone | Tablets are standard in Korean special-education classrooms; landscape suits picture + text side by side |
| D2 | Prototype scope (4×1 delivered vs. 2×2–3 specified) | **Build all four domains, one scenario each** for v1; add scenarios as you write them | Uses the content you already have; shows breadth to stakeholders; engine makes depth cheap later |
| D3 | "Appropriate choice?" gate vs. "no wrong answers" | **Feedback for every choice; optional "Try another way" only for `reconsider` actions** | Honors your pedagogical principle and the flowchart's intent without creating a failure state |
| D4 | Feeling-screen hint | "Help me" button + gentle auto-prompt after ~20 s idle | Child-initiated first; passive fallback second |
| D5 | "Understood?" gate after Step 3 | "Got it" / "Tell me more" buttons | Self-reported; no quiz |
| D6 | Multi-select feelings | Single-select by default; per-scenario switch | Simpler for the audience; still allows your "may select several" note |
| D7 | Flowchart's "View result" screen | Merged into the Feedback screen as an illustrated outcome panel | Fewer screens; same information |
| D8 | Audio | Browser TTS for prototype; recorded voice for production | Fast and free now; schema ready for upgrade |
| D9 | Missing illustrations (3 of 4) | We ship with styled placeholder art matching your written briefs; you or an illustrator replace them | Unblocks development |
| D10 | Emotion icon set | We produce a consistent SVG set (~15 faces) in the soft style requested | Needed by all scenarios; cheaper to make once |
| D11 | "Not sure" (잘 모르겠어요) feeling | Include it in every scenario as the last option; choosing it opens the hint (D4) and then returns to the feeling grid | Supports children who truly can't name the feeling, which is the point of the app |
| D12 | Typos / content gaps (e.g., no reason for "Hurt") | We fix typos and flag gaps in a shared content sheet for your sign-off | Keeps you as content owners |

---

## 5. Scope

### 5.1 In scope (Prototype v1)
- Home with four domain cards
- Lesson Engine with screens S1–S6 and all three Step-3 variants
- Four scenarios fully playable: pencil prank, playground, lunch line, teased presentation
- Shared emotion library (~15 feelings) with icons and TTS
- Read-aloud, progress dots, text-size toggle, soft sounds, hints, "Tell me more", "Try another way"
- Local "completed" markers per scenario (no accounts)
- Korean UI; English content loadable behind a hidden switch for demos
- Installable PWA, works offline after first load
- Content validation script and a short "how to add a scenario" guide

### 5.2 Out of scope for v1 (available as later phases)
- Accounts, child profiles, cloud progress sync
- Teacher / parent dashboard and reports
- Content authoring interface
- Recorded voice-over, final commissioned illustrations
- Native iOS/Android store apps (PWA covers tablets; store packaging can come later)
- Fifth SEL domain content (engine already supports it)

---

## 6. Deliverables

| Deliverable | Format |
|---|---|
| Live prototype URL (password-protected if desired) | Web |
| Source code repository with README | Git |
| Four scenario content files + emotion library | JSON |
| Design tokens and icon set | SVG / CSS |
| Content sheet with typo fixes and open gaps for your sign-off | Spreadsheet |
| "How to add a scenario" guide (for your team) | Markdown, 2 pages |
| Short test report from tablet checks (iPad + Android) | Markdown |

---

## 7. Plan and timeline

Estimates assume one developer plus light design support, and that §4 defaults are accepted at kickoff. Durations are working weeks.

| Phase | Weeks | What happens | You get | You provide |
|---|---|---|---|---|
| **0 — Kickoff & decisions** | 0.5 | Walk through this proposal; confirm D1–D12; agree content freeze date | Signed-off decisions | 1-hour meeting; answers |
| **1 — Engine + first scenario** | 2 | Build S0–S6, emotion library, TTS, settings; load *Social Awareness* (has finished art) | Clickable build of one complete lesson | Nothing blocking |
| **2 — All four scenarios** | 1.5 | Convert the other three decks to content; body-reaction and multiple-choice variants; placeholder art; content validation | All four lessons playable | Answers to flagged content gaps |
| **3 — Child-ready polish** | 1.5 | Hints, "Tell me more", "Try another way", sounds, progress, PWA/offline, tablet QA, accessibility pass | Release candidate on a public URL | Optional: real illustrations, icon feedback |
| **4 — Pilot & fixes** | 1 | You trial it with 2–3 children/teachers; we fix findings | Prototype v1.0 + test report | Pilot feedback |
| **Total** | **~6.5 weeks** | | | |

A short-form alternative: Phases 1–2 only (3.5 weeks) delivers a demo-quality build suitable for showing stakeholders, without hints/offline/polish.

---

## 8. Roles and responsibilities

| Area | Your team | Development |
|---|---|---|
| Pedagogy, wording, feedback texts | Own | Advise, flag gaps, fix typos for sign-off |
| Final decisions in §4 | Decide | Recommend |
| Illustrations (3 missing + rework of the teasing card) | Source or approve placeholders | Provide briefs and placeholder art |
| Emotion icons | Approve style | Produce |
| Voice audio (production phase) | Source narrator | Integrate |
| Engine, UI, hosting, testing | Review | Own |
| Pilot with children | Run | Support, collect findings |

---

## 9. Acceptance criteria for v1

1. A child can complete each of the four scenarios from Home to Wrap-up on an iPad and an Android tablet using touch only, with every text read aloud.
2. No screen contains more than one question; no body text under 20 px; all tap targets ≥ 64 px.
3. Choosing any feeling or any action never produces a "wrong," "no," "X," or negative sound.
4. Step 3 renders correctly for all three variants (reason, body reaction, multiple choice) and for every feeling in the content.
5. The content validator passes with zero errors (every feeling has a Step-3 entry, every action has feedback, every scenario has a closing).
6. The app loads and runs offline after the first visit.
7. Adding a new scenario JSON file with no code changes makes it appear on Home and play correctly (we will demonstrate this live).

---

## 10. Risks and how we handle them

| Risk | Impact | Mitigation |
|---|---|---|
| Browser TTS voice sounds robotic or is unavailable on a school device | Children disengage | Test on target tablets in Phase 1; schema already supports recorded audio; budget narration early if TTS is unacceptable |
| Illustrations arrive late | Visual quality in pilot | Styled placeholders from day one; art is a content swap |
| Content changes after build starts | Rework | Content freeze date agreed at kickoff; after that, changes go through the content sheet and are applied in Phase 4 |
| "No wrong answers" vs. teachers wanting to see "correct" behavior reinforced | Pedagogical disagreement | `quality` tag lets you tune per action without changing the child's experience; discuss in kickoff |
| Autoplay audio blocked by browsers | First screen is silent | Require one tap on Home ("Start") before any audio; show a speaker button everywhere |
| Pilot reveals reading/attention issues we did not predict | Design changes | Phase 4 reserved for this; engine-level changes propagate to all scenarios at once |

---

## 11. Assumptions

- Korean is the only required language for v1.
- No personal data about children is collected or stored.
- Your team remains the owner and author of all educational text.
- The students' content checklist (slide 08) is the acceptance checklist for *content*; §9 above is the acceptance checklist for *software*.
- Hosting on a free static tier is acceptable for the prototype.

---

## 12. Next steps

1. **You:** read this proposal and `ANALYSIS_REPORT.md` §7; note any objections to the defaults in §4.
2. **Kickoff meeting (1 hour):** confirm D1–D12, agree a content freeze date, pick a pilot group.
3. **Development:** start Phase 1 the day after kickoff; first clickable build of the playground scenario within two weeks.

---

### Appendix A — The four scenarios at a glance

| Domain | Scenario | Feelings offered | Step-3 type | Coping actions (A–D) |
|---|---|---|---|---|
| Relationship Management | Hid a friend's pencil as a joke; friend is upset | Worried · Upset · Angry · Embarrassed · Amused *(friend's)* | Multiple choice | Keep hiding · Say nothing · Return + apologize · Ask if upset |
| Social Awareness | Wants to join friends playing at recess | Annoyed · Angry · Shy · Hurt · Worried | Reason per feeling | Get angry · Wait quietly · Ask "Can I play?" · Tell teacher |
| Mental Health Care | Friend keeps cutting the lunch line | Upset · Frustrated · Unfair · Sorry · Not sure | Reason per feeling | Say feeling · Say wish · Solve together · Ask teacher |
| Self-Awareness | Friends tease a presentation mistake | Angry · Nervous · Upset · Worried (+ Shy, Scared) | Body reaction per feeling | Walk · Draw · Quiet place · Deep breath |

### Appendix B — Mapping flowchart → screens

| Flowchart node | Screen |
|---|---|
| Start / Choose topic | S0 Home |
| View situation (story, picture, voice) | S1 |
| Recognize feeling → hint loop | S2 + hint panel |
| Think about reason → extra explanation loop | S3 + "Tell me more" |
| Choose coping action → feedback loop | S4 → S5 + "Try another way" |
| View result | S5 outcome panel |
| Summary & wrap-up | S6 |
| Next situation / repeat | S6 buttons → S0 or next scenario |
