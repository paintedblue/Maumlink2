import type { Scenario } from '../../src/content/schema'

export const validEmotions = {
  schemaVersion: 1,
  emotions: [
    { id: 'angry', word: { ko: '화가 나요', en: 'Angry' }, icon: 'angry.svg', tint: '#F8D7C4' },
    { id: 'upset', word: { ko: '속상해요', en: 'Upset' }, icon: 'upset.svg', tint: '#D6E6F7' },
    {
      id: 'worried',
      word: { ko: '걱정돼요', en: 'Worried' },
      icon: 'worried.svg',
      tint: '#DCE7EC',
    },
    {
      id: 'not-sure',
      word: { ko: '잘 모르겠어요', en: 'Not sure' },
      icon: 'not-sure.svg',
      tint: '#ECEAE6',
    },
  ],
}

export const validUi = {
  'app.name': { ko: '마음잇다', en: 'Maum:Link' },
  'nav.next': { ko: '다음', en: 'Next' },
}

const L = (ko: string, en = ko) => ({ ko, en })

/** A fully valid scenario; tests mutate a fresh copy. */
export function validScenario(): Scenario {
  return {
    schemaVersion: 1,
    id: 'test-scenario',
    domain: 'social',
    order: 1,
    title: L('테스트'),
    learningGoal: L('목표'),
    estimatedMinutes: 5,
    situation: {
      title: L('상황'),
      story: [L('첫 문장이에요.'), L('둘째 문장이에요.')],
      keySentence: L('핵심 문장'),
      image: '/img/test.png',
      imageBrief: L('설명'),
    },
    feeling: {
      subject: 'self',
      question: L('어떤 기분일까요?'),
      options: ['angry', 'upset', 'not-sure'],
      multiSelect: false,
      hint: { text: L('힌트'), suggest: ['angry', 'upset'] },
    },
    step3: {
      type: 'reason',
      question: L('왜 그럴까요?'),
      byFeeling: { angry: L('화 이유'), upset: L('속상 이유') },
      principle: L('원칙'),
      more: L('더'),
    },
    action: {
      question: L('어떻게 할까요?'),
      options: [
        {
          id: 'A',
          text: L('가'),
          quality: 'reconsider',
          feedback: L('가 피드백'),
          outcomeIcon: 'think',
        },
        {
          id: 'B',
          text: L('나'),
          quality: 'acceptable',
          feedback: L('나 피드백'),
          outcomeIcon: 'wait',
        },
        {
          id: 'C',
          text: L('다'),
          quality: 'recommended',
          feedback: L('다 피드백'),
          outcomeIcon: 'talk',
        },
        {
          id: 'D',
          text: L('라'),
          quality: 'acceptable',
          feedback: L('라 피드백'),
          outcomeIcon: 'teacher',
        },
      ],
    },
    closing: L('마무리'),
  }
}
