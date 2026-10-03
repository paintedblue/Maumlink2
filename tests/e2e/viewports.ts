/** PRD §12 viewport matrix (D16). CSS px; DPR noted for reference. */
export interface Viewport {
  name: string
  width: number
  height: number
  dpr: number
}

export const VIEWPORTS: Viewport[] = [
  { name: 'phone-s-portrait', width: 360, height: 640, dpr: 3 },
  { name: 'phone-s-landscape', width: 640, height: 360, dpr: 3 },
  { name: 'phone-m-portrait', width: 390, height: 844, dpr: 3 },
  { name: 'phone-m-landscape', width: 844, height: 390, dpr: 3 },
  { name: 'tablet-portrait', width: 768, height: 1024, dpr: 2 },
  { name: 'tablet-landscape', width: 1024, height: 768, dpr: 2 },
  { name: 'tablet-l-portrait', width: 820, height: 1180, dpr: 2 },
  { name: 'tablet-l-landscape', width: 1180, height: 820, dpr: 2 },
  { name: 'laptop', width: 1366, height: 768, dpr: 1 },
  { name: 'desktop', width: 1920, height: 1080, dpr: 1 },
  { name: 'desktop-xl', width: 2560, height: 1440, dpr: 1 },
]

export const byName = (name: string): Viewport => {
  const v = VIEWPORTS.find((x) => x.name === name)
  if (!v) throw new Error(`unknown viewport ${name}`)
  return v
}
