import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { DAYS, getStanceColor } from '../../data/mockData'

// Chart margins — left reserved for entity name labels
const L_MAR = 128
const R_MAR = 12
const T_MAR = 16
const B_MAR = 38

const DAY_GAP = 2     // px gap between consecutive day columns
const ENT_GAP = 2     // px gap between entity segments (creates lane separation)
const MIN_LABEL_H = 5 // minimum avg px height before we hide an entity label

export default function StanceChart({
  sortedData,
  simulateTooltip,
  onHoverCell,
  onLeaveChart,
  highlightIdx,
  activeTooltip,
}) {
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 900, height: 480 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      setDims({ width: Math.max(400, width), height: Math.max(200, height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const { width, height } = dims
  const chartW  = width  - L_MAR - R_MAR
  const chartH  = height - T_MAR - B_MAR
  const nDays   = DAYS.length
  const nTopics = sortedData.length

  // ── Stacking (cumulative volumes per entity per day) ─────────────────────
  const { cumTops, cumBots, maxDayTotal } = useMemo(() => {
    const cumBots = sortedData.map(() => new Float32Array(nDays))
    const cumTops = sortedData.map(() => new Float32Array(nDays))
    let max = 0
    for (let d = 0; d < nDays; d++) {
      let running = 0
      for (let i = 0; i < nTopics; i++) {
        cumBots[i][d] = running
        running += sortedData[i].days[d].total
        cumTops[i][d] = running
      }
      if (running > max) max = running
    }
    return { cumTops, cumBots, maxDayTotal: max || 1 }
  }, [sortedData, nDays, nTopics])

  // ── Scales ────────────────────────────────────────────────────────────────
  const dayW = (chartW - DAY_GAP * (nDays - 1)) / nDays
  const xAt  = (d) => d * (dayW + DAY_GAP)
  const yAt  = (v) => chartH - (v / maxDayTotal) * chartH

  // ── Entity label Y positions (average midpoint of each band) ─────────────
  const labelMeta = sortedData.map((topic, i) => {
    let sumY = 0, sumH = 0
    for (let d = 0; d < nDays; d++) {
      const yTop = yAt(cumTops[i][d])
      const yBot = yAt(cumBots[i][d])
      sumY += (yTop + yBot) / 2
      sumH += (yBot - yTop)
    }
    return {
      y:    sumY / nDays,
      avgH: sumH / nDays,
      name: topic.name,
    }
  })

  // ── Hover detection ──────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !onHoverCell) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const mx   = e.clientX - rect.left - L_MAR
    const my   = e.clientY - rect.top  - T_MAR

    const d = Math.floor(mx / (dayW + DAY_GAP))
    if (d < 0 || d >= nDays) { onLeaveChart?.(); return }

    // Scan from top of stack downward
    for (let i = nTopics - 1; i >= 0; i--) {
      if (my >= yAt(cumTops[i][d]) && my <= yAt(cumBots[i][d])) {
        onHoverCell(d, i, { clientX: e.clientX, clientY: e.clientY })
        return
      }
    }
    onLeaveChart?.()
  }, [dayW, nDays, nTopics, cumTops, cumBots, yAt, onHoverCell, onLeaveChart])

  // Demo targets Jan 22 (day 21), Merrell entity
  const DEMO_DAY = 21
  const demoTopicI = useMemo(
    () => sortedData.findIndex(t => t.name === 'Merrell'),
    [sortedData]
  )

  const hoverDay = simulateTooltip
    ? DEMO_DAY
    : (activeTooltip?.dayIndex ?? null)

  // X-axis labels every 5 days
  const xLabels = DAYS.reduce((acc, lbl, d) => {
    if (d % 5 === 0 || d === nDays - 1) acc.push({ d, lbl })
    return acc
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeaveChart}
    >
      <svg width={width} height={height} style={{ display: 'block', cursor: 'crosshair' }}>

        {/* ── Chart area ─────────────────────────────────────────────────── */}
        <g transform={`translate(${L_MAR},${T_MAR})`}>

          {/* Background */}
          <rect x={0} y={0} width={chartW} height={chartH} fill="#0f0f13" />

          {/* Subtle day column backgrounds — every other day faintly highlighted */}
          {DAYS.map((_, d) => d % 2 === 0 ? (
            <rect key={d} x={xAt(d)} y={0} width={dayW} height={chartH}
              fill="rgba(255,255,255,0.012)" />
          ) : null)}

          {/* Entity segments — rendered bottom to top */}
          {sortedData.map((topic, i) => {
            const dimmed  = highlightIdx != null && highlightIdx !== i
            const opacity = dimmed ? 0.22 : 1
            return DAYS.map((_, d) => {
              const yTop = yAt(cumTops[i][d])
              const yBot = yAt(cumBots[i][d])
              const segH = yBot - yTop - ENT_GAP
              if (segH < 0.5) return null
              const day   = topic.days[d]
              const color = getStanceColor(day.support, day.neutral, day.oppose, day.total)
              return (
                <rect
                  key={`${i}-${d}`}
                  x={xAt(d)}
                  y={yTop}
                  width={dayW}
                  height={segH}
                  fill={color}
                  opacity={opacity}
                  style={{ transition: 'opacity 0.12s' }}
                />
              )
            })
          })}

          {/* Hovered day column highlight */}
          {hoverDay !== null && (
            <rect
              x={xAt(hoverDay)} y={0} width={dayW} height={chartH}
              fill="rgba(255,255,255,0.07)"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}

          {/* Active cell highlight (live hover or demo) */}
          {activeTooltip && (() => {
            const { dayIndex: d, topicSortedIdx: i } = activeTooltip
            if (i == null || i < 0) return null
            const yTop = yAt(cumTops[i][d])
            const yBot = yAt(cumBots[i][d])
            const h    = Math.max(1, yBot - yTop - ENT_GAP)
            return (
              <rect
                x={xAt(d)} y={yTop} width={dayW} height={h}
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={1.5}
                rx={1}
                pointerEvents="none"
              />
            )
          })()}

          {/* X-axis baseline */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH}
            stroke="#2d2d3d" strokeWidth={1} />

          {/* X-axis day labels */}
          {xLabels.map(({ d, lbl }) => (
            <text
              key={lbl}
              x={xAt(d) + dayW / 2}
              y={chartH + 17}
              textAnchor="middle"
              fill="#505068"
              fontSize={10}
              fontFamily="Inter, sans-serif"
            >
              {lbl}
            </text>
          ))}

        </g>

        {/* ── Entity labels (left margin) ────────────────────────────────── */}
        <g transform={`translate(0,${T_MAR})`}>
          {labelMeta.map((lm, i) => {
            if (lm.avgH < MIN_LABEL_H) return null
            const isActive = highlightIdx === i
            const isDemoFocus = simulateTooltip && i === demoTopicI
            return (
              <text
                key={sortedData[i].id}
                x={L_MAR - 8}
                y={lm.y + 3.5}
                textAnchor="end"
                fill={isActive || isDemoFocus ? '#c8c8e0' : '#3e3e58'}
                fontSize={9.5}
                fontFamily="Inter, sans-serif"
                fontWeight={isActive || isDemoFocus ? '600' : '400'}
                style={{ transition: 'fill 0.12s' }}
              >
                {lm.name}
              </text>
            )
          })}

          {/* Separator reference lines — drawn at average entity boundaries */}
          {labelMeta.map((lm, i) => {
            if (i === 0 || lm.avgH < MIN_LABEL_H) return null
            // Average top of this entity's band
            let sumTop = 0
            for (let d = 0; d < nDays; d++) {
              sumTop += yAt(cumTops[i][d])
            }
            const avgTop = sumTop / nDays
            return (
              <line
                key={`sep-${i}`}
                x1={L_MAR}
                y1={avgTop}
                x2={L_MAR + chartW}
                y2={avgTop}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
                strokeDasharray="2,4"
              />
            )
          })}
        </g>

      </svg>
    </div>
  )
}
