// ─── Color encoding ────────────────────────────────────────────────────────
// Each topic has a stable base hue (identity).
// Lightness encodes directional lean: lighter = support, darker = oppose.
// Saturation encodes confidence: saturated = clear lean, washed = mixed/neutral.

export function getTopicColor(baseHue, support, neutral, oppose, total) {
  if (!total) return `hsl(${baseHue}, 15%, 25%)`
  const lean       = (support - oppose) / total   // -1 … +1
  const confidence = 1 - neutral / total           //  0 … +1
  const lightness  = 47 + lean * 20               // 27 % … 67 %
  const saturation = 18 + confidence * 55         // 18 % … 73 %
  return `hsl(${baseHue}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`
}

export function getStanceLabel(support, neutral, oppose, total) {
  if (!total) return 'No data'
  const lean        = (support - oppose) / total
  const neutralRate = neutral / total
  if (neutralRate > 0.6)  return 'Mostly neutral'
  if (lean >  0.5)        return 'Strongly supportive'
  if (lean >  0.2)        return 'Mostly supportive'
  if (lean > -0.2)        return 'Mixed'
  if (lean > -0.5)        return 'Mostly opposed'
  return 'Strongly opposed'
}

// ─── Deterministic PRNG ────────────────────────────────────────────────────
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ─── Topic definitions ─────────────────────────────────────────────────────
// baseHue: stable color identity
// lean:    tendency, -1 (all support) → +1 (all oppose)
// conf:    how clear/one-sided the stance signal is  0 … 1
// vol:     typical daily mention count
const TOPIC_DEFS = [
  { name: 'Merrell',            baseHue: 208, lean:  0.65, conf: 0.75, vol: 28 },
  { name: 'Clarks Wallabee',    baseHue: 178, lean: -0.65, conf: 0.70, vol: 18 },
  { name: 'Onitsuka Mexico 66', baseHue: 155, lean: -0.75, conf: 0.80, vol: 22 },
  { name: 'Ariat Ascent',       baseHue: 138, lean: -0.40, conf: 0.60, vol: 14 },
  { name: 'Nike',               baseHue:  90, lean:  0.05, conf: 0.40, vol: 44 },
  { name: 'Adidas',             baseHue:  52, lean: -0.05, conf: 0.45, vol: 38 },
  { name: 'New Balance',        baseHue:  32, lean: -0.25, conf: 0.55, vol: 33 },
  { name: 'Vans',               baseHue:  15, lean:  0.10, conf: 0.40, vol: 26 },
  { name: 'Timberland',         baseHue: 348, lean:  0.35, conf: 0.65, vol: 20 },
  { name: 'Converse',           baseHue: 318, lean:  0.05, conf: 0.35, vol: 19 },
  { name: 'Puma',               baseHue: 288, lean: -0.10, conf: 0.45, vol: 17 },
  { name: 'Reebok',             baseHue: 262, lean: -0.20, conf: 0.50, vol: 14 },
  { name: 'Crocs',              baseHue: 242, lean: -0.65, conf: 0.80, vol: 34 },
  { name: 'Dr. Martens',        baseHue: 222, lean: -0.45, conf: 0.65, vol: 21 },
  { name: 'Unspecified Brand',  baseHue:   5, lean:  0.70, conf: 0.70, vol: 48 },
]

// ─── 30-day window ─────────────────────────────────────────────────────────
export const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 0, i + 1)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

// ─── Data generators ───────────────────────────────────────────────────────
function leanToSNO(lean, conf, total) {
  // Given a directional lean (-1…+1) and confidence (0…1), split total into S/N/O
  const neutralShare = (1 - conf) * 0.55 + 0.05           // higher when low confidence
  const sideShare    = (1 - neutralShare) / 2
  const supportShare = Math.max(0, Math.min(1, sideShare + lean * sideShare))
  const opposeShare  = Math.max(0, Math.min(1, sideShare - lean * sideShare))
  const nShare       = Math.max(0, 1 - supportShare - opposeShare)
  const support = Math.round(supportShare * total)
  const oppose  = Math.round(opposeShare  * total)
  const neutral = Math.max(0, total - support - oppose)
  return { support, neutral, oppose, total }
}

export function generateTopicData(defs, seed) {
  const rng = makeRng(seed)
  return defs.map((def, ti) => {
    const days = DAYS.map(() => {
      const leanNoise = (rng() - 0.5) * 0.45
      const confNoise = (rng() - 0.5) * 0.35
      const volNoise  = (rng() - 0.5) * def.vol * 0.55
      const lean = Math.max(-1, Math.min(1, def.lean + leanNoise))
      const conf = Math.max(0,  Math.min(1, def.conf + confNoise))
      const vol  = Math.max(2,  Math.round(def.vol + volNoise))
      return leanToSNO(lean, conf, vol)
    })

    // Fix Jan 22 (index 21) for Merrell — matches tooltip demo
    if (def.name === 'Merrell') {
      days[21] = { support: 2, neutral: 3, oppose: 19, total: 24 }
    }

    return {
      id: ti,
      name: def.name,
      baseHue: def.baseHue,
      days,
      totalVolume: days.reduce((s, d) => s + d.total, 0),
    }
  })
}

export const ENTITY_DATA = generateTopicData(TOPIC_DEFS, 42)

// ─── Merrell drill-down attributes ────────────────────────────────────────
const ATTR_DEFS = [
  { name: 'Durability',          baseHue: 208, lean:  0.80, conf: 0.85, vol: 10 },
  { name: 'Price / Tariffs',     baseHue: 208, lean:  0.72, conf: 0.80, vol:  8 },
  { name: 'Comfort',             baseHue: 208, lean: -0.50, conf: 0.65, vol:  5 },
  { name: 'Style & Trends',      baseHue: 208, lean:  0.10, conf: 0.40, vol:  4 },
  { name: 'Leather & Materials', baseHue: 208, lean:  0.25, conf: 0.55, vol:  4 },
  { name: 'Sizing',              baseHue: 208, lean:  0.15, conf: 0.50, vol:  3 },
]

export const MERRELL_ATTR_DATA = (() => {
  const attrs = generateTopicData(ATTR_DEFS, 99)
  // Fix Jan 22 attribute data
  attrs[0].days[21] = { support: 0, neutral: 1, oppose: 13, total: 14 } // Durability
  attrs[1].days[21] = { support: 0, neutral: 1, oppose:  7, total:  8 } // Price
  attrs[2].days[21] = { support: 2, neutral: 0, oppose:  0, total:  2 } // Comfort
  return attrs
})()
