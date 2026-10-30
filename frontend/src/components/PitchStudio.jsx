import React, { useState, useEffect } from 'react'
import { api } from '../api/client.js'

export function PitchStudio ({
  accounts = [],
  products = [],
  preselectedAccountId = null,
  preselectedTriggerId = null,
  onPitchSaved = () => {},
  showToast = () => {}
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedAccountId || '')
  const [contacts, setContacts] = useState([])
  const [selectedContactId, setSelectedContactId] = useState('')
  const [newsTriggers, setNewsTriggers] = useState([])
  const [selectedTriggerId, setSelectedTriggerId] = useState(preselectedTriggerId || '')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [framework, setFramework] = useState('PAS')
  const [tone, setTone] = useState('direct_roi')

  const [outputMode, setOutputMode] = useState('single')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingCadence, setIsGeneratingCadence] = useState(false)
  const [activeVariantTab, setActiveVariantTab] = useState('A')
  const [generatedSuite, setGeneratedSuite] = useState(null)
  const [generatedCadence, setGeneratedCadence] = useState(null)
  const [editableBody, setEditableBody] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [isSaving, setIsSaving] = useState(false)
  const [showSpamDetails, setShowSpamDetails] = useState(false)
  const [sanitizerAlert, setSanitizerAlert] = useState(null)
  const [isSanitizing, setIsSanitizing] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Initialize defaults
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id)
    }
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id)
    }
  }, [accounts, products, selectedAccountId, selectedProductId])

  // Load contacts and news triggers when account changes
  useEffect(() => {
    if (!selectedAccountId) return
    let isCurrent = true

    async function loadAccountData () {
      try {
        const [accContacts, accTriggers] = await Promise.all([
          api.getContacts(selectedAccountId),
          api.getNewsTriggers(selectedAccountId)
        ])
        if (!isCurrent) return

        setContacts(accContacts)
        if (accContacts.length > 0) {
          setSelectedContactId(accContacts[0].id)
        } else {
          setSelectedContactId('')
        }

        setNewsTriggers(accTriggers)
        if (preselectedTriggerId && accTriggers.some(t => t.id === preselectedTriggerId)) {
          setSelectedTriggerId(preselectedTriggerId)
        } else if (accTriggers.length > 0) {
          setSelectedTriggerId(accTriggers[0].id)
        } else {
          setSelectedTriggerId('')
        }
      } catch (err) {
        showToast(`Failed loading account data: ${err.message}`, 'error')
      }
    }

    loadAccountData()
    return () => { isCurrent = false }
  }, [selectedAccountId, preselectedTriggerId])

  const selectedTrigger = newsTriggers.find(t => t.id === selectedTriggerId) || null
  const selectedProduct = products.find(p => p.id === selectedProductId) || null

  const getSpamClass = (score) => {
    if (score <= 15) return 'excellent'
    if (score <= 35) return 'moderate'
    return 'high-risk'
  }

  const handleGenerate = async () => {
    if (!selectedAccountId || !selectedContactId || !selectedTriggerId || !selectedProductId) {
      showToast('Please select an account, contact, news trigger, and product.', 'error')
      return
    }

    setIsGenerating(true)
    setSanitizerAlert(null)
    try {
      const suite = await api.generatePitch({
        accountId: selectedAccountId,
        contactId: selectedContactId,
        newsTriggerId: selectedTriggerId,
        productId: selectedProductId,
        framework,
        tone
      })

      setGeneratedSuite(suite)
      const defaultVar = suite.variants.find(v => v.variantId === suite.recommendedVariant) || suite.variants[0]
      setActiveVariantTab(defaultVar.variantId)
      setEditableBody(defaultVar.body)
      setIsEditing(false)
      setOutputMode('single')
      showToast('3 hyper-personalized variants synthesized successfully!', 'success')
    } catch (err) {
      showToast(`Generation failed: ${err.message}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCadence = async () => {
    if (!selectedAccountId || !selectedContactId || !selectedTriggerId || !selectedProductId) {
      showToast('Please select an account, contact, news trigger, and product.', 'error')
      return
    }

    setIsGeneratingCadence(true)
    try {
      const cadence = await api.generateCadence({
        accountId: selectedAccountId,
        contactId: selectedContactId,
        newsTriggerId: selectedTriggerId,
        productId: selectedProductId,
        primaryVariant: currentVariant || null
      })
      setGeneratedCadence(cadence)
      setOutputMode('cadence')
      showToast('4-Touch Omnichannel Cadence sequence synthesized!', 'success')
    } catch (err) {
      showToast(`Cadence generation failed: ${err.message}`, 'error')
    } finally {
      setIsGeneratingCadence(false)
    }
  }

  const handleAutoSanitize = async () => {
    if (!editableBody) return
    setIsSanitizing(true)
    try {
      const res = await api.sanitizePitch(editableBody, currentVariant?.subjectLine || '')
      if (res.replacementsCount > 0) {
        setEditableBody(res.sanitizedText)
        setSanitizerAlert({
          replacements: res.replacements,
          count: res.replacementsCount,
          newSpamScore: res.newSpamScore
        })
        showToast(`Sanitized ${res.replacementsCount} phrase(s)! Spam index: ${res.newSpamScore}/100`, 'success')
      } else {
        setSanitizerAlert(null)
        showToast('Pitch text is already 100% clean of aggressive sales jargon!', 'success')
      }
    } catch (err) {
      showToast(`Sanitization failed: ${err.message}`, 'error')
    } finally {
      setIsSanitizing(false)
    }
  }

  const currentVariant = generatedSuite
    ? generatedSuite.variants.find(v => v.variantId === activeVariantTab) || generatedSuite.variants[0]
    : null

  const handleTabChange = (varId) => {
    setActiveVariantTab(varId)
    const v = generatedSuite?.variants.find(item => item.variantId === varId)
    if (v) {
      setEditableBody(v.body)
      setIsEditing(false)
      setSanitizerAlert(null)
    }
  }

  const handleCopyClipboard = async () => {
    if (!currentVariant) return
    const textToCopy = `Subject: ${currentVariant.subjectLine}\n\n${editableBody}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      showToast('Copied pitch & subject line to clipboard!', 'success')
    } catch {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleCopyTouch = async (touch) => {
    const text = `Subject: ${touch.subjectLine}\n\n${touch.body}`
    try {
      await navigator.clipboard.writeText(text)
      showToast(`Copied Step ${touch.step} (${touch.day}) to clipboard!`, 'success')
    } catch {
      showToast('Failed to copy step to clipboard', 'error')
    }
  }

  const handleExport = async (format) => {
    if (!currentVariant && !generatedCadence) return
    try {
      const selectedAcc = accounts.find(a => a.id === selectedAccountId)
      const selectedCon = contacts.find(c => c.id === selectedContactId)

      const payload = {
        format,
        subjectLine: currentVariant?.subjectLine || '',
        bodyContent: editableBody || '',
        cadence: generatedCadence || null,
        accountName: selectedAcc?.name || 'Enterprise Account',
        contactEmail: selectedCon?.email || 'prospect@company.com'
      }

      if (format === 'copy') {
        const textToCopy = `Subject: ${payload.subjectLine}\n\n${payload.bodyContent}`
        await navigator.clipboard.writeText(textToCopy)
        showToast('Formatted email copied for Gmail/Outlook!', 'success')
        setShowExportModal(false)
        return
      }

      const result = await api.exportPitch(payload)
      let blob
      let filename = `pitchcraft-export-${Date.now()}`

      if (format === 'csv') {
        blob = new Blob([result], { type: 'text/csv;charset=utf-8;' })
        filename += '.csv'
      } else if (format === 'eml') {
        blob = new Blob([result], { type: 'message/rfc822' })
        filename += '.eml'
      } else {
        blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
        filename += '.json'
      }

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Exported ${format.toUpperCase()} successfully!`, 'success')
      setShowExportModal(false)
    } catch (err) {
      showToast(`Export failed: ${err.message}`, 'error')
    }
  }

  const handleSavePitch = async (targetStatus = 'draft') => {
    if (!generatedSuite || !currentVariant) return
    setIsSaving(true)
    try {
      const payload = {
        accountId: selectedAccountId,
        contactId: selectedContactId,
        newsTriggerId: selectedTriggerId,
        productId: selectedProductId,
        framework,
        tone,
        subjectLine: currentVariant.subjectLine,
        bodyContent: editableBody,
        variants: generatedSuite.variants,
        spamScore: currentVariant.spamScore,
        readabilityGrade: currentVariant.readabilityGrade,
        wordCount: currentVariant.wordCount,
        status: targetStatus,
        feedbackRating
      }

      const saved = await api.savePitch(payload)
      showToast(`Pitch saved as ${targetStatus.toUpperCase()}!`, 'success')
      onPitchSaved(saved)
    } catch (err) {
      showToast(`Failed saving pitch: ${err.message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='studio-layout'>
      {/* Left Column: Configuration & Trigger Event Intelligence */}
      <div className='glass-panel'>
        <div className='panel-header'>
          <div className='panel-title-block'>
            <span>🎯</span>
            <div>
              <h2 className='panel-title'>Outreach Configuration</h2>
              <p className='panel-subtitle'>Account-based trigger event parameters</p>
            </div>
          </div>
        </div>

        {/* 1. Account Selection */}
        <div className='form-group'>
          <label className='form-label' htmlFor='account-select'>Target Enterprise Account</label>
          <select
            id='account-select'
            className='glass-select'
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.industry} • {acc.size})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Contact Selection */}
        <div className='form-group'>
          <label className='form-label' htmlFor='contact-select'>Executive Contact</label>
          <select
            id='contact-select'
            className='glass-select'
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            disabled={contacts.length === 0}
          >
            {contacts.length === 0 && (
              <option value=''>No contacts available for this account</option>
            )}
            {contacts.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.title} ({c.persona_type})
              </option>
            ))}
          </select>
        </div>

        {/* 3. News Trigger Event Card */}
        <div className='form-group'>
          <label className='form-label' htmlFor='trigger-select'>Corporate News / Press Trigger</label>
          <select
            id='trigger-select'
            className='glass-select'
            value={selectedTriggerId}
            onChange={(e) => setSelectedTriggerId(e.target.value)}
            disabled={newsTriggers.length === 0}
          >
            {newsTriggers.map(t => (
              <option key={t.id} value={t.id}>
                [{t.trigger_category}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {selectedTrigger && (
          <div className='trigger-event-card'>
            <div className='trigger-event-header'>
              <span className='trigger-badge'>
                ⚡ {selectedTrigger.trigger_category}
              </span>
              <span className='trigger-date'>
                {selectedTrigger.published_date} • {selectedTrigger.sentiment}
              </span>
            </div>
            <div className='trigger-title-text'>{selectedTrigger.title}</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {selectedTrigger.summary}
            </p>
            {selectedTrigger.key_facts && selectedTrigger.key_facts.length > 0 && (
              <div className='trigger-facts-row'>
                {selectedTrigger.key_facts.map((fact, i) => (
                  <span key={i} className='fact-chip'>
                    📌 {fact}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Product Offering Selection */}
        <div className='form-group'>
          <label className='form-label' htmlFor='product-select'>Seller Product & Value Prop</label>
          <select
            id='product-select'
            className='glass-select'
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {products.map(prod => (
              <option key={prod.id} value={prod.id}>
                {prod.name} ({prod.category})
              </option>
            ))}
          </select>
          {selectedProduct && (
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              💡 {selectedProduct.tagline}
            </div>
          )}
        </div>

        {/* 5. Framework & Tone Selectors */}
        <div className='form-group'>
          <label className='form-label'>Copywriting Framework</label>
          <div className='pill-selector-grid'>
            {[
              { id: 'PAS', title: 'PAS', desc: 'Problem → Agitate → Solve' },
              { id: 'BAB', title: 'BAB', desc: 'Before → After → Bridge' },
              { id: 'AIDA', title: 'AIDA', desc: 'Attention → Interest → Action' },
              { id: 'QuickStrike', title: 'QuickStrike', desc: '3-Sentence High Impact' }
            ].map(f => (
              <button
                key={f.id}
                type='button'
                className={`pill-option-btn ${framework === f.id ? 'selected' : ''}`}
                onClick={() => setFramework(f.id)}
              >
                <span className='pill-option-title'>{f.title}</span>
                <span className='pill-option-desc'>{f.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='form-group'>
          <label className='form-label'>Tone Profile</label>
          <div className='pill-selector-grid' style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { id: 'direct_roi', title: 'Direct ROI' },
              { id: 'consultative', title: 'Consultative' },
              { id: 'visionary', title: 'Visionary' }
            ].map(t => (
              <button
                key={t.id}
                type='button'
                className={`pill-option-btn ${tone === t.id ? 'selected' : ''}`}
                onClick={() => setTone(t.id)}
              >
                <span className='pill-option-title'>{t.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Synthesis Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type='button'
            className='btn-primary'
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating && (
              <>
                <span className='spinner-ring' />
                <span>Synthesizing 3 Angles...</span>
              </>
            )}
            {!isGenerating && (
              <>
                <span>⚡</span>
                <span>Synthesize 3 Pitch Variants</span>
              </>
            )}
          </button>

          <button
            type='button'
            className='btn-secondary'
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.12)' }}
            onClick={handleGenerateCadence}
            disabled={isGeneratingCadence}
          >
            {isGeneratingCadence && (
              <>
                <span className='spinner-ring' />
                <span>Synthesizing Cadence...</span>
              </>
            )}
            {!isGeneratingCadence && (
              <>
                <span>📅</span>
                <span>Synthesize 4-Touch Cadence Sequence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: 3-Variant Showcase & Deliverability Telemetry */}
      <div className='variant-studio-wrapper'>
        {/* Output Mode Switcher & Export Header */}
        {(generatedSuite || generatedCadence) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type='button'
                className={`btn-secondary ${outputMode === 'single' ? 'active' : ''}`}
                onClick={() => setOutputMode('single')}
              >
                <span>🎯 3 Pitch Variants</span>
              </button>
              <button
                type='button'
                className={`btn-secondary ${outputMode === 'cadence' ? 'active' : ''}`}
                onClick={() => {
                  if (!generatedCadence && generatedSuite) {
                    handleGenerateCadence()
                  } else {
                    setOutputMode('cadence')
                  }
                }}
              >
                <span>📅 4-Touch Cadence</span>
                {generatedCadence && <span style={{ color: 'var(--accent-emerald)' }}>✓</span>}
              </button>
            </div>

            <button
              type='button'
              className='btn-secondary'
              style={{ borderColor: 'var(--accent-primary)', color: '#c7d2fe' }}
              onClick={() => setShowExportModal(true)}
            >
              <span>📤 Export Outreach</span>
            </button>
          </div>
        )}

        {/* 1. Single Pitch 3-Variant Mode */}
        {outputMode === 'single' && generatedSuite && (
          <div className='variant-card'>
            {/* Variant Navigation Tabs */}
            <div className='variant-tabs-header'>
              <div className='variant-tab-pills'>
                {generatedSuite.variants.map(v => (
                  <button
                    key={v.variantId}
                    type='button'
                    className={`variant-tab-btn ${activeVariantTab === v.variantId ? 'active' : ''}`}
                    onClick={() => handleTabChange(v.variantId)}
                  >
                    <span>Variant {v.variantId}</span>
                    <span className='variant-pill-tag'>{v.styleName.split('&')[0]}</span>
                    {generatedSuite.recommendedVariant === v.variantId && (
                      <span style={{ fontSize: '0.7rem' }}>⭐</span>
                    )}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>
                Framework: <strong>{framework}</strong>
              </span>
            </div>

            {/* Subject Line Recommendation */}
            <div className='subject-line-box' style={{ marginTop: '16px' }}>
              <div style={{ flex: 1 }}>
                <div className='subject-label'>Recommended Subject Line</div>
                <div className='subject-line-content'>
                  {currentVariant?.subjectLine}
                </div>
              </div>
              <button
                type='button'
                className='btn-secondary'
                onClick={handleCopyClipboard}
                title='Copy subject and pitch body'
              >
                📋 Copy
              </button>
            </div>

            {/* Quality & Deliverability Telemetry Row */}
            <div className='quality-telemetry-row'>
              <div className='telemetry-item'>
                <span className='telemetry-label'>Spam Risk Index</span>
                <div className='telemetry-value-wrap'>
                  <span className={`telemetry-value ${getSpamClass(currentVariant?.spamScore || 0)}`}>
                    {currentVariant?.spamScore} / 100
                  </span>
                  <button
                    type='button'
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
                    onClick={() => setShowSpamDetails(!showSpamDetails)}
                  >
                    {showSpamDetails ? 'Hide' : 'Inspect'}
                  </button>
                </div>
              </div>

              <div className='telemetry-item'>
                <span className='telemetry-label'>Readability</span>
                <div className='telemetry-value-wrap'>
                  <span className='telemetry-value' style={{ color: 'var(--accent-cyan)' }}>
                    Grade {currentVariant?.readabilityGrade}
                  </span>
                </div>
              </div>

              <div className='telemetry-item'>
                <span className='telemetry-label'>Word Count</span>
                <div className='telemetry-value-wrap'>
                  <span className='telemetry-value'>
                    {currentVariant?.wordCount} words
                  </span>
                </div>
              </div>

              <div className='telemetry-item'>
                <span className='telemetry-label'>Personalization</span>
                <div className='telemetry-value-wrap'>
                  <span className='telemetry-value' style={{ color: 'var(--accent-emerald)' }}>
                    {currentVariant?.personalizationDepthPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Predictive Engagement Telemetry Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📊 Predicted Open Rate:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                  {currentVariant?.predictedOpenRate || 68}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💬 Predicted Reply Rate:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                  {currentVariant?.predictedReplyRate || 24}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⚡ CTA Friction:</span>
                <span className={`friction-badge ${currentVariant?.ctaFriction || 'low'}`}>
                  {currentVariant?.ctaFriction || 'low'} friction
                </span>
              </div>
            </div>

            {/* Sanitizer Diff Banner */}
            {sanitizerAlert && (
              <div className='sanitizer-banner'>
                <div>
                  <div className='sanitizer-banner-title'>
                    ✨ Auto-Sanitization Applied ({sanitizerAlert.count} replacements)
                  </div>
                  <div className='sanitizer-banner-desc'>
                    Replaced aggressive sales jargon with consultative value phrasing. Deliverability improved!
                  </div>
                  <div className='sanitizer-tag-list'>
                    {sanitizerAlert.replacements.map((r, i) => (
                      <span key={i} className='sanitizer-tag'>
                        "{r.original}" → "{r.replacement}"
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type='button'
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                  onClick={() => setSanitizerAlert(null)}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Expandable Spam Detail Flags */}
            {showSpamDetails && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: '16px'
              }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  DELIVERABILITY AUDIT FLAGS:
                </div>
                {currentVariant?.spamFlags && currentVariant.spamFlags.length > 0 && (
                  <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#fca5a5' }}>
                    {currentVariant.spamFlags.map((flag, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{flag}</li>
                    ))}
                  </ul>
                )}
                {(!currentVariant?.spamFlags || currentVariant.spamFlags.length === 0) && (
                  <div style={{ fontSize: '0.82rem', color: '#86efac' }}>
                    ✅ Clean! No risky spam triggers or aggressive punctuation detected.
                  </div>
                )}
              </div>
            )}

            {/* Email Body Workspace */}
            {isEditing && (
              <textarea
                className='glass-textarea'
                style={{ minHeight: '220px', marginBottom: '18px' }}
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
              />
            )}
            {!isEditing && (
              <div className='email-body-box'>
                {editableBody}
              </div>
            )}

            {/* Actions & Workflow Control */}
            <div className='variant-actions-bar'>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type='button'
                  className={`btn-secondary ${isEditing ? 'active' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Done Editing' : '✏️ Edit In-Place'}
                </button>

                <button
                  type='button'
                  className='btn-secondary'
                  style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}
                  onClick={handleAutoSanitize}
                  disabled={isSanitizing}
                >
                  {isSanitizing ? 'Sanitizing...' : '✨ Auto-Sanitize Jargon'}
                </button>

                <div className='rating-stars-wrap'>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '4px' }}>Rate:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      className={`star-btn ${feedbackRating >= star ? 'active' : ''}`}
                      onClick={() => setFeedbackRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => handleSavePitch('draft')}
                  disabled={isSaving}
                >
                  💾 Save Draft
                </button>
                <button
                  type='button'
                  className='btn-secondary'
                  style={{ background: 'rgba(99, 102, 241, 0.2)', borderColor: 'var(--accent-primary)', color: '#ffffff' }}
                  onClick={() => handleSavePitch('reviewed')}
                  disabled={isSaving}
                >
                  📤 Submit for Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. 4-Touch Cadence Sequence Mode */}
        {outputMode === 'cadence' && generatedCadence && (
          <div className='variant-card'>
            <div className='panel-header' style={{ marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  4-Touch Omnichannel Outreach Cadence
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  11-day sequenced campaign tailored to trigger event and proof metrics
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className='cadence-day-pill'>Span: {generatedCadence.estimatedCadenceDays} Days</span>
                <span className='cadence-day-pill' style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}>
                  {generatedCadence.totalTouches} Touches
                </span>
              </div>
            </div>

            <div className='cadence-timeline'>
              {generatedCadence.steps.map((step) => (
                <div key={step.step} className='cadence-step-card'>
                  <div className='cadence-step-header'>
                    <div className='cadence-step-meta'>
                      <span className='cadence-day-pill'>{step.day}</span>
                      <span className='cadence-channel-pill'>{step.channel}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {step.label}
                      </span>
                    </div>
                    <button
                      type='button'
                      className='btn-secondary'
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => handleCopyTouch(step)}
                    >
                      📋 Copy Step
                    </button>
                  </div>

                  <div className='cadence-step-subject'>
                    Subject: {step.subjectLine}
                  </div>

                  <div className='cadence-step-body'>
                    {step.body}
                  </div>

                  <div className='cadence-step-footer'>
                    <span>Spam Index: <strong style={{ color: '#34d399' }}>{step.spamScore}/100</strong></span>
                    <span>Readability: <strong>Grade {step.readabilityGrade}</strong></span>
                    <span>Length: <strong>{step.wordCount} words</strong> (~{step.readingTimeSec}s read)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State Showcase */}
        {!generatedSuite && !generatedCadence && (
          <div className='glass-panel' style={{ textAlign: 'center', padding: '60px 30px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Synthesize Hyper-Personalized Outbound
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
              Select a target enterprise account and its strategic trigger event on the left.
              PitchCraft will generate 3 customized email angles or a 4-touch follow-up cadence.
            </p>
            <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>🚀 100% Deterministic Engine</span> • <span>Zero Token Costs</span> • <span>Sub-50ms Synthesis</span>
            </div>
          </div>
        )}
      </div>

      {/* Outreach Export Modal Dialog */}
      {showExportModal && (
        <div className='modal-backdrop' onClick={() => setShowExportModal(false)}>
          <div className='modal-card' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <div className='modal-title'>📤 Export Outreach Artifacts</div>
              <button
                type='button'
                className='modal-close-btn'
                onClick={() => setShowExportModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select an export format to import your customized outreach directly into sales engagement platforms.
            </p>

            <div className='export-grid'>
              <button
                type='button'
                className='export-btn-tile'
                onClick={() => handleExport('copy')}
              >
                <span className='export-tile-icon'>📋</span>
                <span className='export-tile-title'>Gmail / Outlook</span>
                <span className='export-tile-desc'>Copy formatted subject & body directly to clipboard</span>
              </button>

              <button
                type='button'
                className='export-btn-tile'
                onClick={() => handleExport('csv')}
              >
                <span className='export-tile-icon'>📊</span>
                <span className='export-tile-title'>Outreach / Salesloft CSV</span>
                <span className='export-tile-desc'>Multi-step cadence CSV ready for direct platform import</span>
              </button>

              <button
                type='button'
                className='export-btn-tile'
                onClick={() => handleExport('eml')}
              >
                <span className='export-tile-icon'>✉️</span>
                <span className='export-tile-title'>RFC 822 (.eml)</span>
                <span className='export-tile-desc'>Standard desktop email draft file for Apple Mail & Thunderbird</span>
              </button>

              <button
                type='button'
                className='export-btn-tile'
                onClick={() => handleExport('json')}
              >
                <span className='export-tile-icon'>💾</span>
                <span className='export-tile-title'>JSON Manifest</span>
                <span className='export-tile-desc'>Complete structured payload with deliverability metadata</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type='button'
                className='btn-secondary'
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
