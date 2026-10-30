export class NlpEngine {
  /**
   * Extracts numerical milestones, currency, percentages, and metrics.
   */
  static extractKeyMilestones (text) {
    if (!text) return []
    const milestones = []

    // Financial sums (e.g. $65M, €45M, $120M)
    const moneyMatches = text.match(/(?:\$|€|£)\s*\d+(?:\.\d+)?\s*(?:M|B|K|million|billion)?/gi)
    if (moneyMatches) {
      moneyMatches.forEach(m => {
        if (!milestones.includes(m.trim())) milestones.push(m.trim())
      })
    }

    // Percentages (e.g. 140% YoY, 85% surge, 35% reduction)
    const pctMatches = text.match(/\d+(?:\.\d+)?%/gi)
    if (pctMatches) {
      pctMatches.forEach(p => {
        if (!milestones.includes(p.trim())) milestones.push(p.trim())
      })
    }

    // Quantified scale units (e.g. 200 new hires, 50,000 trucks, 400 clusters)
    const scaleMatches = text.match(/\b\d+(?:,\d+)?\+?\s+(?:new hires|hires|employees|clusters|trucks|corridors|accounts|customers|reps)\b/gi)
    if (scaleMatches) {
      scaleMatches.forEach(s => {
        if (!milestones.includes(s.trim())) milestones.push(s.trim())
      })
    }

    return milestones
  }

  /**
   * Classifies news headline and body into business trigger category.
   */
  static classifyTrigger (title, summary) {
    const combined = `${title || ''} ${summary || ''}`.toLowerCase()

    const categoryKeywords = {
      Funding: ['series a', 'series b', 'series c', 'series d', 'funding', 'raised', 'capital', 'secures', 'valuation', 'investor', 'venture'],
      Leadership: ['chief', 'cro', 'cto', 'ciso', 'coo', 'vp of', 'appoint', 'names', 'executive', 'joins as', 'head of', 'leadership'],
      'Product Launch': ['unveils', 'launches', 'released', 'engine', 'version', 'announces new', 'feature', 'platform rollout', 'beta'],
      'M&A': ['acquisition', 'acquires', 'acquired', 'merger', 'completes buyout', 'purchase of'],
      Expansion: ['expansion', 'expands', 'headquarters', 'emea', 'apac', 'new office', 'zurich', 'surge', 'traffic surge', 'global presence'],
      Partnership: ['partner', 'partners', 'partnership', 'alliance', 'integrates with', 'collaborat']
    }

    let topCategory = 'Expansion'
    let maxMatches = -1

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let count = 0
      keywords.forEach(kw => {
        if (combined.includes(kw)) count++
      })
      if (count > maxMatches) {
        maxMatches = count
        topCategory = category
      }
    }

    return topCategory
  }

  /**
   * Evaluates text sentiment & urgency polarity.
   */
  static evaluateSentiment (title, summary) {
    const combined = `${title || ''} ${summary || ''}`.toLowerCase()

    const urgentKeywords = ['outage', 'surge', 'latency', 'spike', 'bottleneck', 'prevent', 'failure', 'mandate', 'urgent', 'overload', 'downtime']
    const hasUrgency = urgentKeywords.some(kw => combined.includes(kw))

    if (hasUrgency) {
      return 'Urgent'
    }

    const positiveKeywords = ['secures', 'closes', 'accelerate', 'expansion', 'names', 'unveils', 'partners', 'growth', 'milestone', 'completes', 'record']
    const isPositive = positiveKeywords.some(kw => combined.includes(kw))

    return isPositive ? 'Positive' : 'Neutral'
  }

  /**
   * Computes semantic relevance score between product value proposition/pain points
   * and news trigger event (0.0 to 1.0).
   */
  static calculateRelevance (triggerText, product) {
    if (!triggerText || !product) return 0.75

    const triggerTokens = new Set(
      triggerText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
    )

    const productText = `${product.name} ${product.value_prop} ${(product.pain_points || []).join(' ')} ${(product.proof_points || []).join(' ')}`.toLowerCase()
    const productTokens = productText.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)

    let intersections = 0
    productTokens.forEach(token => {
      if (triggerTokens.has(token)) intersections++
    })

    const score = Math.min(0.99, Math.max(0.65, 0.70 + (intersections * 0.04)))
    return Number(score.toFixed(2))
  }
}
