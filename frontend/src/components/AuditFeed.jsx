import React, { useState, useEffect } from 'react'
import { api } from '../api/client.js'

export function AuditFeed ({ currentRole, showToast = () => {} }) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const isAuthorized = currentRole === 'sales_manager' || currentRole === 'admin'

  const loadLogs = async () => {
    if (!isAuthorized) return
    setIsLoading(true)
    try {
      const data = await api.getAuditLogs(50)
      setLogs(data)
    } catch (err) {
      showToast(`Failed loading audit trail: ${err.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [currentRole])

  if (!isAuthorized) {
    return (
      <div className='glass-panel' style={{ textAlign: 'center', padding: '50px 30px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔒</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
          Role-Gated Audit Logs
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
          Audit logs and security events are restricted to <strong>Sales Manager</strong> and <strong>Admin</strong> personas.
          Use the role switcher in the top navigation bar to elevate your session.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className='glass-panel' style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Security & Activity Audit Logs</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Full auditability of user logins, pitch creations, status updates, and persona switching.
            </p>
          </div>
          <button
            type='button'
            className='btn-secondary'
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={loadLogs}
          >
            🔄 Refresh Logs
          </button>
        </div>
      </div>

      <div className='glass-panel' style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className='spinner-ring' /><br />Loading audit feed...
          </div>
        )}
        {!isLoading && logs.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records captured yet.
          </div>
        )}
        {!isLoading && logs.length > 0 && (
          <div className='glass-table-wrapper'>
            <table className='glass-table'>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Role</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {log.created_at}
                    </td>
                    <td>
                      <span className='trigger-badge' style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className={`kpi-badge ${log.user_role === 'admin' ? 'amber' : log.user_role === 'sales_manager' ? 'cyan' : 'success'}`}>
                        {log.user_role || 'anonymous'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
