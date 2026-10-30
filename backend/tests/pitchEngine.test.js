import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PitchEngine } from '../src/service/pitchEngine.js'

describe('PitchEngine — Multi-Framework & 3-Variant Pitch Synthesis', () => {
  const mockAccount = {
    id: 'acc-1',
    name: 'ApexCloud Networks',
    domain: 'apexcloud.io'
  }

  const mockContact = {
    id: 'con-1',
    name: 'Julian Hayes',
    title: 'VP of Infrastructure',
    email: 'j.hayes@apexcloud.io'
  }

  const mockTrigger = {
    id: 'trg-1',
    title: 'ApexCloud Secures $65M Series C to Accelerate Multi-Cloud Mesh',
    summary: 'Funding led by Horizon Ventures with 140% YoY ARR growth and doubling EMEA team.',
    key_facts: ['$65M Series C', 'Doubling EMEA engineering team']
  }

  const mockProduct = {
    id: 'prod-1',
    name: 'HyperScale Cloud Optimizer',
    tagline: 'Autonomous Multi-Cloud Efficiency',
    value_prop: 'Slashing AWS/GCP bills by 35% while eliminating database latency.',
    pain_points: ['Unpredictable cloud spend after rapid scaling'],
    proof_points: ['35% average compute bill reduction in 30 days']
  }

  it('generates 3 distinct variants across PAS framework', () => {
    const suite = PitchEngine.generatePitchSuite({
      account: mockAccount,
      contact: mockContact,
      trigger: mockTrigger,
      product: mockProduct,
      framework: 'PAS',
      tone: 'direct_roi'
    })

    assert.equal(suite.framework, 'PAS')
    assert.equal(suite.variants.length, 3)
    assert.equal(suite.recommendedVariant, 'A')

    const variantA = suite.variants.find(v => v.variantId === 'A')
    const variantB = suite.variants.find(v => v.variantId === 'B')
    const variantC = suite.variants.find(v => v.variantId === 'C')

    assert.ok(variantA.body.includes('Julian'), 'Should address recipient')
    assert.ok(variantA.body.includes('ApexCloud'), 'Should mention account name')
    assert.ok(variantA.body.includes('$65M Series C'), 'Should reference trigger lead fact')
    assert.ok(variantA.spamScore <= 20, 'Spam score should remain low')

    assert.notEqual(variantA.body, variantB.body, 'Variants should have distinct copywriting')
    assert.notEqual(variantB.body, variantC.body, 'Variants should have distinct copywriting')
  })

  it('generates BAB framework with before/after/bridge contrast', () => {
    const suite = PitchEngine.generatePitchSuite({
      account: mockAccount,
      contact: mockContact,
      trigger: mockTrigger,
      product: mockProduct,
      framework: 'BAB',
      tone: 'consultative'
    })

    assert.equal(suite.framework, 'BAB')
    assert.equal(suite.recommendedVariant, 'B')
    assert.ok(suite.bodyContent.toLowerCase().includes('bridge') || suite.bodyContent.toLowerCase().includes('scaling'))
  })

  it('generates QuickStrike 3-sentence concise cold email', () => {
    const suite = PitchEngine.generatePitchSuite({
      account: mockAccount,
      contact: mockContact,
      trigger: mockTrigger,
      product: mockProduct,
      framework: 'QuickStrike',
      tone: 'direct_roi'
    })

    assert.equal(suite.framework, 'QuickStrike')
    assert.ok(suite.wordCount <= 75, `Quick strike should be under 75 words, got ${suite.wordCount}`)
  })
})
