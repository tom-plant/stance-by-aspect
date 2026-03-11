import { useState, useCallback, useMemo } from 'react'
import StanceChart from './StanceChart'
import LegendPanel from './LegendPanel'
import TooltipPopup from './TooltipPopup'
import { ENTITY_DATA, MERRELL_ATTR_DATA } from '../../data/mockData'

// ── UI states ──────────────────────────────────────────────────────────────
// 'macro'     State 1 — all topics, live hover
// 'tooltip'   State 2 — macro view + simulated tooltip on Jan 22 / Merrell
// 'drilldown' State 3 — Merrell attribute breakdown

const DEMO_DAY = 21  // Jan 22

const st = {
  wrapper: {
    display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', backgroundColor: '#0f0f13',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', borderBottom: '1px solid #2d2d3d', flexShrink: 0,
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  toolbarTitle: { fontSize: '13px', fontWeight: '600', color: '#e0e0f0' },
  divider: { width: '1px', height: '16px', backgroundColor: '#2d2d3d' },
  meta: { fontSize: '11px', color: '#404058' },
  badge: {
    fontSize: '10px', fontWeight: '600', color: '#9090b0',
    backgroundColor: '#222234', padding: '3px 8px', borderRadius: '4px',
    border: '1px solid #2d2d3d',
  },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '6px' },
  stateLabel: {
    fontSize: '10px', color: '#404058', fontWeight: '500',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: '2px',
  },
  stateBtn: (active) => ({
    padding: '5px 12px', fontSize: '11px', fontWeight: active ? '600' : '400',
    color: active ? '#e0e0f0' : '#505070',
    backgroundColor: active ? '#222240' : 'transparent',
    border: `1px solid ${active ? '#363658' : '#252535'}`,
    borderRadius: '5px', cursor: 'pointer', transition: 'all 0.12s',
    whiteSpace: 'nowrap',
  }),
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  chartArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  chartHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '9px 16px', flexShrink: 0,
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px',
    fontSize: '11px', fontWeight: '500', color: '#7070a0',
    backgroundColor: '#1c1c2c', border: '1px solid #2d2d3d',
    borderRadius: '5px', cursor: 'pointer',
  },
  drillTitle: { display: 'flex', alignItems: 'center', gap: '8px' },
  drillName: { fontSize: '13px', fontWeight: '600', color: '#e0e0f0' },
  drillSub: { fontSize: '11px', color: '#505068' },
  chartContainer: { flex: 1, padding: '0 12px 12px', overflow: 'hidden', position: 'relative' },
  hintText: { fontSize: '11px', color: '#353550' },
  timeRange: { fontSize: '10px', color: '#353550', fontWeight: '500' },
}

export default function StanceTracker() {
  const [uiState, setUiState] = useState('macro')
  const [hoverTooltip, setHoverTooltip] = useState(null)   // { dayIndex, topicSortedIdx }
  const [mousePos, setMousePos] = useState(null)
  const [highlightIdx, setHighlightIdx] = useState(null)    // sorted index

  const isDrilldown = uiState === 'drilldown'
  const isTooltipDemo = uiState === 'tooltip'

  // Sort topics by total volume descending (highest at bottom of stack)
  const rawData = isDrilldown ? MERRELL_ATTR_DATA : ENTITY_DATA
  const sortedData = useMemo(
    () => [...rawData].sort((a, b) => b.totalVolume - a.totalVolume),
    [rawData]
  )

  const merrellSortedIdx = useMemo(
    () => sortedData.findIndex((t) => t.name === 'Merrell'),
    [sortedData]
  )

  // ── Live hover (State 1 only) ──────────────────────────────────────────
  const handleHoverCell = useCallback((dayIndex, topicSortedIdx, pos) => {
    if (isTooltipDemo || isDrilldown) return
    setHoverTooltip({ dayIndex, topicSortedIdx })
    setMousePos(pos)
    setHighlightIdx(topicSortedIdx)
  }, [isTooltipDemo, isDrilldown])

  const handleLeaveChart = useCallback(() => {
    if (isTooltipDemo || isDrilldown) return
    setHoverTooltip(null)
    setMousePos(null)
    setHighlightIdx(null)
  }, [isTooltipDemo, isDrilldown])

  // ── Legend hover ──────────────────────────────────────────────────────
  const handleHoverTopic = useCallback((idx) => {
    if (isDrilldown) return
    setHighlightIdx(idx)
  }, [isDrilldown])

  // ── State switcher ────────────────────────────────────────────────────
  const switchState = useCallback((next) => {
    setUiState(next)
    setHoverTooltip(null)
    setMousePos(null)
    setHighlightIdx(null)
  }, [])

  // ── Active tooltip ────────────────────────────────────────────────────
  const activeTooltip = isTooltipDemo
    ? { dayIndex: DEMO_DAY, topicSortedIdx: merrellSortedIdx }
    : hoverTooltip

  return (
    <div style={st.wrapper}>
      {/* Toolbar */}
      <div style={st.toolbar}>
        <div style={st.toolbarLeft}>
          <span style={st.toolbarTitle}>Stance Tracker</span>
          <div style={st.divider} />
          <span style={st.meta}>Jan 1 – Jan 30, 2025</span>
          <span style={st.badge}>
            {isDrilldown ? 'Merrell · Attributes' : `${sortedData.length} Topics`}
          </span>
        </div>
        <div style={st.toolbarRight}>
          <span style={st.stateLabel}>State</span>
          {['macro', 'tooltip', 'drilldown'].map((s, i) => (
            <button key={s} style={st.stateBtn(uiState === s)} onClick={() => switchState(s)}>
              {i + 1} · {s === 'macro' ? 'Macro View' : s === 'tooltip' ? 'Hover Demo' : 'Drill-Down'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={st.body}>
        <div style={st.chartArea}>
          {/* Chart header */}
          <div style={st.chartHeader}>
            {isDrilldown ? (
              <div style={st.drillTitle}>
                <button style={st.backBtn} onClick={() => switchState('macro')}>← Back</button>
                <span style={st.drillName}>Merrell</span>
                <span style={st.drillSub}>Attribute breakdown</span>
              </div>
            ) : (
              <span style={st.hintText}>
                {isTooltipDemo
                  ? 'Simulated hover · Jan 22 · Merrell'
                  : 'Hover over a region to inspect stance'}
              </span>
            )}
            <span style={st.timeRange}>30-day window</span>
          </div>

          {/* Chart */}
          <div style={st.chartContainer}>
            <StanceChart
              sortedData={sortedData}
              simulateTooltip={isTooltipDemo}
              onHoverCell={handleHoverCell}
              onLeaveChart={handleLeaveChart}
              highlightIdx={
                isTooltipDemo ? merrellSortedIdx :
                isDrilldown   ? null             :
                highlightIdx
              }
              activeTooltip={
                isTooltipDemo || hoverTooltip
                  ? activeTooltip
                  : null
              }
            />
          </div>
        </div>

        {/* Legend */}
        <LegendPanel
          sortedData={sortedData}
          activeIdx={
            isTooltipDemo ? merrellSortedIdx :
            isDrilldown   ? null             :
            highlightIdx
          }
          onHoverTopic={isDrilldown ? null : handleHoverTopic}
          isDrilldown={isDrilldown}
        />
      </div>

      {/* Tooltip */}
      <TooltipPopup
        tooltip={activeTooltip}
        sortedData={sortedData}
        mousePos={isTooltipDemo ? null : mousePos}
        isDemoMode={isTooltipDemo}
      />
    </div>
  )
}
