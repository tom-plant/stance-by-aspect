// ─── Color encoding ────────────────────────────────────────────────────────
// Single scale: Red (oppose) → Gray (neutral) → Blue (support)
// Lean direction sets red/blue; confidence controls saturation vs. gray

const C_OPPOSE  = [168, 30,  32]  // deep red
const C_NEUTRAL = [ 72, 72,  90]  // dark neutral gray
const C_SUPPORT = [ 30, 92, 198]  // deep blue

function lerpRGB(a, b, t) {
  const c = Math.max(0, Math.min(1, t))
  return a.map((v, i) => Math.round(v + (b[i] - v) * c))
}

export function getStanceColor(support, neutral, oppose, total) {
  if (!total) return 'rgb(50,50,62)'
  const lean = (support - oppose) / total  // -1 (oppose) … +1 (support)
  const conf = 1 - neutral / total         //  0 (all neutral) … +1 (clear lean)

  // Full-saturation base color from lean direction
  const base = lean >= 0
    ? lerpRGB(C_NEUTRAL, C_SUPPORT, lean)
    : lerpRGB(C_NEUTRAL, C_OPPOSE, -lean)

  // Desaturate toward neutral when confidence is low
  const cfactor = 0.25 + conf * 0.75
  const rgb = base.map((v, i) =>
    Math.round(C_NEUTRAL[i] + (v - C_NEUTRAL[i]) * cfactor)
  )
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
}

export function getStanceLabel(support, neutral, oppose, total) {
  if (!total) return 'No data'
  const lean = (support - oppose) / total
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

// lean < 0 = oppose (red), lean > 0 = support (blue)
function leanToSNO(lean, conf, total) {
  const neutralShare  = (1 - conf) * 0.50 + 0.05   // 5 %–55 %
  const remaining     = 1 - neutralShare
  const supportShare  = remaining * (0.5 + lean * 0.5)
  const opposeShare   = remaining - supportShare
  const support = Math.max(0, Math.round(supportShare * total))
  const oppose  = Math.max(0, Math.round(opposeShare  * total))
  const neutral = Math.max(0, total - support - oppose)
  return { support, neutral, oppose, total }
}

// ─── 30-day window ─────────────────────────────────────────────────────────
export const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 0, i + 1)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

// ─── Topic definitions ─────────────────────────────────────────────────────
// events[] pin specific days with override vol / lean / conf
// lean < 0 → red (oppose), lean > 0 → blue (support)
const TOPIC_DEFS = [
  {
    name: 'Unspecified Brand',
    baseLean: -0.62, baseConf: 0.68, baseVol: 48,
    events: [
      { day:  7, vol: 96, lean: -0.88, conf: 0.84 },  // tariff news
      { day:  8, vol: 74, lean: -0.80, conf: 0.80 },  // tariff aftermath
    ],
  },
  {
    name: 'Nike',
    baseLean: -0.04, baseConf: 0.30, baseVol: 44,
    events: [
      { day: 19, vol: 92, lean: -0.06, conf: 0.32 },  // earnings week
      { day: 24, vol: 66, lean:  0.02, conf: 0.28 },  // roundup
    ],
  },
  {
    name: 'Adidas',
    baseLean:  0.06, baseConf: 0.38, baseVol: 38,
    events: [
      { day: 19, vol: 68, lean:  0.28, conf: 0.55 },  // earnings + collab
    ],
  },
  {
    name: 'New Balance',
    baseLean:  0.32, baseConf: 0.55, baseVol: 33,
    events: [
      { day: 19, vol: 58, lean:  0.50, conf: 0.65 },  // collab drop
    ],
  },
  {
    name: 'Crocs',
    baseLean:  0.65, baseConf: 0.72, baseVol: 34,
    events: [
      { day: 11, vol: 88, lean:  0.84, conf: 0.87 },  // limited collab release
      { day: 28, vol: 58, lean:  0.75, conf: 0.78 },  // sale event
    ],
  },
  {
    name: 'Merrell',
    baseLean: -0.60, baseConf: 0.70, baseVol: 28,
    events: [
      { day:  7, vol: 64, lean: -0.76, conf: 0.78 },  // tariff spike
      { day: 21, vol: 24, lean: -0.72, conf: 0.72 },  // quality controversy (demo)
    ],
  },
  {
    name: 'Timberland',
    baseLean: -0.32, baseConf: 0.58, baseVol: 20,
    events: [
      { day:  7, vol: 42, lean: -0.64, conf: 0.72 },  // tariff
    ],
  },
  {
    name: 'Dr. Martens',
    baseLean:  0.40, baseConf: 0.60, baseVol: 21,
    events: [],
  },
  {
    name: 'Onitsuka Mexico 66',
    baseLean:  0.72, baseConf: 0.78, baseVol: 22,
    events: [
      { day: 14, vol: 54, lean:  0.82, conf: 0.84 },  // style feature
    ],
  },
  {
    name: 'Vans',
    baseLean: -0.08, baseConf: 0.34, baseVol: 26,
    events: [
      { day: 28, vol: 46, lean:  0.38, conf: 0.60 },  // sale = positive
    ],
  },
  {
    name: 'Converse',
    baseLean: -0.06, baseConf: 0.30, baseVol: 19,
    events: [],
  },
  {
    name: 'Clarks Wallabee',
    baseLean:  0.62, baseConf: 0.68, baseVol: 18,
    events: [
      { day: 14, vol: 42, lean:  0.78, conf: 0.80 },  // style feature
    ],
  },
  {
    name: 'Puma',
    baseLean:  0.12, baseConf: 0.40, baseVol: 17,
    events: [],
  },
  {
    name: 'Reebok',
    baseLean:  0.22, baseConf: 0.48, baseVol: 14,
    events: [],
  },
  {
    name: 'Ariat Ascent',
    baseLean:  0.38, baseConf: 0.52, baseVol:  8,
    events: [],
  },
]

function generateTopicDays(def, rng) {
  return DAYS.map((_, d) => {
    const ev = def.events?.find(e => e.day === d)
    let vol, lean, conf
    if (ev) {
      vol  = ev.vol
      lean = ev.lean
      conf = ev.conf
    } else {
      // Two uniform samples → roughly bell-shaped noise
      const n = (rng() + rng() - 1) * 0.75
      vol  = Math.max(2, Math.round(def.baseVol * (1 + n)))
      lean = Math.max(-1, Math.min(1, def.baseLean + (rng() - 0.5) * 0.48))
      conf = Math.max(0.1, Math.min(0.95, def.baseConf + (rng() - 0.5) * 0.38))
    }
    return leanToSNO(lean, conf, vol)
  })
}

export function generateTopicData(defs, seed) {
  const rng = makeRng(seed)
  return defs.map((def, i) => {
    const days = generateTopicDays(def, rng)
    return {
      id: i,
      name: def.name,
      days,
      totalVolume: days.reduce((s, d) => s + d.total, 0),
    }
  })
}

export const ENTITY_DATA = generateTopicData(TOPIC_DEFS, 42)

// ─── Merrell attribute drill-down ──────────────────────────────────────────
const ATTR_DEFS = [
  { name: 'Durability',          baseLean: -0.78, baseConf: 0.82, baseVol: 11,
    events: [{ day: 21, vol: 14, lean: -0.86, conf: 0.88 }] },
  { name: 'Price / Tariffs',     baseLean: -0.70, baseConf: 0.78, baseVol:  9,
    events: [{ day: 21, vol:  8, lean: -0.80, conf: 0.84 }] },
  { name: 'Comfort',             baseLean:  0.52, baseConf: 0.62, baseVol:  5,
    events: [{ day: 21, vol:  2, lean:  0.85, conf: 0.90 }] },
  { name: 'Style & Trends',      baseLean:  0.05, baseConf: 0.38, baseVol:  4, events: [] },
  { name: 'Leather & Materials', baseLean: -0.22, baseConf: 0.50, baseVol:  4, events: [] },
  { name: 'Sizing',              baseLean:  0.12, baseConf: 0.44, baseVol:  3, events: [] },
]

export const MERRELL_ATTR_DATA = generateTopicData(ATTR_DEFS, 99)
