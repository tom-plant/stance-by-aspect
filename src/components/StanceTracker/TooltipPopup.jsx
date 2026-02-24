import { STANCE_COLORS, STANCE_LABELS } from '../../data/mockData'

export default function TooltipPopup({ tooltip, data, position, isDemoMode }) {
  if (!tooltip) return null

  const { dayIndex, entityIndex } = tooltip
  const entity = data[entityIndex]
  if (!entity) return null

  const day = entity.days[dayIndex]
  if (!day) return null

  const dayLabel = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][
    Math.floor(dayIndex / 30 * 1) || 0
  ]

  // Day label from DAYS array
  const DAYS = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2025, 0, i + 1)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const tooltipStyle = {
    position: 'fixed',
    left: position ? position.x + 12 : '50%',
    top: position ? position.y - 10 : '50%',
    transform: position ? 'translateY(-100%)' : 'translate(-50%,-50%)',
    backgroundColor: '#1e1e30',
    border: '1px solid #3a3a52',
    borderRadius: '8px',
    padding: '14px 16px',
    minWidth: '210px',
    maxWidth: '260px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    pointerEvents: 'none',
  }

  const stanceColor = STANCE_COLORS[day.stance]

  return (
    <div style={tooltipStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#606080', fontWeight: '500', marginBottom: '2px' }}>
            {DAYS[dayIndex]}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#e0e0f0' }}>
            {entity.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#606080', marginBottom: '2px' }}>Volume</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#e0e0f0' }}>{day.volume}</div>
        </div>
      </div>

      {/* Dominant stance */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: '6px',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '2px',
          backgroundColor: stanceColor, flexShrink: 0,
        }} />
        <span style={{ fontSize: '11px', color: '#b0b0c8', fontWeight: '500' }}>
          Dominant Stance:
        </span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: stanceColor }}>
          {STANCE_LABELS[day.stance]}
        </span>
      </div>

      {/* Driving attributes — shown in demo mode */}
      {isDemoMode && (
        <>
          <div style={{ fontSize: '10px', color: '#505068', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Key Attributes
          </div>
          {[
            { name: 'Durability',      volume: 14, stance: 6, stanceLabel: 'Oppose' },
            { name: 'Price / Tariffs', volume: 8,  stance: 6, stanceLabel: 'Oppose' },
            { name: 'Comfort',         volume: 2,  stance: 3, stanceLabel: 'Neutral' },
          ].map((attr) => (
            <div key={attr.name} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '11px', color: '#9090b0' }}>{attr.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: STANCE_COLORS[attr.stance],
                }}>
                  {attr.volume}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: STANCE_COLORS[attr.stance],
                  opacity: 0.8,
                }}>
                  {attr.stanceLabel}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
