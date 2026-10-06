/** Export exact spoken Korean phrases for production; no API calls or credentials. */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { EmotionsFile, Scenario, UiFile } from '../src/content/schema'
import recording from '../src/services/recorded-narration.json'
import { narrationKey } from '../src/services/recordedNarration'

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'))
const ui = UiFile.parse(readJson('content/ui.json'))
const emotions = EmotionsFile.parse(readJson('content/emotions.json')).emotions
const entries = new Map<string, { id: string; text: string; sources: string[] }>()
const add = (text: string | undefined, source: string) => {
  if (!text?.trim()) return
  const key = narrationKey(text)
  const previous = entries.get(key)
  if (previous) previous.sources.push(source)
  else
    entries.set(key, {
      id: createHash('sha256').update(key).digest('hex').slice(0, 12),
      text,
      sources: [source],
    })
}

for (const key of [
  'home.greeting',
  'step3.explore',
  'feeling.pickFirst',
  'feedback.myChoice',
  'wrapup.path',
])
  add(ui[key]!.ko, `ui.${key}`)

for (const emotion of emotions) {
  add(emotion.word.ko, `emotions.${emotion.id}`)
  for (const key of ['feeling.chose', 'feeling.notSureTwice'])
    add(ui[key]!.ko.replaceAll('{emotion}', emotion.word.ko), `ui.${key}.${emotion.id}`)
}

for (const file of readdirSync('content/scenarios').filter((name) => name.endsWith('.json'))) {
  const scenario = Scenario.parse(readJson(`content/scenarios/${file}`))
  const put = (text: string | undefined, field: string) => add(text, `${scenario.id}.${field}`)
  scenario.situation.story.forEach((line, i) => put(line.ko, `situation.story.${i}`))
  put(scenario.situation.keySentence.ko, 'situation.keySentence')
  put(scenario.feeling.question.ko, 'feeling.question')
  put(scenario.feeling.hint.text.ko, 'feeling.hint')
  put(scenario.step3.question.ko, 'step3.question')
  put(scenario.step3.principle?.ko, 'step3.principle')
  put(scenario.step3.more?.ko, 'step3.more')
  if (scenario.step3.type === 'multiple-choice') {
    for (const option of scenario.step3.options) {
      put(option.text.ko, `step3.options.${option.id}`)
      put(option.ack?.ko, `step3.options.${option.id}.ack`)
    }
  } else {
    for (const [feeling, entry] of Object.entries(scenario.step3.byFeeling))
      put('text' in entry ? entry.text.ko : entry.ko, `step3.byFeeling.${feeling}`)
  }
  put(scenario.action.question.ko, 'action.question')
  for (const option of scenario.action.options) {
    put(option.text.ko, `action.options.${option.id}`)
    put(option.feedback.ko, `action.options.${option.id}.feedback`)
  }
  put(scenario.closing.ko, 'closing')
}

const clips = [...entries.values()].map((entry) => ({
  ...entry,
  url: recording.clips.find((clip) => narrationKey(clip.text) === narrationKey(entry.text))?.url,
}))
mkdirSync('content-source/narration', { recursive: true })
writeFileSync(
  'content-source/narration/inventory.json',
  `${JSON.stringify({ voiceId: recording.voiceId, clips }, null, 2)}\n`,
)
console.log(`${clips.length} phrases; ${clips.filter((clip) => clip.url).length} recorded`)
