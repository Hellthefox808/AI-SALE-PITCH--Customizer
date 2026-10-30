import React, { useState, useEffect } from 'react'
import { api } from '../api/client.js'

export function ReviewLab ({ currentRole, showToast = () => {} }) {
  const [pitches, setPitches] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPitch, setSelectedPitch] = useState(null)

  const loadPitches = async () => {
    setIsLoading(true)
    try {
      const filters = statusFilter === 'all' ? {} : { status: statusFilter }
      const data = await api.getPitches(filters)
      setPitches(data)
    } catch (err) {
      showToast(`Failed loading review queue: ${err.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPitches()
  }, [statusFilter])

  const handleUpdateStatus = async (pitchId, newStatus) => {
    try {
      await api.updatePitch(pitchId, { status: newStatus })
      showToast(`Pitch marked as ${newStatus.toUpperCase()}`, 'success')
      loadPitches()
      if (selectedPitch && selectedPitch.id === pitchId) {
        setSelectedPitch(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (pitchId) => {
    if (!window.confirm('Are you sure you want to delete this pitch?')) return
    try {
      await api.deletePitch(pitchId)
      showToast('Pitch deleted', 'success')
      if (selectedPitch?.id === pitchId) setSelectedPitch(null)
      loadPitches()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const isManagerOrAdmin = currentRole === 'sales_manager' || currentRole === 'admin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Control Header */}
      <div className='glass-panel' style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Outreach Governance & Review Lab</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Inspect team pitch quality, spam benchmarks, and approval workflows.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter:</span>
            {['all', 'draft', 'reviewed', 'approved', 'sent'].map(s => (
              <button
                key={s}
                type='button'
                className={`btn-secondary ${statusFilter === s ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', textTransform: 'capitalize' }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
            <button
              type='button'
              className='btn-secondary'
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={loadPitches}
              title='Refresh'
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Main Review Table */}
      <div className='glass-panel' style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className='spinner-ring' style={{ marginBottom: '12px' }} /><br />
            Loading review queue...
          </div>
        )}
        {!isLoading && pitches.length === 0 && (
          <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pitches found matching current filter.
          </div>
        )}
        {!isLoading && pitches.length > 0 && (
          <div className='glass-table-wrapper'>
            <table className='glass-table'>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Account & Contact</th>
                  <th>Trigger Category</th>
                  <th>Framework / Tone</th>
                  <th>Spam Risk</th>
                  <th>Readability</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className={`status-pill ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.account_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.contact_name} ({p.contact_title})</div>
                    </td>
                    <td>
                      <span className='trigger-badge' style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                        ⚡ {p.trigger_category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.framework}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.tone}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: p.spam_score <= 15 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {p.spam_score} / 100
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>Grade {p.readability_grade}</span>
                    </td>
                    <td>
                      <span style={{ color: '#fbbf24' }}>
                        {'★'.repeat(p.feedback_rating || 0)}{'☆'.repeat(5 - (p.feedback_rating || 0))}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type='button'
                          className='btn-secondary'
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setSelectedPitch(p)}
                        >
                          👁️ Inspect
                        </button>

                        {isManagerOrAdmin && p.status !== 'approved' && (
                          <button
                            type='button'
                            className='btn-secondary'
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--accent-emerald)', color: '#34d399' }}
                            onClick={() => handleUpdateStatus(p.id, 'approved')}
                          >
                            ✓ Approve
                          </button>
                        )}

                        {p.status === 'approved' && (
                          <button
                            type='button'
                            className='btn-secondary'
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--accent-cyan)', color: '#22d3ee' }}
                            onClick={() => handleUpdateStatus(p.id, 'sent')}
                          >
                            🚀 Mark Sent
                          </button>
                        )}

                        {isManagerOrAdmin && (
                          <button
                            type='button'
                            className='btn-secondary'
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#f87171' }}
                            onClick={() => handleDelete(p.id)}
                            title='Delete pitch'
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal / Drawer */}
      {selectedPitch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        >
          <div className='glass-panel' style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className='panel-header'>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pitch Detail: {selectedPitch.account_name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Target: {selectedPitch.contact_name} ({selectedPitch.contact_email})
                </p>
              </div>
              <button
                type='button'
                className='btn-secondary'
                onClick={() => setSelectedPitch(null)}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div className='subject-label'>Subject Line</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                {selectedPitch.subject_line}
              </div>

              <div className='subject-label'>Body Content</div>
              <div className='email-body-box' style={{ whiteSpace: 'pre-line' }}>
                {selectedPitch.body_content}
              </div>
            </div>

            <div className='quality-telemetry-row'>
              <div className='telemetry-item'>
                <span className='telemetry-label'>Status</span>
                <span className={`status-pill ${selectedPitch.status}`} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                  {selectedPitch.status}
                </span>
              </div>
              <div className='telemetry-item'>
                <span className='telemetry-label'>Spam Risk Score</span>
                <span className='telemetry-value' style={{ color: selectedPitch.spam_score <= 15 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {selectedPitch.spam_score} / 100
                </span>
              </div>
              <div className='telemetry-item'>
                <span className='telemetry-label'>Readability</span>
                <span className='telemetry-value' style={{ color: 'var(--accent-cyan)' }}>
                  Grade {selectedPitch.readability_grade}
                </span>
              </div>
              <div className='telemetry-item'>
                <span className='telemetry-label'>Word Count</span>
                <span className='telemetry-value'>
                  {selectedPitch.word_count} words
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              {isManagerOrAdmin && selectedPitch.status !== 'approved' && (
                <button
                  type='button'
                  className='btn-primary'
                  style={{ width: 'auto', padding: '10px 20px' }}
                  onClick={() => handleUpdateStatus(selectedPitch.id, 'approved')}
                >
                  ✓ Approve Pitch for Sending
                </button>
              )}
              {selectedPitch.status === 'approved' && (
                <button
                  type='button'
                  className='btn-secondary'
                  style={{ borderColor: 'var(--accent-cyan)', color: '#22d3ee' }}
                  onClick={() => handleUpdateStatus(selectedPitch.id, 'sent')}
                >
                  🚀 Mark Sent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
