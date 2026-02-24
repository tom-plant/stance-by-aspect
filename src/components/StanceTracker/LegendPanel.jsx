import { getStanceColor } from '../../data/mockData'

// Build gradient stops for the red-gray-blue scale preview
const SCALE_STOPS = [
  { pos: '0%',   s: 0,  n: 0.1, o: 0.9, t: 1 },  // strong oppose
  { pos: '30%',  s: 0.2, n: 0.3, o: 0.5, t: 1 }, // lean oppose
  { pos: '50%',  s: 0.3, n: 0.6, o: 0.1, t: 1 }, // neutral
  { pos: '70%',  s: 0.5, n: 0.3, o: 0.2, t: 1 }, // lean support
  { pos: '100%', s: 0.9, n: 0.1, o: 0, t: 1 },   // strong support
]

const s = {
  panel: {
    width: '200px',
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
  gradBar: {
    height: '10px',
    borderRadius: '5px',
    marginBottom: '6px',
    overflow: 'hidden',
  },
  gradInner: (stops) => ({
    height: '100%',
    background: `linear-gradient(to right, ${stops.map(st =>
      `${getStanceColor(st.s, st.n, st.o, st.t)} ${st.pos}`
    ).join(', ')})`,
  }),
  gradLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#404060',
    fontWeight: '500',
    marginBottom: '12px',
  },
  hintRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '7px',
    marginBottom: '5px',
  },
  hintSwatch: (s, n, o) => ({
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    flexShrink: 0,
    marginTop: '1px',
    backgroundColor: getStanceColor(s, n, o, 1),
  }),
  hintText: {
    fontSize: '10px',
    color: '#404060',
    lineHeight: '1.4',
  },
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
    backgroundColor: active ? 'rgba(255,255,255,0.04)' : 'transparent',
    borderLeft: active ? '2px solid rgba(255,255,255,0.25)' : '2px solid transparent',
    transition: 'background-color 0.12s',
  }),
  rankNum: {
    fontSize: '9px',
    color: '#303048',
    fontVariantNumeric: 'tabular-nums',
    width: '14px',
    flexShrink: 0,
    textAlign: 'right',
  },
  topicName: (active) => ({
    flex: 1,
    fontSize: '11px',
    fontWeight: active ? '600' : '400',
    color: active ? '#d0d0e8' : '#6060a0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  vol: {
    fontSize: '10px',
    color: '#363656',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
}

export default function LegendPanel({ sortedData, activeIdx, onHoverTopic, isDrilldown }) {
  return (
    <div style={s.panel}>
      {/* Color encoding guide */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Color Scale</div>

        <div style={s.gradBar}>
          <div style={s.gradInner(SCALE_STOPS)} />
        </div>
        <div style={s.gradLabels}>
          <span>Oppose</span>
          <span>Neutral</span>
          <span>Support</span>
        </div>

        <div>
          <div style={s.hintRow}>
            <div style={s.hintSwatch(0.85, 0.1, 0.05)} />
            <span style={s.hintText}>Blue = supportive audience</span>
          </div>
          <div style={s.hintRow}>
            <div style={s.hintSwatch(0.1, 0.8, 0.1)} />
            <span style={s.hintText}>Gray = mixed / neutral signal</span>
          </div>
          <div style={s.hintRow}>
            <div style={s.hintSwatch(0.05, 0.1, 0.85)} />
            <span style={s.hintText}>Red = opposed audience</span>
          </div>
          <div style={s.hintRow}>
            <div style={{ ...s.hintSwatch(0.4, 0.5, 0.1), opacity: 0.5 }} />
            <span style={s.hintText}>Washed out = low confidence / noisy signal</span>
          </div>
        </div>
      </div>

      {/* Topic list */}
      <div style={{
        ...s.section,
        padding: '10px 0 0',
        borderBottom: 'none',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ ...s.sectionLabel, padding: '0 16px 6px' }}>
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
              <span style={s.rankNum}>{i + 1}</span>
              <span style={s.topicName(activeIdx === i)}>{topic.name}</span>
              <span style={s.vol}>{topic.totalVolume.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
