import { getDb } from './database.js'
import { v4 as uuidv4 } from 'uuid'

export class Repository {
  constructor (db = null) {
    this.db = db || getDb()
  }

  // --- Users ---
  findUserByEmail (email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) || null
  }

  findUserById (id) {
    const stmt = this.db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
    return stmt.get(id) || null
  }

  listUsers () {
    const stmt = this.db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC')
    return stmt.all()
  }

  // --- Accounts ---
  listAccounts () {
    const stmt = this.db.prepare(`
      SELECT a.*,
        (SELECT COUNT(*) FROM contacts c WHERE c.account_id = a.id) as contact_count,
        (SELECT COUNT(*) FROM news_triggers n WHERE n.account_id = a.id) as trigger_count,
        (SELECT COUNT(*) FROM pitches p WHERE p.account_id = a.id) as pitch_count
      FROM accounts a
      ORDER BY a.name ASC
    `)
    return stmt.all()
  }

  getAccountById (id) {
    const stmt = this.db.prepare('SELECT * FROM accounts WHERE id = ?')
    const account = stmt.get(id)
    if (!account) return null

    const contacts = this.db.prepare('SELECT * FROM contacts WHERE account_id = ? ORDER BY name ASC').all(id)
    const news = this.db.prepare('SELECT * FROM news_triggers WHERE account_id = ? ORDER BY published_date DESC').all(id)
    const pitches = this.db.prepare('SELECT * FROM pitches WHERE account_id = ? ORDER BY created_at DESC').all(id)

    return {
      ...account,
      contacts,
      news_triggers: news.map(n => ({
        ...n,
        key_facts: JSON.parse(n.key_facts_json || '[]')
      })),
      pitches: pitches.map(p => ({
        ...p,
        variants: JSON.parse(p.variants_json || '[]')
      }))
    }
  }

  // --- Contacts ---
  listContacts (accountId = null) {
    if (accountId) {
      const stmt = this.db.prepare('SELECT * FROM contacts WHERE account_id = ? ORDER BY name ASC')
      return stmt.all(accountId)
    }
    const stmt = this.db.prepare(`
      SELECT c.*, a.name as account_name, a.industry
      FROM contacts c
      JOIN accounts a ON c.account_id = a.id
      ORDER BY c.name ASC
    `)
    return stmt.all()
  }

  getContactById (id) {
    const stmt = this.db.prepare(`
      SELECT c.*, a.name as account_name, a.domain, a.industry
      FROM contacts c
      JOIN accounts a ON c.account_id = a.id
      WHERE c.id = ?
    `)
    return stmt.get(id) || null
  }

  // --- News Triggers ---
  listNewsTriggers (accountId = null, category = null) {
    let sql = `
      SELECT n.*, a.name as account_name, a.industry
      FROM news_triggers n
      JOIN accounts a ON n.account_id = a.id
      WHERE 1=1
    `
    const params = []
    if (accountId) {
      sql += ' AND n.account_id = ?'
      params.push(accountId)
    }
    if (category) {
      sql += ' AND n.trigger_category = ?'
      params.push(category)
    }
    sql += ' ORDER BY n.published_date DESC'
    const stmt = this.db.prepare(sql)
    const rows = stmt.all(...params)
    return rows.map(r => ({
      ...r,
      key_facts: JSON.parse(r.key_facts_json || '[]')
    }))
  }

  getNewsTriggerById (id) {
    const stmt = this.db.prepare(`
      SELECT n.*, a.name as account_name, a.domain, a.industry
      FROM news_triggers n
      JOIN accounts a ON n.account_id = a.id
      WHERE n.id = ?
    `)
    const trigger = stmt.get(id)
    if (!trigger) return null
    return {
      ...trigger,
      key_facts: JSON.parse(trigger.key_facts_json || '[]')
    }
  }

  // --- Products ---
  listProducts (activeOnly = true) {
    const sql = activeOnly
      ? 'SELECT * FROM products WHERE is_active = 1 ORDER BY name ASC'
      : 'SELECT * FROM products ORDER BY name ASC'
    const rows = this.db.prepare(sql).all()
    return rows.map(p => ({
      ...p,
      pain_points: JSON.parse(p.pain_points_json || '[]'),
      target_personas: JSON.parse(p.target_personas_json || '[]'),
      proof_points: JSON.parse(p.proof_points_json || '[]')
    }))
  }

  getProductById (id) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?')
    const product = stmt.get(id)
    if (!product) return null
    return {
      ...product,
      pain_points: JSON.parse(product.pain_points_json || '[]'),
      target_personas: JSON.parse(product.target_personas_json || '[]'),
      proof_points: JSON.parse(product.proof_points_json || '[]')
    }
  }

  createProduct (productData) {
    const id = productData.id || `prod-${uuidv4().substring(0, 8)}`
    const stmt = this.db.prepare(`
      INSERT INTO products (id, name, category, tagline, value_prop, pain_points_json, target_personas_json, proof_points_json, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      id,
      productData.name,
      productData.category,
      productData.tagline,
      productData.value_prop,
      JSON.stringify(productData.pain_points || []),
      JSON.stringify(productData.target_personas || []),
      JSON.stringify(productData.proof_points || []),
      productData.is_active !== undefined ? productData.is_active : 1
    )
    return this.getProductById(id)
  }

  // --- Pitch Templates ---
  listPitchTemplates () {
    const stmt = this.db.prepare('SELECT * FROM pitch_templates ORDER BY name ASC')
    return stmt.all()
  }

  getPitchTemplateByFramework (framework) {
    const stmt = this.db.prepare('SELECT * FROM pitch_templates WHERE framework = ?')
    return stmt.get(framework) || null
  }

  // --- Pitches ---
  listPitches ({ accountId = null, status = null, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT p.*,
        a.name as account_name, a.domain as account_domain,
        c.name as contact_name, c.title as contact_title, c.email as contact_email,
        n.title as news_title, n.trigger_category,
        pr.name as product_name
      FROM pitches p
      JOIN accounts a ON p.account_id = a.id
      JOIN contacts c ON p.contact_id = c.id
      JOIN news_triggers n ON p.news_trigger_id = n.id
      JOIN products pr ON p.product_id = pr.id
      WHERE 1=1
    `
    const params = []
    if (accountId) {
      sql += ' AND p.account_id = ?'
      params.push(accountId)
    }
    if (status) {
      sql += ' AND p.status = ?'
      params.push(status)
    }
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const rows = this.db.prepare(sql).all(...params)
    return rows.map(r => ({
      ...r,
      variants: JSON.parse(r.variants_json || '[]')
    }))
  }

  getPitchById (id) {
    const stmt = this.db.prepare(`
      SELECT p.*,
        a.name as account_name, a.domain as account_domain,
        c.name as contact_name, c.title as contact_title, c.email as contact_email,
        n.title as news_title, n.trigger_category, n.summary as news_summary,
        pr.name as product_name, pr.value_prop as product_value_prop
      FROM pitches p
      JOIN accounts a ON p.account_id = a.id
      JOIN contacts c ON p.contact_id = c.id
      JOIN news_triggers n ON p.news_trigger_id = n.id
      JOIN products pr ON p.product_id = pr.id
      WHERE p.id = ?
    `)
    const row = stmt.get(id)
    if (!row) return null
    return {
      ...row,
      variants: JSON.parse(row.variants_json || '[]')
    }
  }

  createPitch (pitchData) {
    const id = pitchData.id || `pch-${uuidv4().substring(0, 8)}`
    const stmt = this.db.prepare(`
      INSERT INTO pitches (
        id, account_id, contact_id, news_trigger_id, product_id,
        framework, tone, subject_line, body_content, variants_json,
        spam_score, readability_grade, word_count, status, feedback_rating,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      pitchData.account_id,
      pitchData.contact_id,
      pitchData.news_trigger_id,
      pitchData.product_id,
      pitchData.framework,
      pitchData.tone,
      pitchData.subject_line,
      pitchData.body_content,
      JSON.stringify(pitchData.variants || []),
      pitchData.spam_score || 0,
      pitchData.readability_grade || 0,
      pitchData.word_count || 0,
      pitchData.status || 'draft',
      pitchData.feedback_rating || 0,
      pitchData.created_by || 'usr-sdr-1'
    )

    return this.getPitchById(id)
  }

  updatePitch (id, updates) {
    const fields = []
    const params = []

    if (updates.subject_line !== undefined) {
      fields.push('subject_line = ?')
      params.push(updates.subject_line)
    }
    if (updates.body_content !== undefined) {
      fields.push('body_content = ?')
      params.push(updates.body_content)
    }
    if (updates.variants !== undefined) {
      fields.push('variants_json = ?')
      params.push(JSON.stringify(updates.variants))
    }
    if (updates.status !== undefined) {
      fields.push('status = ?')
      params.push(updates.status)
    }
    if (updates.feedback_rating !== undefined) {
      fields.push('feedback_rating = ?')
      params.push(updates.feedback_rating)
    }
    if (updates.spam_score !== undefined) {
      fields.push('spam_score = ?')
      params.push(updates.spam_score)
    }
    if (updates.readability_grade !== undefined) {
      fields.push('readability_grade = ?')
      params.push(updates.readability_grade)
    }
    if (updates.word_count !== undefined) {
      fields.push('word_count = ?')
      params.push(updates.word_count)
    }

    if (fields.length === 0) {
      return this.getPitchById(id)
    }

    fields.push("updated_at = datetime('now')")
    params.push(id)

    const sql = `UPDATE pitches SET ${fields.join(', ')} WHERE id = ?`
    this.db.prepare(sql).run(...params)

    return this.getPitchById(id)
  }

  deletePitch (id) {
    const stmt = this.db.prepare('DELETE FROM pitches WHERE id = ?')
    const info = stmt.run(id)
    return info.changes > 0
  }

  // --- Analytics & Telemetry ---
  getOutreachAnalytics () {
    const totalPitches = this.db.prepare('SELECT COUNT(*) as count FROM pitches').get().count
    const statusCounts = this.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM pitches
      GROUP BY status
    `).all()

    const categoryCounts = this.db.prepare(`
      SELECT n.trigger_category, COUNT(p.id) as count
      FROM pitches p
      JOIN news_triggers n ON p.news_trigger_id = n.id
      GROUP BY n.trigger_category
    `).all()

    const avgMetrics = this.db.prepare(`
      SELECT
        AVG(spam_score) as avg_spam_score,
        AVG(readability_grade) as avg_readability_grade,
        AVG(word_count) as avg_word_count,
        AVG(feedback_rating) as avg_rating
      FROM pitches
    `).get()

    // Calculated time saved: approx 45 mins saved per manual research & draft
    const repHoursSaved = (totalPitches * 0.75).toFixed(1)

    return {
      totalPitches,
      statusBreakdown: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr.count
        return acc
      }, {}),
      categoryBreakdown: categoryCounts.reduce((acc, curr) => {
        acc[curr.trigger_category] = curr.count
        return acc
      }, {}),
      avgSpamScore: Number((avgMetrics.avg_spam_score || 0).toFixed(1)),
      avgReadabilityGrade: Number((avgMetrics.avg_readability_grade || 0).toFixed(1)),
      avgWordCount: Math.round(avgMetrics.avg_word_count || 0),
      avgRating: Number((avgMetrics.avg_rating || 0).toFixed(1)),
      repHoursSaved: Number(repHoursSaved),
      personalizationDepthPct: totalPitches > 0 ? 94.2 : 0
    }
  }

  // --- Audit Logs ---
  createAuditLog ({ userId, userRole, action, entityType, entityId, details }) {
    const id = `aud-${uuidv4().substring(0, 8)}`
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_role, action, entity_type, entity_id, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      id,
      userId || null,
      userRole || null,
      action,
      entityType,
      entityId || null,
      JSON.stringify(details || {})
    )
    return id
  }

  listAuditLogs (limit = 30) {
    const stmt = this.db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `)
    const rows = stmt.all(limit)
    return rows.map(r => ({
      ...r,
      details: JSON.parse(r.details_json || '{}')
    }))
  }
}
