import { QualityEngine } from './qualityEngine.js'

export class CadenceEngine {
  /**
   * Generates a 4-step B2B outreach cadence based on account trigger and product value prop.
   * Step 1 (Day 1): Initial Trigger Hook & Value Prop
   * Step 2 (Day 3): Tactical Value Drop & Peer Benchmark
   * Step 3 (Day 7): Social Proof & Specific Case Study Angle
   * Step 4 (Day 11): Low-Pressure Graceful Exit ("Breakup" Email)
   */
  static generateCadence ({ account, contact, trigger, product, primaryVariant }) {
    const firstName = contact && contact.name ? contact.name.split(' ')[0] : 'there'
    const accountName = account ? account.name : 'your team'
    const leadFact = trigger && trigger.key_facts && trigger.key_facts.length > 0
      ? trigger.key_facts[0]
      : 'recent milestone'
    const productName = product ? product.name : 'our platform'
    const productProof = product && product.proof_points && product.proof_points.length > 0
      ? product.proof_points[0]
      : '35% operating efficiency improvement'
    const productPain = product && product.pain_points && product.pain_points.length > 0
      ? product.pain_points[0]
      : 'infrastructure scaling friction'

    const touch1 = {
      step: 1,
      day: 'Day 1',
      channel: 'Email',
      label: 'The Catalyst Hook',
      subjectLine: primaryVariant?.subjectLine || `Quick question on ${accountName}'s ${leadFact}`,
      body: primaryVariant?.body || `Hi ${firstName},\n\nNoticed ${accountName}'s milestone around ${leadFact}. Scaling through this phase often introduces ${productPain.toLowerCase()}.\n\nWe built ${productName} to solve this, delivering ${productProof.toLowerCase()}.\n\nOpen to a brief 10-minute briefing next week?`
    }

    const touch2 = {
      step: 2,
      day: 'Day 3',
      channel: 'Email (Thread Reply)',
      label: 'The Tactical Value Asset',
      subjectLine: `Re: ${touch1.subjectLine}`,
      body: `Hi ${firstName},\n\nFollowing up on my note regarding ${leadFact} at ${accountName}.\n\nThought you might find this benchmark calculation useful. When engineering teams double capacity, preempting ${productPain.toLowerCase()} saves 14 hours per engineer monthly.\n\nHere is a 1-page blueprint on peer setups: https://${account?.domain || 'apexcloud.io'}/resource/blueprint\n\nWorth a quick 5-minute glance?`
    }

    const touch3 = {
      step: 3,
      day: 'Day 7',
      channel: 'Email / LinkedIn',
      label: 'Peer Social Proof & Evidence',
      subjectLine: `How similar engineering leads handled ${productPain.toLowerCase()}`,
      body: `Hi ${firstName},\n\nWanted to share a quick peer parallel. A leading ${account?.industry || 'enterprise SaaS'} team navigating identical growth after their expansion leveraged ${productName} to achieve ${productProof.toLowerCase()} in under 30 days.\n\nThey completely eliminated ${productPain.toLowerCase()} with zero downtime.\n\nDo you have 10 minutes this Thursday afternoon to compare their rollout against ${accountName}'s current setup?`
    }

    const touch4 = {
      step: 4,
      day: 'Day 11',
      channel: 'Email (Closing Note)',
      label: 'Low-Pressure Graceful Exit',
      subjectLine: `Permission to close file? Re: ${accountName}`,
      body: `Hi ${firstName},\n\nI imagine you are completely immersed in executing ${accountName}'s post-${leadFact} priorities right now.\n\nI will pause outreach so I don't clutter your inbox. If solving ${productPain.toLowerCase()} becomes a priority later this quarter, feel free to reach back out.\n\nWishing you and the ${accountName} team continued momentum.`
    }

    const steps = [touch1, touch2, touch3, touch4].map(s => {
      const spamAnalysis = QualityEngine.analyzeSpamScore(s.body, s.subjectLine)
      const readability = QualityEngine.calculateReadabilityGrade(s.body)
      const metrics = QualityEngine.calculateReadingMetrics(s.body)
      return {
        ...s,
        spamScore: spamAnalysis.score,
        spamLevel: spamAnalysis.level,
        readabilityGrade: readability,
        wordCount: metrics.wordCount,
        readingTimeSec: metrics.readingTimeSec
      }
    })

    return {
      totalTouches: steps.length,
      estimatedCadenceDays: 11,
      steps
    }
  }
}
