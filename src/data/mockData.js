// Stance scale: 1=StrongSupport, 2=LeanSupport, 3=NeutralSupport, 4=NeutralOppose, 5=LeanOppose, 6=StrongOppose

export const STANCE_LABELS = {
  1: 'Strong Support',
  2: 'Lean Support',
  3: 'Neutral Support',
  4: 'Neutral Oppose',
  5: 'Lean Oppose',
  6: 'Strong Oppose',
}

export const STANCE_COLORS = {
  1: '#1a5cb8',
  2: '#3d82c4',
  3: '#8891a0',
  4: '#555566',
  5: '#b84040',
  6: '#7a1515',
}

export const STANCE_SHORT = {
  1: 'Strong Support',
  2: 'Lean Support',
  3: 'Neutral',
  4: 'Neutral',
  5: 'Lean Oppose',
  6: 'Strong Oppose',
}

// Deterministic pseudo-random number generator
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function roundStance(v) {
  return clamp(Math.round(v), 1, 6)
}

// Entity definitions: name, typical stance tendency (1-6), base daily volume
const ENTITY_DEFS = [
  { name: 'Merrell',             baseStance: 5.2, baseVolume: 28, volatility: 0.8 },
  { name: 'Clarks Wallabee',     baseStance: 1.8, baseVolume: 18, volatility: 0.6 },
  { name: 'Onitsuka Mexico 66',  baseStance: 1.5, baseVolume: 22, volatility: 0.5 },
  { name: 'Ariat Ascent',        baseStance: 2.3, baseVolume: 14, volatility: 0.7 },
  { name: 'Nike',                baseStance: 3.2, baseVolume: 44, volatility: 1.0 },
  { name: 'Adidas',              baseStance: 3.0, baseVolume: 38, volatility: 0.9 },
  { name: 'New Balance',         baseStance: 2.4, baseVolume: 33, volatility: 0.7 },
  { name: 'Vans',                baseStance: 3.1, baseVolume: 26, volatility: 0.8 },
  { name: 'Timberland',          baseStance: 4.2, baseVolume: 20, volatility: 0.9 },
  { name: 'Converse',            baseStance: 3.0, baseVolume: 19, volatility: 0.6 },
  { name: 'Puma',                baseStance: 2.9, baseVolume: 17, volatility: 0.7 },
  { name: 'Reebok',              baseStance: 2.6, baseVolume: 14, volatility: 0.6 },
  { name: 'Crocs',               baseStance: 1.6, baseVolume: 34, volatility: 1.2 },
  { name: 'Dr. Martens',         baseStance: 2.1, baseVolume: 21, volatility: 0.6 },
  { name: 'Unspecified Brand',   baseStance: 5.4, baseVolume: 48, volatility: 0.5 },
]

// Generate 30 days of data starting Jan 1
export const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 0, i + 1)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

// Generate macro-level entity data
function generateEntityData() {
  const rng = makeRng(42)
  return ENTITY_DEFS.map((def, ei) => {
    const days = DAYS.map((_, di) => {
      const stanceNoise = (rng() - 0.5) * 2 * def.volatility
      const volNoise = (rng() - 0.5) * def.baseVolume * 0.6
      const stance = roundStance(def.baseStance + stanceNoise)
      const volume = Math.max(3, Math.round(def.baseVolume + volNoise))
      return { stance, volume }
    })

    // Hardcode Jan 22 (index 21) for Merrell to match spec
    if (def.name === 'Merrell') {
      days[21] = { stance: 5, volume: 24 }
    }

    const totalVolume = days.reduce((s, d) => s + d.volume, 0)
    return {
      id: ei,
      name: def.name,
      days,
      totalVolume,
    }
  })
}

export const ENTITY_DATA = generateEntityData()

// Attribute definitions for Merrell drill-down
const MERRELL_ATTR_DEFS = [
  { name: 'Durability',           baseStance: 5.8, baseVolume: 12, volatility: 0.5 },
  { name: 'Price / Tariffs',      baseStance: 5.5, baseVolume: 9,  volatility: 0.6 },
  { name: 'Comfort',              baseStance: 2.2, baseVolume: 6,  volatility: 0.7 },
  { name: 'Style & Trends',       baseStance: 3.3, baseVolume: 5,  volatility: 0.8 },
  { name: 'Leather & Materials',  baseStance: 3.8, baseVolume: 5,  volatility: 1.1 },
  { name: 'Sizing',               baseStance: 3.4, baseVolume: 4,  volatility: 0.7 },
]

function generateAttributeData() {
  const rng = makeRng(99)
  return MERRELL_ATTR_DEFS.map((def, ai) => {
    const days = DAYS.map((_, di) => {
      const stanceNoise = (rng() - 0.5) * 2 * def.volatility
      const volNoise = (rng() - 0.5) * def.baseVolume * 0.6
      const stance = roundStance(def.baseStance + stanceNoise)
      const volume = Math.max(1, Math.round(def.baseVolume + volNoise))
      return { stance, volume }
    })

    // Hardcode Jan 22 to match spec tooltip data
    const attrVolumes = [14, 8, 2, 0, 0, 0]
    const attrStances = [6, 6, 3, 0, 0, 0]
    if (attrVolumes[ai] > 0) {
      days[21] = { stance: attrStances[ai], volume: attrVolumes[ai] }
    }

    const totalVolume = days.reduce((s, d) => s + d.volume, 0)
    return {
      id: ai,
      name: def.name,
      days,
      totalVolume,
    }
  })
}

export const MERRELL_ATTR_DATA = generateAttributeData()

// Tooltip data for Jan 22, Merrell (state 2 demo)
export const DEMO_TOOLTIP = {
  day: 'Jan 22',
  dayIndex: 21,
  entityName: 'Merrell',
  entityIndex: 0,
  dominantStance: 5,
  totalVolume: 24,
  attributes: [
    { name: 'Durability',      volume: 14, stance: 6, stanceLabel: 'Oppose' },
    { name: 'Price / Tariffs', volume: 8,  stance: 6, stanceLabel: 'Oppose' },
    { name: 'Comfort',         volume: 2,  stance: 3, stanceLabel: 'Neutral' },
  ],
}
