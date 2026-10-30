import { QualityEngine } from './qualityEngine.js'
import { NlpEngine } from './nlpEngine.js'

export class PitchEngine {
  /**
   * Generates a 3-variant pitch suite tailored to account trigger event and product offering.
   */
  static generatePitchSuite ({ account, contact, trigger, product, framework = 'PAS', tone = 'direct_roi' }) {
    const firstName = contact && contact.name ? contact.name.split(' ')[0] : 'there'
    const accountName = account ? account.name : 'your team'
    const newsTitle = trigger ? trigger.title : 'recent milestone'
    const keyFacts = trigger && trigger.key_facts ? trigger.key_facts : NlpEngine.extractKeyMilestones(trigger ? trigger.summary : '')
    const leadFact = keyFacts.length > 0 ? keyFacts[0] : 'recent business expansion'
    const secondFact = keyFacts.length > 1 ? keyFacts[1] : 'scaling momentum'

    const productName = product ? product.name : 'our enterprise solution'
    const productTagline = product ? product.tagline : 'accelerate performance'
    const productProof = product && product.proof_points && product.proof_points.length > 0
      ? product.proof_points[0]
      : '35% efficiency improvement across enterprise deployments'
    const productPain = product && product.pain_points && product.pain_points.length > 0
      ? product.pain_points[0]
      : 'operational bottlenecks and unexpected infrastructure costs'

    // Generate 3 distinct variants
    const variantA = PitchEngine.buildVariant({
      variantId: 'A',
      styleName: 'Direct & Quantitative ROI',
      framework,
      tone: 'direct_roi',
      firstName,
      accountName,
      newsTitle,
      leadFact,
      secondFact,
      productName,
      productTagline,
      productProof,
      productPain
    })

    const variantB = PitchEngine.buildVariant({
      variantId: 'B',
      styleName: 'Consultative Peer',
      framework,
      tone: 'consultative',
      firstName,
      accountName,
      newsTitle,
      leadFact,
      secondFact,
      productName,
      productTagline,
      productProof,
      productPain
    })

    const variantC = PitchEngine.buildVariant({
      variantId: 'C',
      styleName: 'Visionary & Strategic',
      framework,
      tone: 'visionary',
      firstName,
      accountName,
      newsTitle,
      leadFact,
      secondFact,
      productName,
      productTagline,
      productProof,
      productPain
    })

    // Pick recommended default variant based on requested tone
    const defaultVariant = tone === 'consultative' ? variantB : tone === 'visionary' ? variantC : variantA

    return {
      framework,
      tone,
      recommendedVariant: defaultVariant.variantId,
      subjectLine: defaultVariant.subjectLine,
      bodyContent: defaultVariant.body,
      variants: [variantA, variantB, variantC],
      spamScore: defaultVariant.spamScore,
      readabilityGrade: defaultVariant.readabilityGrade,
      wordCount: defaultVariant.wordCount,
      readingTimeSec: defaultVariant.readingTimeSec,
      personalizationDepthPct: defaultVariant.personalizationDepthPct
    }
  }

  static buildVariant ({
    variantId,
    styleName,
    framework,
    tone,
    firstName,
    accountName,
    newsTitle,
    leadFact,
    secondFact,
    productName,
    productTagline,
    productProof,
    productPain
  }) {
    let subjectLine = ''
    let body = ''

    if (framework === 'PAS') {
      if (tone === 'direct_roi') {
        subjectLine = `Quick question on ${accountName}'s ${leadFact}`
        body = `Hi ${firstName},\n\nSaw the announcement regarding "${newsTitle}"—congratulations to the ${accountName} team on ${leadFact}.\n\nAs you leverage this milestone to scale, teams frequently encounter ${productPain.toLowerCase()}.\n\n${productName} was engineered specifically to solve this. We deliver ${productProof.toLowerCase()}, ensuring growth doesn't erode operating margins.\n\nOpen to a brief 10-minute briefing next Tuesday to explore how this applies to ${accountName}?`
      } else if (tone === 'consultative') {
        subjectLine = `${firstName} - thoughts on ${accountName}'s ${leadFact}`
        body = `Hi ${firstName},\n\nWanted to reach out following your team's milestone around "${newsTitle}". Noticed your focus on ${secondFact.toLowerCase()}.\n\nWhen scaling through this phase, infrastructure leads often navigate subtle friction around ${productPain.toLowerCase()}.\n\nWe recently partnered with peer leaders on this exact curve, achieving ${productProof.toLowerCase()}.\n\nCurious how your engineering leads are approaching this today? Open to trading notes.`
      } else {
        subjectLine = `${accountName}'s next phase: scaling ${leadFact}`
        body = `Hi ${firstName},\n\n"${newsTitle}" marks an exciting strategic inflection for ${accountName}.\n\nSustaining rapid category leadership requires preempting ${productPain.toLowerCase()} before it impacts customer velocity.\n\n${productName} provides the foundation for ${productTagline.toLowerCase()}, proven with ${productProof.toLowerCase()}.\n\nWould it make sense to explore what this roadmap looks like for ${accountName}?`
      }
    } else if (framework === 'BAB') {
      if (tone === 'direct_roi') {
        subjectLine = `Scaling past ${leadFact} at ${accountName}`
        body = `Hi ${firstName},\n\nBefore ${accountName}'s recent milestone ("${newsTitle}"), managing ${productPain.toLowerCase()} required significant manual toil.\n\nWith ${leadFact} in place, the ideal scenario is effortless scale and predictable performance without ballooning overhead.\n\n${productName} is the bridge: we provide ${productProof.toLowerCase()} with zero operational downtime.\n\nDo you have 10 minutes next Wednesday to see the live metrics?`
      } else if (tone === 'consultative') {
        subjectLine = `Navigating post-${leadFact} scale at ${accountName}`
        body = `Hi ${firstName},\n\nCongratulations on "${newsTitle}". Scaling through ${leadFact} typically marks the transition from reactive fixes to proactive architecture.\n\nImagine having total visibility and eliminating ${productPain.toLowerCase()} autonomously across every cluster.\n\nWe built ${productName} to act as that bridge, validated by ${productProof.toLowerCase()}.\n\nWould you be open to comparing benchmarks with how peers are handling this?`
      } else {
        subjectLine = `The bridge to ${accountName}'s next chapter`
        body = `Hi ${firstName},\n\nWith ${leadFact} now established via "${newsTitle}", ${accountName} is positioned for transformative enterprise growth.\n\nThe next competitive frontier is operational excellence—eliminating ${productPain.toLowerCase()} to outpace market rivals.\n\n${productName} provides the bridge with ${productProof.toLowerCase()}.\n\nWorth a brief strategic exchange on how this aligns with your priorities?`
      }
    } else if (framework === 'AIDA') {
      if (tone === 'direct_roi') {
        subjectLine = `Idea for ${firstName} following ${accountName}'s ${leadFact}`
        body = `Hi ${firstName},\n\nAttention: Noticed the news that "${newsTitle}"—huge milestone for ${accountName}.\n\nInterest: Market shifts after ${leadFact} mean enterprise buyers demand zero latency and rock-solid reliability.\n\nDesire: With ${productName}, peer teams achieved ${productProof.toLowerCase()} while eliminating ${productPain.toLowerCase()}.\n\nAction: Could we put 10 minutes on the calendar this Thursday to share the blueprint?`
      } else if (tone === 'consultative') {
        subjectLine = `Congratulations on ${leadFact} + thoughts for ${firstName}`
        body = `Hi ${firstName},\n\nCatching up on industry developments and saw "${newsTitle}". Stellar progress on ${leadFact}.\n\nAs you ramp up ${secondFact.toLowerCase()}, keeping overhead disciplined while dodging ${productPain.toLowerCase()} is top of mind for most leaders.\n\nWe helped similar organizations achieve ${productProof.toLowerCase()}.\n\nWould you be open to a quick 10-minute coffee chat next week?`
      } else {
        subjectLine = `Transforming ${accountName} post-${leadFact}`
        body = `Hi ${firstName},\n\n"${newsTitle}" puts ${accountName} in an enviable market position.\n\nAs enterprise expectations intensify, the leaders who win will turn ${productPain.toLowerCase()} into a competitive advantage.\n\n${productName} enables this with ${productProof.toLowerCase()}.\n\nLet's connect for 10 minutes to examine the architectural parallels.`
      }
    } else {
      // QuickStrike (3-sentence)
      if (tone === 'direct_roi') {
        subjectLine = `Quick question re: ${accountName}'s ${leadFact}`
        body = `Hi ${firstName},\n\nSaw "${newsTitle}"—congrats on ${leadFact}.\n\nWe recently helped similar teams achieve ${productProof.toLowerCase()} while wiping out ${productPain.toLowerCase()}.\n\nWorth a brief 10-minute briefing next week to see if this moves the needle for ${accountName}?`
      } else if (tone === 'consultative') {
        subjectLine = `Question for ${firstName} on ${accountName} milestone`
        body = `Hi ${firstName},\n\nImpressive progress with "${newsTitle}" and ${leadFact}.\n\nPeer infrastructure leaders we advise have used our platform to achieve ${productProof.toLowerCase()} without complex rollouts.\n\nCurious if you're open to a brief peer exchange on how to tackle ${productPain.toLowerCase()} as you scale?`
      } else {
        subjectLine = `${firstName} - ${accountName}'s momentum`
        body = `Hi ${firstName},\n\n"${newsTitle}" is a fantastic milestone for ${accountName}.\n\nOur platform accelerates this growth trajectory, delivering ${productProof.toLowerCase()}.\n\nWould you be against a 10-minute conversation to see how this fits your 2027 vision?`
      }
    }

    const spamAnalysis = QualityEngine.analyzeSpamScore(body, subjectLine)
    const readabilityGrade = QualityEngine.calculateReadabilityGrade(body)
    const { wordCount, readingTimeSec } = QualityEngine.calculateReadingMetrics(body)
    const personalizationDepthPct = QualityEngine.calculatePersonalizationDepth(body, accountName, firstName, [leadFact, secondFact])

    return {
      variantId,
      styleName,
      subjectLine,
      body,
      spamScore: spamAnalysis.score,
      spamFlags: spamAnalysis.flags,
      spamLevel: spamAnalysis.level,
      readabilityGrade,
      wordCount,
      readingTimeSec,
      personalizationDepthPct
    }
  }
}
