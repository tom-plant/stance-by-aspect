import { getStanceColor, getStanceLabel, DAYS } from '../../data/mockData'

export default function TooltipPopup({ tooltip, sortedData, mousePos, isDemoMode }) {
  if (!tooltip) return null
  const { dayIndex: d, topicSortedIdx: ti } = tooltip
  const topic = sortedData?.[ti]
  if (!topic) return null
  const day = topic.days?.[d]
  if (!day) return null

  const { support, neutral, oppose, total } = day
  const label  = getStanceLabel(support, neutral, oppose, total)
  const color  = getStanceColor(support, neutral, oppose, total)
  const dayStr = DAYS[d]
  const barMax = Math.max(support, neutral, oppose, 1)

  // Position: follow cursor when live; centered when demo
  let posStyle
  if (mousePos) {
    const flipLeft = mousePos.clientX > window.innerWidth - 290
    posStyle = {
      position: 'fixed',
      left: flipLeft ? mousePos.clientX - 250 : mousePos.clientX + 14,
      top:  mousePos.clientY - 20,
      transform: 'none',
    }
  } else {
    // Demo mode — anchor near center of viewport
    posStyle = {
      position: 'fixed',
      left: '50%',
      top:  '42%',
      transform: 'translate(-50%, -50%)',
    }
  }

  return (
    <div style={{
      ...posStyle,
      backgroundColor: '#1c1c2e',
      border: '1px solid #38385c',
      borderRadius: '8px',
      padding: '14px',
      minWidth: '225px',
      maxWidth: '265px',
      zIndex: 2000,
      boxShadow: '0 12px 44px rgba(0,0,0,0.75)',
      pointerEvents: 'none',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#505072', fontWeight: '500', marginBottom: '3px' }}>
            {dayStr}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#e0e0f4' }}>
            {topic.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#505072', marginBottom: '3px' }}>Volume</div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#e0e0f4' }}>{total}</div>
        </div>
      </div>

      {/* Stance label chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        padding: '5px 10px', borderRadius: '5px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: '13px',
      }}>
        <div style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color }}>{label}</span>
      </div>

      {/* S / N / O bars */}
      <div style={{ fontSize: '10px', color: '#404062', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Stance Breakdown
      </div>
      {[
        { key: 'Support', val: support, color: getStanceColor(0.85, 0.1, 0.05, 1) },
        { key: 'Neutral', val: neutral, color: '#5a5a72' },
        { key: 'Oppose',  val: oppose,  color: getStanceColor(0.05, 0.1, 0.85, 1) },
      ].map(({ key, val, color: c }) => (
        <div key={key} style={{ marginBottom: '7px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', color: '#6060a0' }}>{key}</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: c }}>{val}</span>
          </div>
          <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#222238' }}>
            <div style={{
              height: '100%',
              width: `${(val / barMax) * 100}%`,
              backgroundColor: c,
              borderRadius: '2px',
              minWidth: val > 0 ? '3px' : 0,
            }} />
          </div>
        </div>
      ))}

      {/* Demo-mode attribute breakdown */}
      {isDemoMode && (
        <>
          <div style={{ borderTop: '1px solid #2a2a3e', margin: '11px 0 9px' }} />
          <div style={{ fontSize: '10px', color: '#404062', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Key Attributes
          </div>
          {[
            { name: 'Durability',      vol: 13, lean: -0.86 },
            { name: 'Price / Tariffs', vol:  8, lean: -0.80 },
            { name: 'Comfort',         vol:  2, lean:  0.85 },
          ].map(({ name, vol, lean }) => {
            const c = lean > 0
              ? getStanceColor(0.85, 0.1, 0.05, 1)
              : getStanceColor(0.05, 0.1, 0.85, 1)
            const lbl = lean > 0 ? 'Support' : 'Oppose'
            return (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6060a0' }}>{name}</span>
                <span style={{ fontSize: '10px', fontWeight: '600', color: c }}>{vol} · {lbl}</span>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
