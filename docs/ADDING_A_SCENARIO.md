# 새 상황(시나리오) 추가하기 — 콘텐츠 팀 안내

마음잇다 앱의 모든 수업 내용은 `content/scenarios/` 폴더의 JSON 파일입니다.
**파일 하나를 추가하면 홈 화면에 자동으로 나타나고 바로 플레이할 수 있습니다.** 코드 수정은 필요 없습니다.

## 1. 가장 빠른 방법: 기존 파일 복사

1. `content/scenarios/social-playground.json`을 복사해 새 이름으로 저장합니다.
   파일 이름은 **영문 소문자와 하이픈**만 사용하고, 파일 안의 `"id"`와 똑같아야 합니다.
   예: `social-group-project.json` ↔ `"id": "social-group-project"`
2. 아래 표를 보며 내용을 바꿉니다. `ko`(한국어)는 필수, `en`(영어)은 선택입니다.
3. 터미널에서 `pnpm validate`를 실행합니다. 빠진 내용이 있으면 **어느 파일의 어떤 칸이 왜 문제인지** 한국어로 안내합니다.
4. 원문에 맞춘 신규/수정 시나리오는 `content-source/pdf-transcriptions.json`에 출처·페이지·전사 문구도 반영하고 `pnpm validate:final-content`로 대조합니다. 기존 네 원문의 누락/오탈자 정책은 [CONTENT_REVIEW.md](./CONTENT_REVIEW.md)를 따릅니다.
5. `pnpm dev`로 앱을 띄워 직접 플레이해 봅니다.

## 2. 파일 구조 한눈에 보기

| 칸 | 뜻 | 규칙 |
|---|---|---|
| `id` | 파일 이름과 같은 고유 이름 | 소문자·숫자·하이픈 |
| `domain` | 영역 | `self`(자기 인식) · `social`(관계 인식) · `relation`(관계 관리) · `mind`(마음건강관리) |
| `order` | 같은 영역 안의 순서 | 1부터 |
| `title`, `learningGoal`, `estimatedMinutes` | 설계서 "01. 콘텐츠 기본정보" | — |
| `situation.story` | 상황 이야기 | **한 문장씩** 배열로. 한 문장 60자 이내 |
| `situation.keySentence` | 화면에 제시할 핵심 문장 | 30자 이내 |
| `situation.image` | 삽화 파일 | `content-source/images/<id>.png`에 넣고 `pnpm images` 실행 → `"/img/<id>.png"`. 없으면 지우세요(자동으로 '그림 준비 중' 카드가 나옵니다) |
| `situation.imageBrief` | 삽화 설명 | 그림이 없을 때 교사에게 보이고, 그림이 있을 때는 대체 텍스트로 쓰입니다 |
| `feeling.subject` | 누구의 감정인가 | `self`(나) 또는 `other`(친구) |
| `feeling.options` | 감정 버튼 | `content/emotions.json`의 id. 원문에 `not-sure`가 있으면 마지막에 한 번만 포함 |
| `feeling.hint` | 도와줘요 힌트 | `text` + 추천 감정 2개(`suggest`, options 안에 있어야 함) |
| `step3.type` | 3단계 종류 | `reason`(이유) · `body-reaction`(몸의 반응) · `multiple-choice`(A–D 고르기) |
| `step3.byFeeling` | 감정별 설명 | `reason`/`body-reaction`일 때, `not-sure`를 뺀 감정별 원문 설명. 원문에 없는 설명은 만들지 않고 `step3.sourceOmissions`에 해당 감정 id 기록 |
| `step3.options` | A–D 선택지 | `multiple-choice`일 때만, 정확히 4개, `ack`(짧은 인정 문장)는 원문에 있을 때만 포함 |
| `step3.principle`, `step3.more` | 원칙 문장, '더 알려줘요' 내용 | 선택 항목. 원문에 없으면 생략; 버튼도 숨겨짐 |
| `action.options` | 대처 방법 A–D | 정확히 4개. 각각 `quality`와 `feedback`, `outcomeIcon` |
| `closing` | 마무리 메시지 | — |

### `quality` (대처 방법의 성격)
- `recommended` — 권장. 피드백 후 **계속** 버튼만 보입니다.
- `acceptable` — 괜찮음. 위와 같습니다.
- `reconsider` — 다시 생각해 볼 만함. 피드백 후 **다른 방법 해보기** 버튼이 함께 보입니다. (아이에게 '틀렸다'고 하지 않습니다.)

### `outcomeIcon` (피드백 화면의 작은 그림)
`think` · `wait` · `talk` · `together` · `teacher` · `handshake` · `walk` · `draw` · `quiet` · `breathe`

## 3. 감정 단어 추가하기

`content/emotions.json`에 한 줄을 추가하고, `public/icons/emotions/<id>.svg` 얼굴 아이콘을 넣습니다.
(아이콘은 `scripts/gen-icons.ts`의 `faces` 목록에 추가한 뒤 `pnpm icons`로 만들 수 있습니다.)
새 한글 음절이 KS X 1001 범위를 벗어나면 `pnpm fonts`를 한 번 실행해 글꼴을 다시 만듭니다(스크립트가 알려줍니다).

## 4. 초안 표시

아직 확정되지 않은 문장에는 `"draft": true`를 붙여 두세요.
`pnpm validate`가 초안 목록을 정리해 주고, `pnpm draft-strings`로 검토용 문서(`docs/DRAFT_STRINGS.md`)를 만들 수 있습니다.

## 5. 체크리스트 (설계서 08번 슬라이드와 같습니다)

- [ ] 콘텐츠명·대상·학습목표가 들어 있는가? (`title`, `learningGoal`)
- [ ] 상황 이야기와 핵심 문장이 최종 확정되었는가?
- [ ] 삽화가 있거나, 삽화 설명(`imageBrief`)이 쓰여 있는가?
- [ ] 감정별 원문 설명이 반영되었고 원문 누락은 명시되어 있는가? (`pnpm validate`가 확인)
- [ ] 선택지 A–D마다 피드백이 있는가? (`pnpm validate`가 확인)
- [ ] 피드백이 정답·오답이 아니라 설명형인가?
