import { getTopicColor, getStanceLabel, DAYS } from '../../data/mockData'

export default function TooltipPopup({ tooltip, sortedData, mousePos, isDemoMode }) {
  if (!tooltip) return null

  const { dayIndex: d, topicSortedIdx: ti } = tooltip
  const topic = sortedData[ti]
  if (!topic) return null

  const day    = topic.days[d]
  if (!day) return null

  const { support, neutral, oppose, total } = day
  const label  = getStanceLabel(support, neutral, oppose, total)
  const color  = getTopicColor(topic.baseHue, support, neutral, oppose, total)
  const dayStr = DAYS[d]

  // Position: float near cursor, flip left/right if near edge
  let left, transform
  if (mousePos) {
    const offX = mousePos.clientX > window.innerWidth - 280 ? -240 : 16
    left = mousePos.clientX + offX
    transform = 'translateY(-50%)'
  }
  const top = mousePos ? mousePos.clientY : '50%'

  const barMax = Math.max(support, neutral, oppose, 1)

  return (
    <div style={{
      position: 'fixed',
      left,
      top,
      transform: mousePos ? transform : 'translate(-50%,-50%)',
      backgroundColor: '#1c1c2c',
      border: '1px solid #38385a',
      borderRadius: '8px',
      padding: '14px',
      minWidth: '220px',
      maxWidth: '260px',
      zIndex: 2000,
      boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
      pointerEvents: 'none',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#505070', fontWeight: '500', marginBottom: '2px' }}>
            {dayStr}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#e0e0f0' }}>
            {topic.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#505070', marginBottom: '2px' }}>Volume</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#e0e0f0' }}>{total}</div>
        </div>
      </div>

      {/* Stance label chip */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 9px',
        borderRadius: '5px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '9px', height: '9px', borderRadius: '2px',
          backgroundColor: color, flexShrink: 0,
        }} />
        <span style={{ fontSize: '11px', fontWeight: '600', color }}>
          {label}
        </span>
      </div>

      {/* S/N/O breakdown */}
      <div style={{ fontSize: '10px', color: '#404060', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Stance Breakdown
      </div>

      {[
        { key: 'Support', val: support, color: getTopicColor(topic.baseHue, 0.8, 0.1, 0.1, 1) },
        { key: 'Neutral', val: neutral, color: '#4a4a62' },
        { key: 'Oppose',  val: oppose,  color: getTopicColor(topic.baseHue, 0.1, 0.1, 0.8, 1) },
      ].map(({ key, val, color: c }) => (
        <div key={key} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', color: '#7070a0' }}>{key}</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: c }}>{val}</span>
          </div>
          <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#252535' }}>
            <div style={{
              height: '100%',
              width: `${(val / barMax) * 100}%`,
              backgroundColor: c,
              borderRadius: '2px',
              transition: 'width 0.15s',
            }} />
          </div>
        </div>
      ))}

      {/* Demo-mode attribute breakdown */}
      {isDemoMode && (
        <>
          <div style={{ borderTop: '1px solid #2a2a3a', margin: '10px 0 8px' }} />
          <div style={{ fontSize: '10px', color: '#404060', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Key Attributes
          </div>
          {[
            { name: 'Durability',      volume: 13, stance: 'Oppose'  },
            { name: 'Price / Tariffs', volume:  8, stance: 'Oppose'  },
            { name: 'Comfort',         volume:  2, stance: 'Support' },
          ].map(({ name, volume, stance }) => (
            <div key={name} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '5px',
            }}>
              <span style={{ fontSize: '11px', color: '#7070a0' }}>{name}</span>
              <span style={{
                fontSize: '10px', fontWeight: '600',
                color: stance === 'Oppose' ? '#c04040' : stance === 'Support' ? '#4a8fd4' : '#7070a0',
              }}>
                {volume} · {stance}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
