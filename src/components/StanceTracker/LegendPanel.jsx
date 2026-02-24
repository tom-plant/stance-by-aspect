import { STANCE_COLORS, STANCE_LABELS } from '../../data/mockData'

const styles = {
  panel: {
    width: '220px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#181824',
    borderLeft: '1px solid #2d2d3d',
    overflow: 'hidden',
  },
  section: {
    padding: '16px',
    borderBottom: '1px solid #2d2d3d',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#505068',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  stanceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '7px',
  },
  stanceSwatch: (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    backgroundColor: color,
    flexShrink: 0,
  }),
  stanceLabel: {
    fontSize: '11px',
    color: '#9090b0',
    fontWeight: '400',
  },
  gradientBar: {
    height: '8px',
    borderRadius: '4px',
    background: `linear-gradient(to right, ${STANCE_COLORS[1]}, ${STANCE_COLORS[2]}, ${STANCE_COLORS[3]}, ${STANCE_COLORS[4]}, ${STANCE_COLORS[5]}, ${STANCE_COLORS[6]})`,
    marginBottom: '6px',
  },
  gradientLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#505068',
    fontWeight: '500',
    marginBottom: '14px',
  },
  entityList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  entityRow: (active) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 16px',
    cursor: 'pointer',
    backgroundColor: active ? 'rgba(61,130,196,0.12)' : 'transparent',
    borderLeft: active ? '2px solid #3d82c4' : '2px solid transparent',
    transition: 'background-color 0.12s',
  }),
  entityName: (active) => ({
    fontSize: '11px',
    fontWeight: active ? '600' : '400',
    color: active ? '#e0e0f0' : '#9090b0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '140px',
  }),
  entityVol: {
    fontSize: '10px',
    color: '#505068',
    fontWeight: '500',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  drillLabel: {
    fontSize: '10px',
    color: '#505068',
    padding: '8px 16px 4px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
}

const STANCE_ORDER = [1, 2, 3, 4, 5, 6]

export default function LegendPanel({ data, activeEntityIdx, onClickEntity, isDrilldown }) {
  return (
    <div style={styles.panel}>
      {/* Stance Key */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Stance Key</div>
        <div style={styles.gradientBar} />
        <div style={styles.gradientLabels}>
          <span>Support</span>
          <span>Neutral</span>
          <span>Oppose</span>
        </div>
        {STANCE_ORDER.map((stanceVal) => (
          <div key={stanceVal} style={styles.stanceRow}>
            <div style={styles.stanceSwatch(STANCE_COLORS[stanceVal])} />
            <span style={styles.stanceLabel}>{STANCE_LABELS[stanceVal]}</span>
          </div>
        ))}
      </div>

      {/* Entity / Attribute List */}
      <div style={{ ...styles.section, padding: '12px 0 0', borderBottom: 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ ...styles.sectionLabel, padding: '0 16px 8px' }}>
          {isDrilldown ? 'Attributes' : 'Target Entities'}
        </div>
        <div style={styles.entityList}>
          {data.map((item, idx) => (
            <div
              key={item.name}
              style={styles.entityRow(activeEntityIdx === idx)}
              onClick={() => onClickEntity && onClickEntity(idx)}
            >
              <span style={styles.entityName(activeEntityIdx === idx)}>{item.name}</span>
              <span style={styles.entityVol}>{item.totalVolume.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
