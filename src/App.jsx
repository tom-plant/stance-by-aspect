import { useState } from 'react'
import StanceTracker from './components/StanceTracker'

const TABS = ['Narratives', 'Knowledge Graph', 'Content', 'Accounts', 'Stance Tracker']

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0f0f13',
    color: '#e0e0f0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    backgroundColor: '#181824',
    borderBottom: '1px solid #2d2d3d',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoMark: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #3d82c4 0%, #1a5cb8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#c0c0d8',
    letterSpacing: '0.02em',
  },
  headerIndex: {
    fontSize: '13px',
    color: '#606078',
    fontWeight: '400',
  },
  headerDivider: {
    width: '1px',
    height: '18px',
    backgroundColor: '#2d2d3d',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerMeta: {
    fontSize: '11px',
    color: '#505068',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2ca85a',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#50b878',
    fontWeight: '500',
  },
  navBar: {
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0 24px',
    backgroundColor: '#181824',
    borderBottom: '1px solid #2d2d3d',
    flexShrink: 0,
    gap: '2px',
  },
  tab: (active) => ({
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    color: active ? '#e0e0f0' : '#6060a0',
    cursor: 'pointer',
    marginBottom: '-1px',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #3d82c4' : '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.01em',
  }),
  newBadge: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#3d82c4',
    padding: '2px 5px',
    borderRadius: '3px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    lineHeight: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  placeholderContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#404058',
    fontSize: '14px',
  },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Stance Tracker')

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>IX</div>
          <div style={styles.headerDivider} />
          <span style={styles.headerTitle}>Index</span>
          <span style={styles.headerIndex}>/ Footwear &amp; Fashion Trends</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerMeta}>Q1 2025</span>
          <div style={styles.headerDivider} />
          <div style={styles.statusRow}>
            <div style={styles.statusDot} />
            <span>Live</span>
          </div>
        </div>
      </header>

      <nav style={styles.navBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={styles.tab(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Stance Tracker' && <span style={styles.newBadge}>New</span>}
          </button>
        ))}
      </nav>

      <div style={styles.content}>
        {activeTab === 'Stance Tracker' ? (
          <StanceTracker />
        ) : (
          <div style={styles.placeholderContent}>
            {activeTab} — select Stance Tracker to view prototype
          </div>
        )}
      </div>
    </div>
  )
}
