import { useRef, useEffect, useState, useCallback } from 'react'
import { DAYS, STANCE_COLORS } from '../../data/mockData'

const MARGIN = { top: 24, right: 12, bottom: 40, left: 0 }
const ENTITY_GAP = 4      // px gap between entity lanes (rendered as dark spacer)
const DAY_GAP = 3         // px gap between day columns
const HIGHLIGHT_DAY = 21  // Jan 22 index for demo tooltip

export default function StanceChart({
  data,
  viewMode,           // 'macro' | 'drilldown'
  simulateTooltip,    // boolean — show demo tooltip on Jan 22 / Merrell
  onHoverDay,         // (dayIndex, entityIndex, rect) => void
  onLeaveChart,       // () => void
  onClickEntity,      // (entityIndex) => void — only in macro
  highlightEntityIdx, // index of entity to highlight (hover state)
  activeTooltip,      // { dayIndex, entityIndex } | null
}) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 800, height: 480 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDims({ width: Math.max(300, width), height: Math.max(200, height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const { width, height } = dims
  const chartW = width - MARGIN.left - MARGIN.right
  const chartH = height - MARGIN.top - MARGIN.bottom

  const nDays = DAYS.length
  const nEntities = data.length

  // Compute column width
  const totalGapW = DAY_GAP * (nDays - 1)
  const colW = (chartW - totalGapW) / nDays

  // For each day, compute total volume and cumulative offsets per entity
  const dayTotals = DAYS.map((_, di) =>
    data.reduce((sum, e) => sum + e.days[di].volume, 0)
  )

  // Build rects: [entityIndex][dayIndex] = { x, y, w, h, stance, volume }
  // Within each day column: entities stacked top-to-bottom in fixed order,
  // proportionally sized, with ENTITY_GAP px spacers between them.
  const rects = []

  for (let di = 0; di < nDays; di++) {
    const x = di * (colW + DAY_GAP)
    const dayTotal = dayTotals[di]
    // Total usable height after entity gaps
    const usableH = chartH - ENTITY_GAP * (nEntities - 1)
    let yOffset = 0

    for (let ei = 0; ei < nEntities; ei++) {
      const { volume, stance } = data[ei].days[di]
      const segH = Math.max(1, (volume / dayTotal) * usableH)

      if (!rects[ei]) rects[ei] = []
      rects[ei][di] = { x, y: yOffset, w: colW, h: segH, stance, volume }

      yOffset += segH + ENTITY_GAP
    }
  }

  // Mouse event handlers
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !onHoverDay) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return
    const svgRect = svgEl.getBoundingClientRect()
    const mx = e.clientX - svgRect.left - MARGIN.left
    const my = e.clientY - svgRect.top - MARGIN.top

    // Find which day column
    const di = Math.floor(mx / (colW + DAY_GAP))
    if (di < 0 || di >= nDays) { onLeaveChart && onLeaveChart(); return }

    // Find which entity row
    for (let ei = 0; ei < nEntities; ei++) {
      const r = rects[ei][di]
      if (!r) continue
      if (my >= r.y && my <= r.y + r.h) {
        onHoverDay(di, ei, { x: e.clientX, y: e.clientY })
        return
      }
    }
    onLeaveChart && onLeaveChart()
  }, [rects, colW, nDays, nEntities, onHoverDay, onLeaveChart])

  const handleClick = useCallback((e) => {
    if (!containerRef.current || !onClickEntity) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return
    const svgRect = svgEl.getBoundingClientRect()
    const mx = e.clientX - svgRect.left - MARGIN.left
    const my = e.clientY - svgRect.top - MARGIN.top
    const di = Math.floor(mx / (colW + DAY_GAP))
    if (di < 0 || di >= nDays) return
    for (let ei = 0; ei < nEntities; ei++) {
      const r = rects[ei][di]
      if (!r) continue
      if (my >= r.y && my <= r.y + r.h) {
        onClickEntity(ei)
        return
      }
    }
  }, [rects, colW, nDays, nEntities, onClickEntity])

  // X-axis labels — show every 5 days
  const xLabels = DAYS.map((label, di) => {
    if (di % 5 !== 0 && di !== nDays - 1) return null
    const x = di * (colW + DAY_GAP) + colW / 2
    return { x, label }
  }).filter(Boolean)

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeaveChart}
      onClick={handleClick}
    >
      <svg
        width={width}
        height={height}
        style={{ display: 'block', cursor: onClickEntity ? 'pointer' : 'default' }}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Background */}
          <rect x={0} y={0} width={chartW} height={chartH} fill="#0f0f13" rx={4} />

          {/* Day column backgrounds — subtle alternation */}
          {DAYS.map((_, di) => {
            const x = di * (colW + DAY_GAP)
            const isHighlighted = simulateTooltip && di === HIGHLIGHT_DAY
            return (
              <rect
                key={`bg-${di}`}
                x={x}
                y={0}
                width={colW}
                height={chartH}
                fill={isHighlighted ? 'rgba(61,130,196,0.08)' : 'transparent'}
              />
            )
          })}

          {/* Entity segments */}
          {rects.map((entityRects, ei) =>
            entityRects.map((r, di) => {
              if (!r) return null
              const isActiveTooltipDay = activeTooltip &&
                activeTooltip.dayIndex === di &&
                activeTooltip.entityIndex === ei
              const isDemoHighlight = simulateTooltip &&
                di === HIGHLIGHT_DAY &&
                ei === 0

              let opacity = 1
              if (
                highlightEntityIdx !== null &&
                highlightEntityIdx !== undefined &&
                highlightEntityIdx !== ei
              ) {
                opacity = 0.35
              }

              return (
                <rect
                  key={`${ei}-${di}`}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={STANCE_COLORS[r.stance]}
                  opacity={opacity}
                  stroke={isDemoHighlight || isActiveTooltipDay ? '#fff' : 'none'}
                  strokeWidth={isDemoHighlight || isActiveTooltipDay ? 1 : 0}
                  rx={1}
                />
              )
            })
          )}

          {/* Horizontal entity separators — dark lines across full width */}
          {Array.from({ length: nEntities - 1 }, (_, ei) => {
            // y position = bottom of entity ei on day 0 + gap/2
            const r = rects[ei] && rects[ei][0]
            if (!r) return null
            const y = r.y + r.h + ENTITY_GAP / 2
            return (
              <line
                key={`sep-${ei}`}
                x1={0}
                y1={y}
                x2={chartW}
                y2={y}
                stroke="#0f0f13"
                strokeWidth={ENTITY_GAP}
              />
            )
          })}

          {/* Vertical day gap lines */}
          {DAYS.map((_, di) => {
            if (di === 0) return null
            const x = di * (colW + DAY_GAP) - DAY_GAP
            return (
              <rect
                key={`vgap-${di}`}
                x={x}
                y={0}
                width={DAY_GAP}
                height={chartH}
                fill="#0f0f13"
              />
            )
          })}

          {/* X-axis baseline */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#2d2d3d" strokeWidth={1} />

          {/* X-axis labels */}
          {xLabels.map(({ x, label }) => (
            <text
              key={label}
              x={x}
              y={chartH + 16}
              textAnchor="middle"
              fill="#505068"
              fontSize={10}
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {label}
            </text>
          ))}

          {/* Hover day highlight line */}
          {activeTooltip && (() => {
            const x = activeTooltip.dayIndex * (colW + DAY_GAP) + colW / 2
            return (
              <line
                x1={x} y1={0} x2={x} y2={chartH}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            )
          })()}

          {/* Demo tooltip day marker */}
          {simulateTooltip && (() => {
            const x = HIGHLIGHT_DAY * (colW + DAY_GAP) + colW / 2
            return (
              <>
                <line
                  x1={x} y1={0} x2={x} y2={chartH}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              </>
            )
          })()}
        </g>
      </svg>
    </div>
  )
}
