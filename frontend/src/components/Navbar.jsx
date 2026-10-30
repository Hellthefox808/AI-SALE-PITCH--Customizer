import React from 'react'

export function Navbar ({
  activeTab,
  onSelectTab,
  currentRole,
  onSwitchRole,
  isParticlePaused,
  onToggleParticles
}) {
  const tabs = [
    { id: 'studio', label: 'Pitch Studio', shortcut: '1' },
    { id: 'accounts', label: 'Accounts & News', shortcut: '2' },
    { id: 'review', label: 'Review Lab', shortcut: '3' },
    { id: 'products', label: 'Product Matrix', shortcut: '4' },
    { id: 'audit', label: 'Audit Logs', shortcut: '5' }
  ]

  return (
    <header className='navbar-glass'>
      <a href='#studio' onClick={(e) => { e.preventDefault(); onSelectTab('studio') }} className='navbar-brand'>
        <div className='brand-icon-wrapper'>
          <span>⚡</span>
        </div>
        <div>
          <div className='brand-title'>PitchCraft AI</div>
          <span className='brand-tag'>Trigger-Based Customizer</span>
        </div>
      </a>

      <nav className='nav-links' aria-label='Primary Navigation'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type='button'
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className='nav-shortcut'>{tab.shortcut}</span>
          </button>
        ))}
      </nav>

      <div className='navbar-right'>
        <button
          type='button'
          className='particle-toggle-btn'
          onClick={onToggleParticles}
          title='Press P to toggle 4D particle telemetry'
        >
          <span className={`particle-dot ${isParticlePaused ? 'paused' : ''}`} />
          <span>{isParticlePaused ? 'Particles Paused' : '4D Telemetry'}</span>
          <span className='nav-shortcut'>P</span>
        </button>

        <div className='role-switcher-wrapper'>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>👤</span>
          <select
            className='role-select'
            value={currentRole}
            onChange={(e) => onSwitchRole(e.target.value)}
            aria-label='Select User Persona Role'
          >
            <option value='sdr_rep'>SDR Rep (Sarah)</option>
            <option value='sales_manager'>Sales Manager (Marcus)</option>
            <option value='admin'>Admin (Elena)</option>
          </select>
        </div>
      </div>
    </header>
  )
}
