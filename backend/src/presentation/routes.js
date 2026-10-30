import { Router } from 'express'
import { PitchEngine } from '../service/pitchEngine.js'
import { NlpEngine } from '../service/nlpEngine.js'
import { QualityEngine } from '../service/qualityEngine.js'
import { ROLES, FRAMEWORKS, TONES } from '../config/constants.js'

export function createRouter (repository, authService) {
  const router = Router()
  const requireAuth = authService.authMiddleware()
  const requireRole = (roles) => authService.roleMiddleware(roles)

  // --- 1. Healthcheck & Metadata ---
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'AI Sales Pitch Customizer API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  })

  router.get('/config/metadata', (req, res) => {
    res.json({
      frameworks: FRAMEWORKS,
      tones: TONES,
      roles: ROLES
    })
  })

  // --- 2. Auth & Persona Switcher ---
  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }
      const result = await authService.login(email, password)
      repository.createAuditLog({
        userId: result.user.id,
        userRole: result.user.role,
        action: 'USER_LOGIN',
        entityType: 'users',
        entityId: result.user.id,
        details: { email }
      })
      res.json(result)
    } catch (err) {
      res.status(401).json({ error: err.message })
    }
  })

  router.post('/auth/switch-persona', (req, res) => {
    const { role } = req.body
    const personaMap = {
      sdr_rep: { email: 'sdr@pitchcraft.io', name: 'Sarah Connor', role: 'sdr_rep', id: 'usr-sdr-1' },
      sales_manager: { email: 'manager@pitchcraft.io', name: 'Marcus Vance', role: 'sales_manager', id: 'usr-mgr-1' },
      admin: { email: 'admin@pitchcraft.io', name: 'Elena Rostova', role: 'admin', id: 'usr-adm-1' }
    }

    const persona = personaMap[role] || personaMap.sdr_rep
    const token = authService.generateToken(persona)

    repository.createAuditLog({
      userId: persona.id,
      userRole: persona.role,
      action: 'SWITCH_PERSONA',
      entityType: 'users',
      entityId: persona.id,
      details: { role: persona.role }
    })

    res.json({ token, user: persona })
  })

  router.get('/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user })
  })

  // --- 3. Accounts & Contacts ---
  router.get('/accounts', requireAuth, (req, res) => {
    const accounts = repository.listAccounts()
    res.json(accounts)
  })

  router.get('/accounts/:id', requireAuth, (req, res) => {
    const account = repository.getAccountById(req.params.id)
    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }
    res.json(account)
  })

  router.get('/contacts', requireAuth, (req, res) => {
    const contacts = repository.listContacts(req.query.accountId || null)
    res.json(contacts)
  })

  // --- 4. News Triggers & NLP Analysis ---
  router.get('/news-triggers', requireAuth, (req, res) => {
    const triggers = repository.listNewsTriggers(
      req.query.accountId || null,
      req.query.category || null
    )
    res.json(triggers)
  })

  router.get('/news-triggers/:id', requireAuth, (req, res) => {
    const trigger = repository.getNewsTriggerById(req.params.id)
    if (!trigger) {
      return res.status(404).json({ error: 'News trigger not found' })
    }
    res.json(trigger)
  })

  router.post('/news-triggers/analyze', requireAuth, (req, res) => {
    const { title, summary } = req.body
    if (!title && !summary) {
      return res.status(400).json({ error: 'Title or summary is required' })
    }

    const category = NlpEngine.classifyTrigger(title, summary)
    const sentiment = NlpEngine.evaluateSentiment(title, summary)
    const milestones = NlpEngine.extractKeyMilestones(`${title} ${summary}`)

    res.json({
      title,
      summary,
      category,
      sentiment,
      extractedMilestones: milestones
    })
  })

  // --- 5. Products ---
  router.get('/products', requireAuth, (req, res) => {
    const products = repository.listProducts(req.query.all !== 'true')
    res.json(products)
  })

  router.post('/products', requireAuth, requireRole([ROLES.SALES_MANAGER, ROLES.ADMIN]), (req, res) => {
    const { name, category, tagline } = req.body
    const valueProp = req.body.valueProp || req.body.value_prop
    const painPoints = req.body.painPoints || req.body.pain_points || []
    const targetPersonas = req.body.targetPersonas || req.body.target_personas || []
    const proofPoints = req.body.proofPoints || req.body.proof_points || []

    if (!name || !valueProp) {
      return res.status(400).json({ error: 'Product name and value proposition are required' })
    }

    const created = repository.createProduct({
      name,
      category: category || 'General',
      tagline: tagline || '',
      value_prop: valueProp,
      pain_points: painPoints,
      target_personas: targetPersonas,
      proof_points: proofPoints
    })

    repository.createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'CREATE_PRODUCT',
      entityType: 'products',
      entityId: created.id,
      details: { name }
    })

    res.status(201).json(created)
  })

  // --- 6. Pitch Generation Studio ---
  router.post('/pitches/generate', requireAuth, (req, res) => {
    try {
      const { accountId, contactId, newsTriggerId, productId, framework, tone } = req.body

      const account = repository.getAccountById(accountId)
      const contact = repository.getContactById(contactId)
      const trigger = repository.getNewsTriggerById(newsTriggerId)
      const product = repository.getProductById(productId)

      if (!account || !contact || !trigger || !product) {
        return res.status(400).json({
          error: 'Valid accountId, contactId, newsTriggerId, and productId are required'
        })
      }

      const suite = PitchEngine.generatePitchSuite({
        account,
        contact,
        trigger,
        product,
        framework: framework || 'PAS',
        tone: tone || 'direct_roi'
      })

      repository.createAuditLog({
        userId: req.user.id,
        userRole: req.user.role,
        action: 'GENERATE_PITCH_SUITE',
        entityType: 'pitches',
        details: {
          accountId,
          accountName: account.name,
          framework: suite.framework,
          tone: suite.tone
        }
      })

      res.json({
        ...suite,
        account: { id: account.id, name: account.name, domain: account.domain },
        contact: { id: contact.id, name: contact.name, title: contact.title, email: contact.email },
        trigger: { id: trigger.id, title: trigger.title, category: trigger.trigger_category },
        product: { id: product.id, name: product.name }
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // --- 7. Pitches CRUD & Workflow ---
  router.get('/pitches', requireAuth, (req, res) => {
    const pitches = repository.listPitches({
      accountId: req.query.accountId || null,
      status: req.query.status || null,
      limit: parseInt(req.query.limit || '50', 10),
      offset: parseInt(req.query.offset || '0', 10)
    })
    res.json(pitches)
  })

  router.get('/pitches/:id', requireAuth, (req, res) => {
    const pitch = repository.getPitchById(req.params.id)
    if (!pitch) {
      return res.status(404).json({ error: 'Pitch not found' })
    }
    res.json(pitch)
  })

  router.post('/pitches', requireAuth, (req, res) => {
    const {
      accountId, contactId, newsTriggerId, productId,
      framework, tone, subjectLine, bodyContent, variants,
      spamScore, readabilityGrade, wordCount, status, feedbackRating
    } = req.body

    if (!accountId || !contactId || !newsTriggerId || !productId || !subjectLine || !bodyContent) {
      return res.status(400).json({ error: 'Missing required pitch fields' })
    }

    const pitch = repository.createPitch({
      account_id: accountId,
      contact_id: contactId,
      news_trigger_id: newsTriggerId,
      product_id: productId,
      framework: framework || 'PAS',
      tone: tone || 'direct_roi',
      subject_line: subjectLine,
      body_content: bodyContent,
      variants: variants || [],
      spam_score: spamScore || 0,
      readability_grade: readabilityGrade || 0,
      word_count: wordCount || 0,
      status: status || 'draft',
      feedback_rating: feedbackRating || 0,
      created_by: req.user.id
    })

    repository.createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'SAVE_PITCH',
      entityType: 'pitches',
      entityId: pitch.id,
      details: { status: pitch.status, framework: pitch.framework }
    })

    res.status(201).json(pitch)
  })

  router.patch('/pitches/:id', requireAuth, (req, res) => {
    const existing = repository.getPitchById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Pitch not found' })
    }

    // Role check: Only managers and admins can approve pitches
    if (req.body.status === 'approved' && req.user.role === ROLES.SDR_REP) {
      return res.status(403).json({ error: 'Only Sales Managers and Admins can approve pitches' })
    }

    const updates = {}
    if (req.body.subjectLine !== undefined) updates.subject_line = req.body.subjectLine
    if (req.body.bodyContent !== undefined) {
      updates.body_content = req.body.bodyContent
      const spam = QualityEngine.analyzeSpamScore(req.body.bodyContent, req.body.subjectLine || existing.subject_line)
      updates.spam_score = spam.score
      updates.readability_grade = QualityEngine.calculateReadabilityGrade(req.body.bodyContent)
      updates.word_count = QualityEngine.calculateReadingMetrics(req.body.bodyContent).wordCount
    }
    if (req.body.status !== undefined) updates.status = req.body.status
    if (req.body.feedbackRating !== undefined) updates.feedback_rating = req.body.feedbackRating
    if (req.body.variants !== undefined) updates.variants = req.body.variants

    const updated = repository.updatePitch(req.params.id, updates)

    repository.createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: updates.status === 'approved' ? 'APPROVE_PITCH' : 'UPDATE_PITCH',
      entityType: 'pitches',
      entityId: updated.id,
      details: updates
    })

    res.json(updated)
  })

  router.delete('/pitches/:id', requireAuth, requireRole([ROLES.SALES_MANAGER, ROLES.ADMIN]), (req, res) => {
    const success = repository.deletePitch(req.params.id)
    if (!success) {
      return res.status(404).json({ error: 'Pitch not found' })
    }

    repository.createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'DELETE_PITCH',
      entityType: 'pitches',
      entityId: req.params.id,
      details: { deleted: true }
    })

    res.json({ message: 'Pitch deleted successfully' })
  })

  // --- 8. Analytics & Telemetry ---
  router.get('/analytics/kpis', requireAuth, (req, res) => {
    const analytics = repository.getOutreachAnalytics()
    res.json(analytics)
  })

  router.get('/audit-logs', requireAuth, requireRole([ROLES.SALES_MANAGER, ROLES.ADMIN]), (req, res) => {
    const logs = repository.listAuditLogs(parseInt(req.query.limit || '50', 10))
    res.json(logs)
  })

  return router
}
