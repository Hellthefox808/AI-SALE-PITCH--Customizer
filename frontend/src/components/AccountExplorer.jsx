import React, { useState } from 'react'
import { api } from '../api/client.js'

export function AccountExplorer ({
  accounts = [],
  triggers = [],
  onSelectTriggerForPitch = () => {},
  showToast = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [activeAccountId, setActiveAccountId] = useState(accounts[0]?.id || '')

  // Ad-hoc trigger analyzer state
  const [adhocTitle, setAdhocTitle] = useState('')
  const [adhocSummary, setAdhocSummary] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const industries = ['All', ...new Set(accounts.map(a => a.industry))]

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === 'All' || acc.industry === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  const currentAccount = accounts.find(a => a.id === activeAccountId) || filteredAccounts[0] || null
  const currentTriggers = triggers.filter(t => t.account_id === currentAccount?.id)

  const handleAnalyzeAdhoc = async (e) => {
    e.preventDefault()
    if (!adhocTitle && !adhocSummary) {
      showToast('Please enter a headline or article text', 'error')
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await api.analyzeTrigger(adhocTitle, adhocSummary)
      setAnalysisResult(res)
      showToast('NLP Entity Extraction completed!', 'success')
    } catch (err) {
      showToast(`Analysis failed: ${err.message}`, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Filter Header */}
      <div className='glass-panel' style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '1.1rem' }}>🔍</span>
            <input
              type='text'
              className='glass-input'
              placeholder='Search enterprise accounts by company name or domain...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Industry:</span>
            <select
              className='glass-select'
              style={{ width: 'auto' }}
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Accounts List on Left, Account Detail & Triggers on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Accounts List */}
        <div className='glass-panel' style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px', letterSpacing: '0.04em' }}>
            Accounts Directory ({filteredAccounts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
            {filteredAccounts.map(acc => (
              <button
                key={acc.id}
                type='button'
                className={`pill-option-btn ${currentAccount?.id === acc.id ? 'selected' : ''}`}
                style={{ width: '100%', padding: '12px 14px' }}
                onClick={() => setActiveAccountId(acc.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className='pill-option-title'>{acc.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{acc.annual_revenue}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {acc.domain} • {acc.size}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <span className='kpi-badge cyan' style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {acc.trigger_count || 0} triggers
                  </span>
                  <span className='kpi-badge success' style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {acc.contact_count || 0} contacts
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Account Trigger Intelligence Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!currentAccount && (
            <div className='glass-panel'>
              <p style={{ color: 'var(--text-muted)' }}>Select an account to view its details.</p>
            </div>
          )}

          {currentAccount && (
            <div className='glass-panel'>
              <div className='panel-header'>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentAccount.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {currentAccount.industry} • HQ: {currentAccount.hq_location} • Revenue: {currentAccount.annual_revenue}
                  </p>
                </div>
                <span className='kpi-badge cyan' style={{ fontSize: '0.8rem' }}>
                  Domain: {currentAccount.domain}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {currentAccount.description}
                </p>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px', letterSpacing: '0.04em' }}>
                Active Trigger Events & Press Releases ({currentTriggers.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentTriggers.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No news triggers recorded for this account.</p>
                )}
                {currentTriggers.map(trg => (
                  <div key={trg.id} className='trigger-event-card' style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                    <div className='trigger-event-header'>
                      <span className='trigger-badge'>⚡ {trg.trigger_category}</span>
                      <span className='trigger-date'>{trg.published_date} • {trg.sentiment}</span>
                    </div>
                    <div className='trigger-title-text' style={{ fontSize: '1rem' }}>
                      {trg.title}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      {trg.summary}
                    </p>
                    {trg.key_facts && trg.key_facts.length > 0 && (
                      <div className='trigger-facts-row'>
                        {trg.key_facts.map((fact, idx) => (
                          <span key={idx} className='fact-chip'>📌 {fact}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type='button'
                        className='btn-secondary'
                        style={{ borderColor: 'var(--accent-primary)', color: '#a5b4fc', fontSize: '0.8rem' }}
                        onClick={() => onSelectTriggerForPitch(currentAccount.id, trg.id)}
                      >
                        ⚡ Customize Pitch for this Trigger →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad-Hoc Raw News NLP Analyzer Box */}
          <div className='glass-panel'>
            <div className='panel-header'>
              <div className='panel-title-block'>
                <span>🧪</span>
                <div>
                  <h3 className='panel-title'>Ad-Hoc Press Release Analyzer</h3>
                  <p className='panel-subtitle'>Paste any new headline or article to test in-house NLP entity extraction</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAnalyzeAdhoc}>
              <div className='form-group'>
                <label className='form-label' htmlFor='adhoc-title'>News Headline</label>
                <input
                  id='adhoc-title'
                  type='text'
                  className='glass-input'
                  placeholder='e.g., CyberGuard Secures $40M Series B to Expand Zero-Trust Protection'
                  value={adhocTitle}
                  onChange={(e) => setAdhocTitle(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='adhoc-summary'>Article Summary or Snippet</label>
                <textarea
                  id='adhoc-summary'
                  className='glass-textarea'
                  rows={3}
                  placeholder='e.g., Round led by Accel with 160% YoY ARR growth. Plans to hire 80 cloud engineers in Austin...'
                  value={adhocSummary}
                  onChange={(e) => setAdhocSummary(e.target.value)}
                />
              </div>

              <button
                type='submit'
                className='btn-secondary'
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Extracting Entities...' : 'Run Deterministic NLP Analysis'}
              </button>
            </form>

            {analysisResult && (
              <div style={{ marginTop: '18px', padding: '14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span className='kpi-badge cyan'>Category: {analysisResult.category}</span>
                  <span className='kpi-badge success'>Sentiment: {analysisResult.sentiment}</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Extracted Numerical Milestones:
                </div>
                <div className='trigger-facts-row'>
                  {analysisResult.extractedMilestones && analysisResult.extractedMilestones.length > 0 && (
                    analysisResult.extractedMilestones.map((m, i) => (
                      <span key={i} className='fact-chip'>🎯 {m}</span>
                    ))
                  )}
                  {(!analysisResult.extractedMilestones || analysisResult.extractedMilestones.length === 0) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No numerical milestones extracted.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
