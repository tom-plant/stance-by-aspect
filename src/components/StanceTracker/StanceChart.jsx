import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { DAYS, getTopicColor } from '../../data/mockData'

const MARGIN = { top: 16, right: 16, bottom: 36, left: 0 }
const TENSION = 0.28   // Catmull-Rom tension for smooth area curves
const GRID_COLOR = 'rgba(15,15,19,0.55)'

// ─── Smooth area path (Catmull-Rom → cubic Bezier) ─────────────────────────
function catmullRomSegments(pts, tension) {
  if (pts.length < 2) return ''
  const cmds = [`M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`]
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 2)]
    const p1 = pts[i - 1]
    const p2 = pts[i]
    const p3 = pts[Math.min(pts.length - 1, i + 1)]
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension
    cmds.push(
      `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    )
  }
  return cmds.join(' ')
}

function buildAreaPath(topPts, botPts) {
  const top = catmullRomSegments(topPts, TENSION)
  const revBot = [...botPts].reverse()
  const botCurve = catmullRomSegments(revBot, TENSION)
  // Join: forward top edge → jump to bottom-right → reverse bottom edge → close
  const [, ...botInstructions] = botCurve.split(/(?=C )|(?=M )/)
  const jumpToBotRight = `L ${revBot[0][0].toFixed(1)},${revBot[0][1].toFixed(1)}`
  return `${top} ${jumpToBotRight} ${botInstructions.join('')} Z`
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function StanceChart({
  sortedData,          // pre-sorted topics (highest volume first = bottom of stack)
  simulateTooltip,     // boolean: show demo hover on Jan 22
  onHoverCell,         // (dayIndex, topicSortedIdx, { clientX, clientY }) => void
  onLeaveChart,
  highlightIdx,        // sorted index to highlight (others dimmed)
  activeTooltip,       // { dayIndex, topicSortedIdx } | null
}) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 800, height: 480 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDims({ width: Math.max(300, width), height: Math.max(160, height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const { width, height } = dims
  const chartW = width  - MARGIN.left - MARGIN.right
  const chartH = height - MARGIN.top  - MARGIN.bottom
  const nDays  = DAYS.length
  const nTopics = sortedData.length

  // ── Stacking ──────────────────────────────────────────────────────────────
  const { cumTops, cumBots, maxDayTotal } = useMemo(() => {
    const cumBots = sortedData.map(() => new Array(nDays).fill(0))
    const cumTops = sortedData.map(() => new Array(nDays).fill(0))
    for (let d = 0; d < nDays; d++) {
      let running = 0
      for (let i = 0; i < nTopics; i++) {
        cumBots[i][d] = running
        running += sortedData[i].days[d].total
        cumTops[i][d] = running
      }
    }
    const dayTotals = Array.from({ length: nDays }, (_, d) =>
      sortedData.reduce((s, t) => s + t.days[d].total, 0)
    )
    return { cumTops, cumBots, maxDayTotal: Math.max(...dayTotals) }
  }, [sortedData, nDays, nTopics])

  // ── Scales ────────────────────────────────────────────────────────────────
  const dayStep = chartW / nDays
  const xAt  = (d) => (d + 0.5) * dayStep
  const yAt  = (v) => chartH - (v / maxDayTotal) * chartH

  // ── Hover detection ──────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !onHoverCell) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return
    const rect  = svgEl.getBoundingClientRect()
    const mx    = e.clientX - rect.left  - MARGIN.left
    const my    = e.clientY - rect.top   - MARGIN.top
    const d     = Math.floor(mx / dayStep)
    if (d < 0 || d >= nDays) { onLeaveChart?.(); return }

    // Scan topics bottom-to-top (highest idx = top of stack visually)
    for (let i = nTopics - 1; i >= 0; i--) {
      const yTop = yAt(cumTops[i][d])
      const yBot = yAt(cumBots[i][d])
      if (my >= yTop && my <= yBot) {
        onHoverCell(d, i, { clientX: e.clientX, clientY: e.clientY })
        return
      }
    }
    onLeaveChart?.()
  }, [dayStep, nDays, nTopics, cumTops, cumBots, yAt, onHoverCell, onLeaveChart])

  // ── Gradient definitions ──────────────────────────────────────────────────
  const gradientDefs = useMemo(() => (
    sortedData.map((topic) => (
      <linearGradient
        key={topic.id}
        id={`g${topic.id}`}
        gradientUnits="userSpaceOnUse"
        x1={0} y1={0} x2={chartW} y2={0}
      >
        {topic.days.map((day, d) => (
          <stop
            key={d}
            offset={xAt(d) / chartW}
            stopColor={getTopicColor(topic.baseHue, day.support, day.neutral, day.oppose, day.total)}
          />
        ))}
      </linearGradient>
    ))
  ), [sortedData, chartW, xAt])

  // ── X-axis labels ─────────────────────────────────────────────────────────
  const xLabels = DAYS.reduce((acc, label, d) => {
    if (d % 5 === 0 || d === nDays - 1) acc.push({ d, label })
    return acc
  }, [])

  // Demo tooltip targets Jan 22 (index 21), Merrell (topic with name 'Merrell')
  const DEMO_DAY     = 21
  const DEMO_TOPIC_I = useMemo(
    () => sortedData.findIndex((t) => t.name === 'Merrell'),
    [sortedData]
  )

  const hoverDay = simulateTooltip
    ? DEMO_DAY
    : activeTooltip?.dayIndex ?? null

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeaveChart}
    >
      <svg width={width} height={height} style={{ display: 'block', cursor: 'crosshair' }}>
        <defs>{gradientDefs}</defs>

        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Chart background */}
          <rect x={0} y={0} width={chartW} height={chartH} fill="#0f0f13" rx={2} />

          {/* Area paths — rendered bottom to top */}
          {sortedData.map((topic, i) => {
            const topPts = DAYS.map((_, d) => [xAt(d), yAt(cumTops[i][d])])
            const botPts = DAYS.map((_, d) => [xAt(d), yAt(cumBots[i][d])])
            const pathD  = buildAreaPath(topPts, botPts)
            const isHighlighted = highlightIdx === null || highlightIdx === undefined || highlightIdx === i
            const opacity = isHighlighted ? 1 : 0.2
            return (
              <path
                key={topic.id}
                d={pathD}
                fill={`url(#g${topic.id})`}
                opacity={opacity}
                style={{ transition: 'opacity 0.15s' }}
              />
            )
          })}

          {/* Day grid lines */}
          {DAYS.map((_, d) => (
            <line
              key={d}
              x1={xAt(d)} y1={0}
              x2={xAt(d)} y2={chartH}
              stroke={GRID_COLOR}
              strokeWidth={d % 5 === 0 ? 1.5 : 0.75}
            />
          ))}

          {/* Hovered / demo day column highlight */}
          {hoverDay !== null && (
            <rect
              x={hoverDay * dayStep}
              y={0}
              width={dayStep}
              height={chartH}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}

          {/* Hover crosshair on active topic band */}
          {activeTooltip && (() => {
            const { dayIndex: d, topicSortedIdx: i } = activeTooltip
            if (i == null || i < 0) return null
            const yTop = yAt(cumTops[i][d])
            const yBot = yAt(cumBots[i][d])
            return (
              <rect
                x={d * dayStep + 1} y={yTop}
                width={dayStep - 2} height={Math.max(1, yBot - yTop)}
                fill="rgba(255,255,255,0.15)"
                rx={1}
                pointerEvents="none"
              />
            )
          })()}

          {/* Baseline */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#2d2d3d" strokeWidth={1} />

          {/* X-axis labels */}
          {xLabels.map(({ d, label }) => (
            <text
              key={label}
              x={xAt(d)}
              y={chartH + 18}
              textAnchor="middle"
              fill="#505068"
              fontSize={10}
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}
