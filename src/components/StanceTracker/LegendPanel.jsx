import { getTopicColor } from '../../data/mockData'

// Show a small swatch of a topic at mid-stance (neutral reference)
function topicSwatch(baseHue) {
  return getTopicColor(baseHue, 0.35, 0.3, 0.35, 1) // lean≈0, mid-conf
}

// Build a mini encoding demo strip for one hue
function encodingStops(baseHue) {
  return [
    { label: 'Support',  color: getTopicColor(baseHue,  0.8, 0.1, 0.1, 1) },
    { label: 'Lean',     color: getTopicColor(baseHue,  0.5, 0.2, 0.3, 1) },
    { label: 'Mixed',    color: getTopicColor(baseHue,  0.3, 0.6, 0.1, 1) },
    { label: 'Lean',     color: getTopicColor(baseHue,  0.1, 0.2, 0.7, 1) },
    { label: 'Oppose',   color: getTopicColor(baseHue,  0.0, 0.1, 0.9, 1) },
  ]
}

const DEMO_HUE = 210

const s = {
  panel: {
    width: '210px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#181824',
    borderLeft: '1px solid #2d2d3d',
    overflow: 'hidden',
  },
  section: {
    padding: '14px 16px',
    borderBottom: '1px solid #2d2d3d',
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#505068',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  encRow: {
    display: 'flex',
    gap: '2px',
    height: '20px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  encCell: (color) => ({
    flex: 1,
    backgroundColor: color,
  }),
  encLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#404058',
    fontWeight: '500',
    marginBottom: '10px',
  },
  hint: {
    fontSize: '10px',
    color: '#404058',
    lineHeight: '1.5',
    marginTop: '4px',
  },
  hintLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '3px',
  },
  hintDot: (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    flexShrink: 0,
    backgroundColor: color,
  }),
  scrollList: {
    flex: 1,
    overflowY: 'auto',
    padding: '6px 0',
  },
  topicRow: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    cursor: 'pointer',
    backgroundColor: active ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderLeft: active ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
    transition: 'background-color 0.12s',
  }),
  swatch: (color) => ({
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    backgroundColor: color,
    flexShrink: 0,
  }),
  topicName: (active) => ({
    flex: 1,
    fontSize: '11px',
    fontWeight: active ? '600' : '400',
    color: active ? '#d0d0e8' : '#7070a0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  vol: {
    fontSize: '10px',
    color: '#404058',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
}

const stops = encodingStops(DEMO_HUE)

export default function LegendPanel({ sortedData, activeIdx, onHoverTopic, isDrilldown }) {
  return (
    <div style={s.panel}>
      {/* Encoding guide */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Color Encoding</div>

        <div style={s.encRow}>
          {stops.map((st, i) => (
            <div key={i} style={s.encCell(st.color)} />
          ))}
        </div>
        <div style={s.encLabels}>
          <span>Support</span>
          <span>Mixed</span>
          <span>Oppose</span>
        </div>

        <div>
          <div style={s.hintLine}>
            <div style={s.hintDot('#6890d0')} />
            <span style={s.hint}>Lighter = more supportive</span>
          </div>
          <div style={s.hintLine}>
            <div style={s.hintDot('#2a3050')} />
            <span style={s.hint}>Darker = more opposed</span>
          </div>
          <div style={s.hintLine}>
            <div style={s.hintDot('#4a4a58')} />
            <span style={s.hint}>Washed out = mixed / neutral</span>
          </div>
        </div>
      </div>

      {/* Topic list */}
      <div style={{ ...s.section, padding: '10px 0 0', borderBottom: 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ ...s.sectionLabel, padding: '0 16px 8px' }}>
          {isDrilldown ? 'Attributes' : 'Topics by Volume'}
        </div>
        <div style={s.scrollList}>
          {sortedData.map((topic, i) => (
            <div
              key={topic.id}
              style={s.topicRow(activeIdx === i)}
              onMouseEnter={() => onHoverTopic?.(i)}
              onMouseLeave={() => onHoverTopic?.(null)}
            >
              <div style={s.swatch(topicSwatch(topic.baseHue))} />
              <span style={s.topicName(activeIdx === i)}>{topic.name}</span>
              <span style={s.vol}>{topic.totalVolume.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
