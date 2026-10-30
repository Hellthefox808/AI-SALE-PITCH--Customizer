import React, { useState, useEffect, useCallback } from 'react'
import { api } from './api/client.js'
import {
  PitchParticleCanvas,
  Navbar,
  ExecutiveKpiBar,
  PitchStudio,
  AccountExplorer,
  ReviewLab,
  ProductCatalog,
  AuditFeed
} from './components/index.js'

export function App () {
  const [activeTab, setActiveTab] = useState('studio')
  const [currentRole, setCurrentRole] = useState('sdr_rep')
  const [isParticlePaused, setIsParticlePaused] = useState(false)
  const [toast, setToast] = useState(null)

  const [accounts, setAccounts] = useState([])
  const [products, setProducts] = useState([])
  const [newsTriggers, setNewsTriggers] = useState([])
  const [kpis, setKpis] = useState(null)

  const [studioPreselectedAcc, setStudioPreselectedAcc] = useState(null)
  const [studioPreselectedTrg, setStudioPreselectedTrg] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast])

  // Initial Load: Authenticate default role and fetch telemetry
  const refreshCoreData = useCallback(async () => {
    try {
      const [accs, prods, trgs, kpiData] = await Promise.all([
        api.getAccounts(),
        api.getProducts(true),
        api.getNewsTriggers(),
        api.getKpis()
      ])
      setAccounts(accs)
      setProducts(prods)
      setNewsTriggers(trgs)
      setKpis(kpiData)
    } catch (err) {
      console.error('Initial data load error:', err)
      showToast(`Failed loading data: ${err.message}`, 'error')
    }
  }, [showToast])

  useEffect(() => {
    async function initSession () {
      const session = api.getSession()
      if (!session.token) {
        try {
          const authRes = await api.switchPersona('sdr_rep')
          setCurrentRole(authRes.user.role)
        } catch (err) {
          console.error('Auth init error:', err)
        }
      } else if (session.user) {
        setCurrentRole(session.user.role)
      }
      refreshCoreData()
    }

    initSession()
  }, [refreshCoreData])

  const handleSwitchRole = async (newRole) => {
    try {
      const res = await api.switchPersona(newRole)
      setCurrentRole(res.user.role)
      showToast(`Switched active persona to ${res.user.name} (${res.user.role})`, 'success')
      refreshCoreData()
    } catch (err) {
      showToast(`Persona switch failed: ${err.message}`, 'error')
    }
  }

  const handleSelectTriggerForPitch = (accountId, triggerId) => {
    setStudioPreselectedAcc(accountId)
    setStudioPreselectedTrg(triggerId)
    setActiveTab('studio')
    showToast('Trigger loaded into Pitch Studio!', 'info')
  }

  // Global Keyboard Shortcuts (1-5 for tabs, P for particles, R for refresh)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return
      }

      if (e.key === '1') setActiveTab('studio')
      else if (e.key === '2') setActiveTab('accounts')
      else if (e.key === '3') setActiveTab('review')
      else if (e.key === '4') setActiveTab('products')
      else if (e.key === '5') setActiveTab('audit')
      else if (e.key === 'p' || e.key === 'P') {
        setIsParticlePaused(prev => !prev)
        showToast(!isParticlePaused ? '4D Particle Telemetry Paused' : '4D Particle Telemetry Active', 'info')
      } else if (e.key === 'r' || e.key === 'R') {
        refreshCoreData()
        showToast('Telemetry refreshed', 'info')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isParticlePaused, refreshCoreData, showToast])

  return (
    <div className='app-container'>
      {/* 4D-Inspired Particle and Spatial Visual System */}
      <PitchParticleCanvas isPaused={isParticlePaused} />

      {/* Ambient Lighting Spheres */}
      <div className='ambient-glow-sphere-1' aria-hidden='true' />
      <div className='ambient-glow-sphere-2' aria-hidden='true' />

      {/* Floating Glass Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        isParticlePaused={isParticlePaused}
        onToggleParticles={() => setIsParticlePaused(prev => !prev)}
      />

      {/* Main Container */}
      <main className='main-content'>
        {/* Executive KPI Bar */}
        <ExecutiveKpiBar kpis={kpis} />

        {/* Tab Modules */}
        {activeTab === 'studio' && (
          <PitchStudio
            accounts={accounts}
            products={products}
            preselectedAccountId={studioPreselectedAcc}
            preselectedTriggerId={studioPreselectedTrg}
            onPitchSaved={() => refreshCoreData()}
            showToast={showToast}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountExplorer
            accounts={accounts}
            triggers={newsTriggers}
            onSelectTriggerForPitch={handleSelectTriggerForPitch}
            showToast={showToast}
          />
        )}

        {activeTab === 'review' && (
          <ReviewLab
            currentRole={currentRole}
            showToast={showToast}
          />
        )}

        {activeTab === 'products' && (
          <ProductCatalog
            products={products}
            currentRole={currentRole}
            onProductCreated={() => refreshCoreData()}
            showToast={showToast}
          />
        )}

        {activeTab === 'audit' && (
          <AuditFeed
            currentRole={currentRole}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification Pill */}
      {toast && (
        <div className='toast-floating-container' role='alert'>
          <div className='toast-pill'>
            <span>{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : '⚡'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
export default App
