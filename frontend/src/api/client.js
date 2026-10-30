const API_BASE = '/api'

let authToken = localStorage.getItem('pitchcraft_token') || ''
let activeUser = JSON.parse(localStorage.getItem('pitchcraft_user') || 'null')

export const api = {
  setSession (token, user) {
    authToken = token
    activeUser = user
    if (token) {
      localStorage.setItem('pitchcraft_token', token)
      localStorage.setItem('pitchcraft_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('pitchcraft_token')
      localStorage.removeItem('pitchcraft_user')
    }
  },

  getSession () {
    return { token: authToken, user: activeUser }
  },

  async request (endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      let errMsg = `Request failed: ${response.status} ${response.statusText}`
      try {
        const errorJson = await response.json()
        if (errorJson.error) errMsg = errorJson.error
      } catch {
        // Fallback to status text
      }
      throw new Error(errMsg)
    }

    return response.json()
  },

  // Auth & Personas
  async switchPersona (role) {
    const data = await this.request('/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ role })
    })
    this.setSession(data.token, data.user)
    return data
  },

  async getMe () {
    return this.request('/auth/me')
  },

  // Metadata
  async getMetadata () {
    return this.request('/config/metadata')
  },

  // Accounts & Contacts
  async getAccounts () {
    return this.request('/accounts')
  },

  async getAccount (id) {
    return this.request(`/accounts/${id}`)
  },

  async getContacts (accountId = null) {
    const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : ''
    return this.request(`/contacts${query}`)
  },

  // News Triggers
  async getNewsTriggers (accountId = null, category = null) {
    const params = new URLSearchParams()
    if (accountId) params.append('accountId', accountId)
    if (category) params.append('category', category)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/news-triggers${qs}`)
  },

  async analyzeTrigger (title, summary) {
    return this.request('/news-triggers/analyze', {
      method: 'POST',
      body: JSON.stringify({ title, summary })
    })
  },

  // Products
  async getProducts (all = false) {
    return this.request(`/products${all ? '?all=true' : ''}`)
  },

  async createProduct (productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  },

  // Pitch Studio
  async generatePitch (payload) {
    return this.request('/pitches/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async getPitches (filters = {}) {
    const params = new URLSearchParams()
    if (filters.accountId) params.append('accountId', filters.accountId)
    if (filters.status) params.append('status', filters.status)
    if (filters.limit) params.append('limit', filters.limit)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/pitches${qs}`)
  },

  async getPitch (id) {
    return this.request(`/pitches/${id}`)
  },

  async savePitch (pitchData) {
    return this.request('/pitches', {
      method: 'POST',
      body: JSON.stringify(pitchData)
    })
  },

  async updatePitch (id, updates) {
    return this.request(`/pitches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  },

  async deletePitch (id) {
    return this.request(`/pitches/${id}`, {
      method: 'DELETE'
    })
  },

  // Analytics & Audit
  async getKpis () {
    return this.request('/analytics/kpis')
  },

  async getAuditLogs (limit = 30) {
    return this.request(`/audit-logs?limit=${limit}`)
  }
}
