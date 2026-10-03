# Maum:Link (마음잇다) — Analysis of Client Materials

**Project:** Social-Emotional Learning (SEL) app for slow learners
**Prepared for:** app development planning
**Date:** 2026-10-03
**Sources analyzed:** 4 content design decks (PPTX) + 1 app flowchart image (KakaoTalk_Photo_2026-10-03-15-18-00.png)

---

## 1. Executive summary

The client is a group of students (4 authors, one per deck) designing educational content for an app called **Maum:Link (마음잇다, "connecting hearts")**. The app teaches social-emotional skills to **3rd-grade elementary "slow learners"** (느린학습자 — children with borderline intellectual functioning, roughly IQ 71–84, who struggle with abstract language and multi-step reasoning).

The students have written the *content*; they expect a developer to build a **working web-app prototype**. The decks state this directly:

> Student: design doc + screen sketches + text/image assets → Developer: working web-app prototype

What you are being asked to build is, at its core, a **branching, scenario-based lesson player**. Every lesson follows the same 5-step loop:

```
Situation → Feeling → Thought → Action → Feedback
```

All four decks share an identical template, so the app is highly data-driven: one lesson engine + a content file per scenario. This is good news for scope. The prototype target stated in the decks is **1–2 of 5 SEL domains, with 2–3 working scenarios each**. The students have so far delivered **4 scenarios across 4 domains** (one each).

---

## 2. Source inventory

| File                                    | Author       | SEL domain                      | Scenario                                                                 | Slides | Notes                                                         |
| --------------------------------------- | ------------ | ------------------------------- | ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------- |
| …관계 관리-박수빈.pptx                         | Park Subin   | Relationship Management (관계 관리) | "It was a joke to me, but my friend is upset" (hiding a friend's pencil) | 9      | No illustration provided                                      |
| …관계 인식-양수정.pptx                         | Yang Sujeong | Social Awareness (관계 인식)        | "I want to play with my friends" (left out at recess)                    | 9      | Has a finished illustration (playground scene)                |
| …마음건강관리-김시은.pptx                        | Kim Sieun    | Mental Health Care (마음건강관리)     | "A friend cut in line at lunch"                                          | 10     | Extra summary slide; no illustration                          |
| …자기 인식-홍은비.pptx                         | Hong Eunbi   | Self-Awareness (자기 인식)          | "Friends tease my presentation mistake"                                  | 9      | Has an illustration but with Korean text baked into the image |
| KakaoTalk_Photo_2026-10-03-15-18-00.png | (client)     | —                               | App-level logic flowchart                                                | —      | Adds decision diamonds and retry loops not in the decks       |

English PDF versions of all four decks are in `eng-ver/`.

---

## 3. The pedagogical model (what the app must deliver)

### 3.1 Five learning steps per scenario

Every deck has exactly the same slide structure. This *is* the screen specification:

| Step | Screen | What the child does | Design rule stated in the decks |
|---|---|---|---|
| 0 | Content overview | — (internal: title, audience, domain, competency, goal, ~5–10 min) | Define goal/audience/competency first |
| 1 | **View the situation** | Reads/hears a short story + sees an illustration + one "key sentence" | Short sentences; simple words; avoid exaggerated faces that push a judgment; "Next" button |
| 2 | **Explore feelings** | Taps one (optionally several) feeling button(s) | **No right/wrong** feelings; show word + face icon; highlight selection; selecting enables "Next"; read-aloud if needed |
| 3 | **Why do I feel this way?** | Picks a reason that matches the feeling | Acknowledge the chosen reason; teach that people can feel differently in the same situation |
| 4 | **What should I do?** | Chooses one of 4 coping actions (A–D) | Compare actions; explore better responses |
| 5 | **Feedback for each choice** | Reads/hears feedback for the chosen action, then a closing message | **Explanatory, not "wrong"**: describe the consequence and suggest an alternative |

### 3.2 Seven app screens (from slide "07. Overall Screen Flow")

```
① Choose domain → ② View situation → ③ Choose feeling → ④ Explore reasons
→ ⑤ Coping strategy → ⑥ Feedback → ⑦ Wrap-up
```

**Basic features (required):** Back / Next · choice buttons · per-choice feedback · Home · "Practice another situation"
**Optional features:** Read-aloud (TTS) · text size control · progress indicator · simple sound effects

### 3.3 App-level logic (from the flowchart image)

The KakaoTalk image is more detailed than the decks and introduces **branching and retry loops**. Translated:

```
Start (app launch)
  → Choose topic (school life, friendships, daily life, …)
  → View situation (story, picture, voice)
  → Recognize feeling (choose the feeling I have)
      ─ feeling selected? ─ No → Give a hint (feeling clues, examples) → back to Recognize feeling
      └ Yes ↓
  → Think about the reason (why did I feel this?)
      ─ understood? ─ No → Give extra explanation (examples, questions) → back to Think about the reason
      └ Yes ↓
  → Choose an appropriate coping action (pick among several)
      ─ appropriate choice? ─ No → Give feedback (suggest another way, explain why) → back to Choose coping action
      └ Yes ↓
  → View result (see the outcome of the chosen action)
  → Summary & wrap-up (confirm what was learned)
  → Next situation (practice another topic)
  → (repeat learning) → back to Start
```

Three things in the flowchart are **not** in the decks and need a decision (see §7):
1. **Hint on the feeling screen** when no feeling is chosen (what triggers it — a timeout? a "help" button?).
2. **An "understood?" gate** after the reason step — the decks have no mechanism to measure this.
3. **An "appropriate choice?" gate** that sends the child back to re-choose. This conflicts with the decks' principle of "no right/wrong, explanatory feedback for every choice." The decks show feedback for *all four* choices with no retry.

---

## 4. Content inventory (all four scenarios, fully specified)

All text below is translated from the decks. This is enough to build all four scenarios end-to-end.

### 4.1 Relationship Management — "Let's Be Friends!" (Park Subin)

- **Learning goal:** Know words and actions that help make friends, and use them to fit the situation.
- **Situation:** "It's break time. I secretly hid my friend's pencil to make them laugh. But my friend isn't laughing while looking for the pencil, and looks unhappy."
- **Key sentence:** "Huh? My friend isn't laughing."
- **Illustration brief:** Elementary classroom / main character hides a friend's pencil / friend is searching / don't exaggerate faces. *(No image supplied.)*
- **Feeling question (note: about the FRIEND, not self):** "How does the friend looking for the pencil feel?" → Worried · Upset · Angry · Embarrassed · Amused
- **Reason question:** "Why did my friend feel that way?"
  - A. Worried because the pencil went missing
  - B. Thought someone took the pencil
  - C. Upset at not finding the pencil
  - D. Thought the prank was funny
  - *Key feedback:* "I played a prank to make my friend laugh. But my friend may feel upset or worried."
- **Action question:** "My friend's face looks different from what I expected. What should I do?"
  - A. Think it's a fun joke and keep hiding it → *"Think about why your friend made that face."*
  - B. Say nothing until the friend finds it → *"You'd be upset if something of yours went missing, right? Think about your friend's feelings."*
  - C. Give the pencil back and say "Sorry, I thought you'd laugh." → *"That's a brave choice. Apologizing right away when you feel sorry is wonderful."*
  - D. Ask "I hid it as a joke. Did that upset you?" → *"You asked and checked how your friend feels, so your friend probably feels a bit better."*
- **Closing:** "Even if it's fun for me, it may not be fun for my friend. Let's look at my friend's face and feelings too."
- **Design intent:** Don't assume how a friend feels — look at their face and check with them.

### 4.2 Social Awareness — "You and I Can Think Differently!" (Yang Sujeong)

- **Learning goal:** In peer situations, notice own feelings, consider the other's view, and explore suitable responses.
- **Situation:** "At break, my friends are playing together on the playground. I want to join them, but they haven't called me yet."
- **Key sentence:** "I want to play too!"
- **Illustration:** Supplied (girl with backpack watching 3 friends play soccer). Reusable as-is.
- **Feeling question:** "How would I feel in this situation?" → Annoyed · Angry · Shy · Hurt · Worried
- **Reason question:** "Why did I feel that way?"
  - Annoyed – I think my friends don't want to play with me
  - Angry – it feels like they're leaving me out
  - Shy – I don't know how to ask to play
  - Worried – afraid my friends will say no
  - *(Note: "Hurt" is offered as a feeling but has no reason line — content gap.)*
- **Action question:** "What can I do if I want to play with my friends?"
  - A. Get angry: "Why are you leaving me out?!" → *"It's okay to feel angry. But speaking angrily may scare or upset your friends. How about saying, 'I want to play too'?"*
  - B. Go close and quietly wait → *"If you wait nearby, your friends might notice how you feel, or they might not. If you want to play together, why not tell them?"*
  - C. Ask "Can I play too?" → *"Good idea! When you say you want to join, your friends can know how you feel."*
  - D. Tell the teacher "I want to play too" → *"You can tell your teacher when you need help. Next time, you could also be brave and tell your friend directly."*
- **Closing:** "I can put my feelings into words. I tell my friend what I want, and ask an adult for help when it's hard."

### 4.3 Mental Health Care — "Express My Feelings and Ask for Help" (Kim Sieun)

- **Learning goal:** Recognize own feelings, think about why, and ask for help.
- **Situation:** "In the lunchroom, a friend sneaks in line in front of me. It's not the first time. I want to say something, but I don't know how."
- **Key sentence:** "A friend cuts in line"
- **Illustration brief:** Lunchroom line; a child slips in with a cheeky look; the child behind hesitates. *(No image supplied.)*
- **Feeling question:** "How would I feel in this situation?" → Upset · Frustrated · Unfair · Sorry (+ "Not sure" on the summary slide)
- **Reason question:** "Why did I feel that way?"
  - Upset – my friend often cuts in front of me
  - Frustrated – I want to say something but the words won't come
  - Unfair – it was my turn but I got pushed back
  - Sorry – I feel bad for the friends behind me
- **Action question:** "What can I do when I feel that way?" *(all four are positive — no "poor" option)*
  - A. Say how I feel: "I was upset when you cut in front of me" → *"You told your friend how you feel. You expressed yourself well."*
  - B. Say what I want: "Next time, please wait your turn" → *"I'm proud of myself for telling my friend what I want."*
  - C. Solve it together: "Let's line up in order" → *"When it's hard alone, work together."*
  - D. Ask the teacher for help → *"Sometimes asking for help is better than holding it in alone."*
- **Closing:** "Saying how I feel and asking for help are good ways to protect myself. When it's hard, don't hold it in — talk to a trusted adult."

### 4.4 Self-Awareness — "A Journey to Feel Myself" (Hong Eunbi)

This module **deviates from the template** in Step 3: instead of *reasons*, it teaches **body reactions** to feelings (interoception). The engine must support this variant.

- **Learning goal:** Explore how my body reacts to my feelings in daily life, and ways to cope.
- **Situation:** "Friends tease me about a mistake in my presentation. I'm upset that they teased the presentation I worked hard on."
- **Key sentence:** "I want to handle my upset feelings on my own"
- **Illustration:** Supplied, but it is a "situation card" mock-up with **Korean text burned into the image** (speech bubbles "ㅋㅋㅋ", caption). Needs re-creation for any localized version.
- **Feeling question:** "How do I feel then?" → Angry · Nervous · Upset · Worried
  - *Student note:* add Upset, Shy, Scared; icons should be round and soft, not hard-edged.
- **Step 3 — Body reaction (per feeling tapped):**
  - Angry → head gets hot, eyes burn, voice gets louder
  - Nervous → heart pounds, lips get dry
  - Upset → tears, head drops, body feels weak
  - Worried → stomach hurts, head hurts
  - *Principle:* "I can recognize my feelings from my body's reactions."
- **Action question:** "What do I need when I have these feelings and body reactions?" *(self-regulation, all positive)*
  - A. Take a walk alone after the presentation → *"…How might you feel?"*
  - B. Draw a picture to comfort myself → *"How might drawing make you feel?"*
  - C. Spend a moment alone in a quiet place → *"Good idea. How might you feel sitting quietly?"*
  - D. Take a deep breath → *"If you still don't feel better, you can also talk to your teacher."*
- **Closing:** "Next time you feel upset or face the same situation, try what you did today. Because every one of us matters."

### 4.5 Consolidated emotion vocabulary

Union of all feeling buttons across the four scenarios (each needs a word + a face icon + an audio clip):

> Angry (화가 나요) · Annoyed (짜증나요) · Upset (속상해요) · Hurt (서운해요) · Frustrated (답답해요) · Unfair (억울해요) · Worried (걱정돼요) · Nervous (긴장돼요) · Shy/Ashamed (창피해요) · Embarrassed (당황스러워요) · Sorry (미안해요) · Amused (재미있어요) · Not sure (잘 모르겠어요) · *requested:* Shy (부끄러워요), Scared (무서워요)

A shared emotion library (~15 items) covers everything.

---

## 5. Cross-module analysis

### 5.1 What is consistent (build once, reuse)
- Identical 5-step / 7-screen flow in all four decks.
- Always 4 coping actions (A–D), each with its own feedback text.
- Always a closing message.
- Same production rules: short sentences, simple words, no right/wrong on feelings, explanatory feedback, soft visuals.
- Same feature lists (basic + optional).
- Same handoff checklist.

### 5.2 Where modules differ (engine must be flexible)

| Dimension | RM (pencil) | SA (playground) | MHC (lunch line) | Self-Aw (teasing) |
|---|---|---|---|---|
| Whose feeling in Step 2 | **The friend's** | Mine | Mine | Mine |
| Step 3 type | Reasons (A–D, about friend) | Reasons (one per feeling) | Reasons (one per feeling) | **Body reactions** (one per feeling) |
| Step 3 feedback | One shared "key feedback" | Principle text | Principle text | Principle text |
| Action quality mix | 2 poor / 2 good | 1 poor / 1 passive / 2 good | 4 good | 4 good |
| Feelings count | 5 | 5 | 4 (+1) | 4 (+3 requested) |
| Illustration | none | ready | none | needs rework |

**Implication:** Step 3 is best modeled as "for each selected feeling, show a linked explanation" with a configurable label ("reason" vs "body reaction"), plus optional multiple-choice mode (RM uses A–D).

### 5.3 Feedback philosophy vs. flowchart gating
The decks are consistent and explicit: *every* choice gets constructive feedback; nothing is marked wrong. The flowchart adds an "appropriate choice?" gate with a retry loop. These can be reconciled by:
- treating each action as having a `quality` tag (e.g., `recommended` / `acceptable` / `reconsider`), and
- after feedback, offering "Try another choice" for `reconsider` actions rather than forcing a loop.
This needs client confirmation.

---

## 6. Derived requirements

### 6.1 Functional (MVP)
1. Domain/topic selection screen (home).
2. Scenario player implementing the 5 steps with Back/Next.
3. Feeling selection: single-select by default, optional multi-select per scenario; selection highlighted; Next disabled until a choice is made.
4. Step 3 rendering driven by the selected feeling(s); supports "reason" and "body reaction" variants, plus an A–D multiple-choice variant.
5. Action selection (4 options) → per-choice feedback → closing message.
6. "Practice another situation" and "Home" at the end.
7. Content loaded from structured data (JSON), not hard-coded.

### 6.2 Accessibility / audience-specific (treat as near-mandatory for slow learners)
- **Read-aloud (TTS or recorded audio) on every text** — listed as "optional" in the decks but requested in the flowchart ("story, picture, voice") and essential for this audience. Web Speech API (`ko-KR`) is a zero-cost start; recorded child-friendly voice is better.
- Large tap targets, large adjustable font, one idea per screen, minimal text.
- Emotion word always paired with a face icon.
- Progress indicator (e.g., 5 dots) so the child knows where they are.
- Soft, rounded, low-contrast-stress visuals; **no** exaggerated faces in situation art.
- Gentle sound effects only; no timers, no scores, no failure states.
- Hint affordance on the feeling screen (per flowchart).

### 6.3 Platform
- Deliverable is explicitly a **web app prototype**. Device and orientation are **undecided** (the checklist item is left open). Tablet-landscape-first, responsive to PC, is the safe default.

### 6.4 Not mentioned anywhere (assume out of scope unless the client says otherwise)
- User accounts, login, child profiles
- Progress persistence across sessions / teacher or parent dashboard
- Analytics
- Content authoring UI for the students

---

## 7. Gaps, inconsistencies and open questions for the client

**Scope**
1. The decks say "5 SEL domains" but only 4 are covered. Which is the 5th (likely Self-Management / Responsible Decision-Making)? Is content coming?
2. Prototype target is "1–2 domains × 2–3 situations." You have 4 domains × 1 situation. Which does the client want for the prototype: breadth (4×1, as delivered) or depth (2×2–3, needs more content)?
3. Device + orientation (tablet vs PC; landscape vs portrait) — explicitly undecided.

**Logic**
4. Resolve the "appropriate choice?" retry gate vs. "no right/wrong feedback" principle (see §5.3).
5. What triggers the feeling-screen hint? What does the "understood?" check after Step 3 look like in UI terms?
6. Should multiple feelings be selectable? (RM deck says "fine"; others say single.) If multiple, how does Step 3 display several linked reasons?
7. The flowchart has a "View result" screen between feedback and summary — the decks don't. Is this the same as per-choice feedback, or a separate illustrated outcome?

**Content**
8. Illustrations: only 1 of 4 is production-ready. Who produces the other three (and reworks the Self-Awareness card that has text baked in)?
9. Emotion icons: 15-ish face icons needed; student notes ask for "round, soft" style. Who supplies them?
10. Audio: TTS acceptable, or recorded voice required?
11. Social Awareness offers "Hurt" (서운해요) as a feeling but gives no reason text for it.
12. Mental Health Care adds "Not sure" (잘 모르겠어요) only on its summary slide — include it in the button set? If so, what happens in Step 3 when a child picks it?
13. Self-Awareness student note asks to add "Upset" which is already present — confirm the final feeling list.
14. Several typos in Korean source text (연칠→연필, 바과→사과, 새채기→새치기, 소개가→고개가, 뺴도→빼고). Confirm the English/Korean copy is final before freezing strings.
15. Every "Student input" box (feeling words to add/remove, icon style) is empty except in Self-Awareness — are these still being filled in?

**Compliance**
16. The users are young children. Even without accounts, confirm expectations on data collection (ideally: none), and whether any school/ethics review applies.

---

## 8. Recommended build approach

### 8.1 Architecture
- **Single-page web app**, content-driven. One `ScenarioPlayer` component; all four scenarios as JSON.
- No backend for the prototype. Keep optional local progress in `localStorage`.
- TTS via Web Speech API now; swap to audio files later without changing the content schema (give each text node an optional `audio` field).

### 8.2 Suggested content schema (covers all four decks)

```json
{
  "id": "mhc-lunch-line",
  "domain": "mental-health-care",
  "title": "Express My Feelings and Ask for Help",
  "audience": "grade-3-slow-learner",
  "estimatedMinutes": 7,
  "situation": {
    "title": "A friend cut in line",
    "story": ["In the lunchroom, a friend sneaks in line in front of me.", "It's not the first time.", "I want to say something, but I don't know how."],
    "keySentence": "A friend cuts in line",
    "image": "img/lunch-line.png",
    "imageBrief": "Lunchroom line; a child slips in with a cheeky look; the child behind hesitates."
  },
  "feeling": {
    "question": "How would I feel in this situation?",
    "subject": "self",
    "multiSelect": false,
    "options": ["upset", "frustrated", "unfair", "sorry", "not-sure"]
  },
  "step3": {
    "type": "reason",
    "question": "Why did I feel that way?",
    "byFeeling": {
      "upset": "My friend often cuts in front of me.",
      "frustrated": "I want to say something but the words won't come.",
      "unfair": "It was my turn but I got pushed back.",
      "sorry": "I feel bad for the friends behind me."
    },
    "principle": "People can think and feel differently in the same situation."
  },
  "action": {
    "question": "What can I do when I feel that way?",
    "options": [
      { "id": "A", "text": "Say how I feel: \"I was upset when you cut in front of me.\"", "quality": "recommended",
        "feedback": "You told your friend how you feel. You expressed yourself well." },
      { "id": "B", "text": "Say what I want: \"Next time, please wait your turn.\"", "quality": "recommended",
        "feedback": "I'm proud of myself for telling my friend what I want." },
      { "id": "C", "text": "Solve it together: \"Let's line up in order.\"", "quality": "recommended",
        "feedback": "When it's hard alone, work together." },
      { "id": "D", "text": "Ask the teacher for help.", "quality": "recommended",
        "feedback": "Sometimes asking for help is better than holding it in alone." }
    ]
  },
  "closing": "Saying how I feel and asking for help are good ways to protect myself. When it's hard, don't hold it in — talk to a trusted adult."
}
```

`step3.type` takes `"reason" | "body-reaction" | "multiple-choice"`; `feeling.subject` takes `"self" | "other"` (for the pencil scenario). A separate `emotions.json` holds the shared word/icon/audio library.

### 8.3 Phasing
| Phase | Deliverable |
|---|---|
| 0 — Clarify | Get answers to §7 (especially items 2, 3, 4, 8, 10). |
| 1 — Engine | Home + scenario player + emotion library + TTS, with the Social Awareness scenario (it has art). |
| 2 — Content | Load the other three scenarios; placeholder art where missing. |
| 3 — Polish | Hints, progress dots, font size control, sound effects, "practice another" loop, basic QA on a tablet. |
| 4 — Later | Accounts/progress, teacher view, authoring tool, 5th domain. |

---

## 9. One-paragraph brief you can send back to the client

> I've reviewed the four content design documents and the app flowchart. The content is well structured and consistent — all four scenarios follow the same Situation → Feeling → Thought → Action → Feedback pattern, which means we can build one reusable lesson engine and plug in scenarios as data. Before we start building I need decisions on: target device and orientation; whether the prototype should cover all four domains with one scenario each (what you've written) or fewer domains with more scenarios (what the decks suggest); how the "appropriate choice?" check in the flowchart should behave given the "no wrong answers" principle; and who will produce the three missing illustrations, the emotion icons, and the voice audio. I'd recommend read-aloud on every screen as a baseline feature for this audience rather than an optional extra.
