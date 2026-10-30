import React, { useState } from 'react'
import { api } from '../api/client.js'

export function ProductCatalog ({
  products = [],
  currentRole,
  onProductCreated = () => {},
  showToast = () => {}
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [tagline, setTagline] = useState('')
  const [valueProp, setValueProp] = useState('')
  const [painPointsRaw, setPainPointsRaw] = useState('')
  const [targetPersonasRaw, setTargetPersonasRaw] = useState('')
  const [proofPointsRaw, setProofPointsRaw] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isManagerOrAdmin = currentRole === 'sales_manager' || currentRole === 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !valueProp) {
      showToast('Product name and value proposition are required', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name,
        category: category || 'Cloud & SaaS',
        tagline,
        valueProp,
        painPoints: painPointsRaw.split('\n').map(s => s.trim()).filter(Boolean),
        targetPersonas: targetPersonasRaw.split('\n').map(s => s.trim()).filter(Boolean),
        proofPoints: proofPointsRaw.split('\n').map(s => s.trim()).filter(Boolean)
      }

      const created = await api.createProduct(payload)
      showToast(`Product "${created.name}" created!`, 'success')
      onProductCreated(created)
      setShowAddModal(false)
      setName('')
      setCategory('')
      setTagline('')
      setValueProp('')
      setPainPointsRaw('')
      setTargetPersonasRaw('')
      setProofPointsRaw('')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className='glass-panel' style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Product & Value Proposition Matrix</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Catalog of sales offerings, customer pain points, and benchmark proof points for pitch synthesis.
            </p>
          </div>

          {isManagerOrAdmin && (
            <button
              type='button'
              className='btn-primary'
              style={{ width: 'auto', padding: '10px 18px', fontSize: '0.85rem' }}
              onClick={() => setShowAddModal(true)}
            >
              + Add Product Offering
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {products.map(prod => (
          <div key={prod.id} className='glass-panel' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className='kpi-badge cyan'>{prod.category}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {prod.id}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>{prod.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '12px' }}>
                {prod.tagline}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {prod.value_prop}
              </p>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Target Buyer Personas:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(prod.target_personas || []).map((persona, i) => (
                    <span key={i} className='fact-chip' style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                      👤 {persona}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Quantified Proof Points:
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {(prod.proof_points || []).map((proof, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{proof}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
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
          <div className='glass-panel' style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className='panel-header'>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add Product Offering</h3>
              <button
                type='button'
                className='btn-secondary'
                onClick={() => setShowAddModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='form-group'>
                <label className='form-label' htmlFor='prod-name'>Product Name</label>
                <input
                  id='prod-name'
                  type='text'
                  className='glass-input'
                  required
                  placeholder='e.g., CloudCost Optimizer'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='prod-cat'>Category</label>
                <input
                  id='prod-cat'
                  type='text'
                  className='glass-input'
                  placeholder='e.g., FinOps & Cloud Infrastructure'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='prod-tagline'>Tagline</label>
                <input
                  id='prod-tagline'
                  type='text'
                  className='glass-input'
                  placeholder='e.g., Autonomous Kubernetes rightsizing and cost elimination'
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='prod-val'>Value Proposition</label>
                <textarea
                  id='prod-val'
                  className='glass-textarea'
                  rows={2}
                  required
                  placeholder='Explain core business value and transformation...'
                  value={valueProp}
                  onChange={(e) => setValueProp(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='prod-pains'>Pain Points (one per line)</label>
                <textarea
                  id='prod-pains'
                  className='glass-textarea'
                  rows={2}
                  placeholder='Overprovisioned cloud clusters&#10;Surprise monthly AWS invoices'
                  value={painPointsRaw}
                  onChange={(e) => setPainPointsRaw(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='prod-personas'>Target Personas (one per line)</label>
                <textarea
                  id='prod-personas'
                  className='glass-textarea'
                  rows={2}
                  placeholder='VP of Infrastructure&#10;Director of DevOps'
                  value={targetPersonasRaw}
                  onChange={(e) => setTargetPersonasRaw(e.target.value)}
                />
              </div>

              <div className='form-group'>
                <label className='form-label' htmlFor='prod-proof'>Proof Points (one per line)</label>
                <textarea
                  id='prod-proof'
                  className='glass-textarea'
                  rows={2}
                  placeholder='35% average bill reduction in 30 days&#10;Zero latency degradation'
                  value={proofPointsRaw}
                  onChange={(e) => setProofPointsRaw(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='btn-primary'
                  style={{ width: 'auto' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
