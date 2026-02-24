import { useState, useCallback } from 'react'
import StanceChart from './StanceChart'
import LegendPanel from './LegendPanel'
import TooltipPopup from './TooltipPopup'
import { ENTITY_DATA, MERRELL_ATTR_DATA } from '../../data/mockData'

// UI states for the presentation state machine
// 'macro'     → State 1: full 15-entity view
// 'tooltip'   → State 2: macro view + simulated hover tooltip on Jan 22 / Merrell
// 'drilldown' → State 3: Merrell attribute breakdown

const MERRELL_IDX = 0 // index in ENTITY_DATA

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0f0f13',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid #2d2d3d',
    flexShrink: 0,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  toolbarTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e0e0f0',
  },
  toolbarMeta: {
    fontSize: '11px',
    color: '#505068',
    fontWeight: '400',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9090b0',
    backgroundColor: '#252535',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #2d2d3d',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stateBtn: (active) => ({
    padding: '6px 14px',
    fontSize: '11px',
    fontWeight: active ? '600' : '400',
    color: active ? '#e0e0f0' : '#6060a0',
    backgroundColor: active ? '#252540' : 'transparent',
    border: `1px solid ${active ? '#3a3a58' : '#2d2d3d'}`,
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),
  stateDivider: {
    width: '1px',
    height: '18px',
    backgroundColor: '#2d2d3d',
  },
  stateLabel: {
    fontSize: '10px',
    color: '#404058',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  chartArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    flexShrink: 0,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#9090b0',
    backgroundColor: '#1e1e2e',
    border: '1px solid #2d2d3d',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  drillTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  drillTitleText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e0e0f0',
  },
  drillSubtext: {
    fontSize: '11px',
    color: '#505068',
  },
  chartContainer: {
    flex: 1,
    padding: '0 16px 16px',
    overflow: 'hidden',
    position: 'relative',
  },
  timeRange: {
    fontSize: '11px',
    color: '#404058',
    fontWeight: '500',
  },
  entityLabelTrack: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingTop: '24px',
    paddingBottom: '40px',
    width: '130px',
    flexShrink: 0,
    paddingLeft: '16px',
    overflow: 'hidden',
  },
  entityLabel: (highlighted) => ({
    fontSize: '9.5px',
    fontWeight: highlighted ? '600' : '400',
    color: highlighted ? '#c0c0e0' : '#404058',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1,
    transition: 'color 0.15s',
  }),
  chartRow: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
}

const DEMO_TOOLTIP = { dayIndex: 21, entityIndex: MERRELL_IDX }

export default function StanceTracker() {
  const [uiState, setUiState] = useState('macro') // 'macro' | 'tooltip' | 'drilldown'
  const [hoveredTooltip, setHoveredTooltip] = useState(null)
  const [tooltipPos, setTooltipPos] = useState(null)
  const [highlightEntityIdx, setHighlightEntityIdx] = useState(null)

  const isDrilldown = uiState === 'drilldown'
  const isTooltipState = uiState === 'tooltip'

  const chartData = isDrilldown ? MERRELL_ATTR_DATA : ENTITY_DATA

  const handleHoverDay = useCallback((dayIndex, entityIndex, pos) => {
    if (isTooltipState || isDrilldown) return // no live hover in demo states
    setHoveredTooltip({ dayIndex, entityIndex })
    setTooltipPos(pos)
    setHighlightEntityIdx(entityIndex)
  }, [isTooltipState, isDrilldown])

  const handleLeaveChart = useCallback(() => {
    if (isTooltipState || isDrilldown) return
    setHoveredTooltip(null)
    setTooltipPos(null)
    setHighlightEntityIdx(null)
  }, [isTooltipState, isDrilldown])

  const handleClickEntity = useCallback((entityIdx) => {
    if (isDrilldown) return
    setUiState('drilldown')
    setHoveredTooltip(null)
  }, [isDrilldown])

  const handleLegendClickEntity = useCallback((entityIdx) => {
    if (!isDrilldown && entityIdx === MERRELL_IDX) {
      setUiState('drilldown')
    } else if (!isDrilldown) {
      setUiState('drilldown') // For prototype, all clicks drill into Merrell
    }
  }, [isDrilldown])

  // Active tooltip for rendering
  const activeTooltip = isTooltipState ? DEMO_TOOLTIP : hoveredTooltip
  const activeTooltipPos = isTooltipState ? null : tooltipPos
  const isDemoTooltip = isTooltipState

  return (
    <div style={styles.wrapper}>
      {/* Toolbar / State switcher */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <span style={styles.toolbarTitle}>Stance Tracker</span>
          <div style={styles.stateDivider} />
          <span style={styles.toolbarMeta}>Jan 1 – Jan 30, 2025</span>
          <span style={styles.badge}>
            {isDrilldown ? 'Merrell · Drill-Down' : '15 Entities'}
          </span>
        </div>
        <div style={styles.toolbarRight}>
          <span style={styles.stateLabel}>View</span>
          <button
            style={styles.stateBtn(uiState === 'macro')}
            onClick={() => { setUiState('macro'); setHoveredTooltip(null) }}
          >
            State 1 · Macro
          </button>
          <button
            style={styles.stateBtn(uiState === 'tooltip')}
            onClick={() => { setUiState('tooltip'); setHoveredTooltip(null) }}
          >
            State 2 · Tooltip
          </button>
          <button
            style={styles.stateBtn(uiState === 'drilldown')}
            onClick={() => { setUiState('drilldown'); setHoveredTooltip(null) }}
          >
            State 3 · Drill-Down
          </button>
        </div>
      </div>

      {/* Main body */}
      <div style={styles.body}>
        {/* Left: Entity label track + Chart */}
        <div style={styles.chartArea}>
          {/* Chart header row */}
          <div style={styles.chartHeader}>
            {isDrilldown ? (
              <div style={styles.drillTitle}>
                <button
                  style={styles.backButton}
                  onClick={() => setUiState('macro')}
                >
                  ← Back to All Entities
                </button>
                <div>
                  <span style={styles.drillTitleText}>Merrell</span>
                  <span style={{ ...styles.drillSubtext, marginLeft: '8px' }}>
                    Attribute Breakdown
                  </span>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#404058', fontWeight: '500' }}>
                {isTooltipState
                  ? 'Hover simulation — Jan 22 · Merrell'
                  : 'Click any entity to drill down'}
              </span>
            )}
            <span style={styles.timeRange}>30-day window</span>
          </div>

          {/* Chart row: entity labels + chart */}
          <div style={styles.chartRow}>
            {/* Entity name labels (left of chart) */}
            <div style={styles.entityLabelTrack}>
              {chartData.map((item, idx) => (
                <span
                  key={item.name}
                  style={styles.entityLabel(
                    highlightEntityIdx === idx ||
                    (isTooltipState && idx === MERRELL_IDX)
                  )}
                >
                  {item.name}
                </span>
              ))}
            </div>

            {/* Chart */}
            <div style={styles.chartContainer}>
              <StanceChart
                data={chartData}
                viewMode={isDrilldown ? 'drilldown' : 'macro'}
                simulateTooltip={isTooltipState}
                onHoverDay={handleHoverDay}
                onLeaveChart={handleLeaveChart}
                onClickEntity={isDrilldown ? null : handleClickEntity}
                highlightEntityIdx={
                  isTooltipState ? MERRELL_IDX : highlightEntityIdx
                }
                activeTooltip={activeTooltip}
              />
            </div>
          </div>
        </div>

        {/* Right: Legend panel */}
        <LegendPanel
          data={chartData}
          activeEntityIdx={
            isTooltipState ? MERRELL_IDX :
            isDrilldown ? null :
            highlightEntityIdx
          }
          onClickEntity={isDrilldown ? null : handleLegendClickEntity}
          isDrilldown={isDrilldown}
        />
      </div>

      {/* Tooltip popup */}
      <TooltipPopup
        tooltip={activeTooltip}
        data={chartData}
        position={activeTooltipPos}
        isDemoMode={isDemoTooltip}
      />
    </div>
  )
}
