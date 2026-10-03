# Tablet test checklist (manual, PRD §12 / §14.2 / §14.8)

Run on **one iPad (Safari)** and **one Android tablet (Chrome or Samsung Internet)**. Record device, OS version and result per row. Tick only what you observed.

Deployed URL: ______________________  Build: ______________________  Tester: ______________  Date: __________

## A. First run & audio
| # | Step | Expected | iPad | Android |
|---|---|---|---|---|
| A1 | Open the URL for the first time | Full-screen **시작하기** button | ☐ | ☐ |
| A2 | Tap 시작하기 | Home appears **and the greeting is spoken aloud** | ☐ | ☐ |
| A3 | Toggle the voice icon off, then on | Icon and accessible state change; speech stops while off; reading resumes when on | ☐ | ☐ |
| A4 | Voice quality | Korean voice is intelligible for a 9-year-old (note the voice name if shown in Settings > Accessibility) | ☐ | ☐ |
| A5 | Settings → 소리 끄기 | Tap "tick" sounds stop; speech continues | ☐ | ☐ |
| A6 | Settings → 자동으로 읽어주기 끄기 | New screens are not read automatically; speaker button still works | ☐ | ☐ |

## B. One full lesson by touch only (관계 인식 → 친구들과 함께 놀고 싶어요)
| # | Step | Expected | iPad | Android |
|---|---|---|---|---|
| B1 | Tap the 관계 인식 card | Situation screen with the playground picture | ☐ | ☐ |
| B2 | Tap 다음 through the source sentences and key sentence | Sentences advance one at a time, then the original key sentence | ☐ | ☐ |
| B3 | On the feeling screen, tap 다음 **without choosing** | Spoken "먼저 하나를 골라요."; tiles wiggle; stays on screen | ☐ | ☐ |
| B4 | Wait 20 s without touching | Hint sheet slides up once | ☐ | ☐ |
| B5 | Tap a suggested feeling in the hint | Sheet closes; tile shows selected border + check | ☐ | ☐ |
| B6 | 다음 → Step 3 | Original PDF reason matches the chosen feeling; 서운해요 has no source explanation and can still continue; no 더 알려줘요 button | ☐ | ☐ |
| B7 | Choose action **A** (angry) → 이걸로 할래요 | Feedback is explanatory; **다른 방법 해보기** is offered; no "wrong"/X/red anywhere | ☐ | ☐ |
| B8 | Tap 다른 방법 해보기, choose **C** | Card A appears dimmed; feedback for C; only 계속 | ☐ | ☐ |
| B9 | 계속 | Wrap-up: selected feeling/action recap and original closing; closing read aloud when voice is on | ☐ | ☐ |
| B10 | 처음으로 | Home shows **완료** at the top right of the 관계 인식 card; image fills the left side top to bottom | ☐ | ☐ |

## C. Responsiveness & rotation (D16)
| # | Step | Expected | iPad | Android |
|---|---|---|---|---|
| C1 | Portrait: repeat B1–B3 | No horizontal scrolling; 다음/이전 always visible without scrolling | ☐ | ☐ |
| C2 | **Rotate to landscape on the feeling screen with a feeling selected and the hint open** | Layout re-flows; selection and open sheet are kept; nothing overlaps | ☐ | ☐ |
| C3 | Rotate back to portrait on Step 3 | Same screen, same content | ☐ | ☐ |
| C4 | Settings → 글자 크기: 크게, then revisit S1–S5 | Larger text; nothing clipped; buttons reachable | ☐ | ☐ |
| C5 | Add to Home Screen, open from the icon (standalone) | No control hidden under the home indicator / status bar | ☐ | ☐ |

## D. Offline (FR-PWA-02)
| # | Step | Expected | iPad | Android |
|---|---|---|---|---|
| D1 | After one full visit, enable Airplane mode, reopen the app | Home loads | ☐ | ☐ |
| D2 | Play any lesson offline | Pictures, icons and fonts work; separately record whether the installed Korean device voice works offline | ☐ | ☐ |

## E. Accessibility spot checks
| # | Step | Expected | iPad | Android |
|---|---|---|---|---|
| E1 | VoiceOver / TalkBack on the feeling screen | Tiles announced as checkboxes with the feeling word; selection state announced | ☐ | ☐ |
| E2 | System "Reduce Motion" on | No slide/wiggle animations; chime still plays | ☐ | ☐ |
| E3 | External keyboard (if available): Tab through S2 | All controls reachable in visual order; visible focus ring; no keyboard trap | ☐ | ☐ |

## Reported audio result (2026-10-03)

User confirmed Settings → 음성 확인 and automatic lesson narration both work on production Mac Chrome. Device/OS/browser versions were not provided. The user will test the remaining devices; unchecked rows remain pending.

## Notes / defects found
(device · screen · what happened · screenshot name)

-
-
