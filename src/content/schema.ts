/**
 * Content schema — PRD §7.2. Zod is the single source of truth; the TypeScript
 * types are inferred from it so the validator, loader and UI never disagree.
 * Korean (`ko`) is required and shipped; `en` is optional and dev/demo only (D17).
 */
import { z } from 'zod'

export const LString = z.object({
  ko: z.string().min(1),
  en: z.string().min(1).optional(),
  audio: z.object({ ko: z.string().optional(), en: z.string().optional() }).optional(),
  draft: z.boolean().optional(),
})
export type LString = z.infer<typeof LString>

export const EMOTION_ID_PATTERN = /^[a-z][a-z-]*$/
export const SCENARIO_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const EmotionId = z.string().regex(EMOTION_ID_PATTERN)
export const OptionId = z.enum(['A', 'B', 'C', 'D'])
export type OptionId = z.infer<typeof OptionId>
export const BodyPart = z.enum(['head', 'eyes', 'mouth', 'chest', 'stomach', 'hands', 'body'])
export type BodyPart = z.infer<typeof BodyPart>
export const Domain = z.enum(['self', 'social', 'relation', 'mind', 'reserved'])
export type Domain = z.infer<typeof Domain>
export const DOMAINS: readonly Domain[] = ['self', 'social', 'relation', 'mind', 'reserved']
export const Quality = z.enum(['recommended', 'acceptable', 'reconsider'])
export type Quality = z.infer<typeof Quality>

const Step3Base = { question: LString, principle: LString.optional(), more: LString.optional() }

export const Step3Reason = z.object({
  type: z.literal('reason'),
  sourceOmissions: z.array(EmotionId).optional(),
  ...Step3Base,
  byFeeling: z.record(EmotionId, LString),
})
export const Step3Body = z.object({
  type: z.literal('body-reaction'),
  sourceOmissions: z.array(EmotionId).optional(),
  ...Step3Base,
  byFeeling: z.record(EmotionId, z.object({ text: LString, parts: z.array(BodyPart).min(1) })),
})
export const Step3Choice = z.object({
  type: z.literal('multiple-choice'),
  ...Step3Base,
  options: z.array(z.object({ id: OptionId, text: LString, ack: LString.optional() })).length(4),
})
export const Step3 = z.discriminatedUnion('type', [Step3Reason, Step3Body, Step3Choice])
export type Step3 = z.infer<typeof Step3>

export const ActionOption = z.object({
  id: OptionId,
  text: LString,
  quality: Quality,
  feedback: LString,
  outcomeIcon: z.string().regex(/^[a-z][a-z-]*$/),
})
export type ActionOption = z.infer<typeof ActionOption>

export const Scenario = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(SCENARIO_ID_PATTERN),
  domain: Domain,
  order: z.number().int().positive(),
  title: LString,
  learningGoal: LString,
  estimatedMinutes: z.number().int().positive(),
  situation: z.object({
    title: LString,
    story: z.array(LString).min(1),
    keySentence: LString,
    image: z.string().optional(),
    imageByLocale: z.object({ ko: z.string().optional(), en: z.string().optional() }).optional(),
    imageBrief: LString,
  }),
  feeling: z.object({
    subject: z.enum(['self', 'other']),
    question: LString,
    options: z.array(EmotionId).min(2),
    multiSelect: z.boolean(),
    hint: z.object({ text: LString, suggest: z.tuple([EmotionId, EmotionId]) }),
  }),
  step3: Step3,
  action: z.object({
    question: LString,
    options: z.array(ActionOption).length(4),
  }),
  closing: LString,
})
export type Scenario = z.infer<typeof Scenario>

export const Emotion = z.object({
  id: EmotionId,
  word: LString,
  icon: z.string().endsWith('.svg'),
  tint: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})
export type Emotion = z.infer<typeof Emotion>

export const EmotionsFile = z.object({
  schemaVersion: z.literal(1),
  emotions: z.array(Emotion).min(1),
})
export type EmotionsFile = z.infer<typeof EmotionsFile>

export const UiString = z.object({ ko: z.string().min(1), en: z.string().min(1).optional() })
export const UiFile = z.record(z.string(), UiString)
export type UiFile = z.infer<typeof UiFile>

export const NOT_SURE = 'not-sure'
