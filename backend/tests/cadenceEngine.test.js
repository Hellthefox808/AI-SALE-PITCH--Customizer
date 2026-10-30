import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CadenceEngine } from '../src/service/cadenceEngine.js'

describe('CadenceEngine — Multi-Touch Outreach Sequence Synthesis', () => {
  const mockAccount = {
    id: 'acc-1',
    name: 'ApexCloud Networks',
    domain: 'apexcloud.io',
    industry: 'Cloud Infrastructure'
  }

  const mockContact = {
    id: 'con-1',
    name: 'Julian Hayes',
    title: 'VP of Infrastructure',
    email: 'j.hayes@apexcloud.io'
  }

  const mockTrigger = {
    id: 'trg-1',
    title: 'ApexCloud Secures $65M Series C',
    key_facts: ['$65M Series C', 'Doubling EMEA engineering team']
  }

  const mockProduct = {
    id: 'prod-1',
    name: 'HyperScale Cloud Optimizer',
    value_prop: 'Slashing cloud spend by 35% without latency.',
    pain_points: ['Unpredictable cloud spend after rapid scaling'],
    proof_points: ['35% compute bill reduction in 30 days']
  }

  it('synthesizes a 4-step omnichannel cadence with progressive value touches', () => {
    const cadence = CadenceEngine.generateCadence({
      account: mockAccount,
      contact: mockContact,
      trigger: mockTrigger,
      product: mockProduct,
      primaryVariant: {
        subjectLine: "Quick question on ApexCloud's $65M Series C",
        body: 'Hi Julian, congrats on the Series C announcement.'
      }
    })

    assert.equal(cadence.totalTouches, 4)
    assert.equal(cadence.estimatedCadenceDays, 11)
    assert.equal(cadence.steps.length, 4)

    const [t1, t2, t3, t4] = cadence.steps

    assert.equal(t1.step, 1)
    assert.equal(t1.day, 'Day 1')
    assert.equal(t2.step, 2)
    assert.equal(t2.day, 'Day 3')
    assert.ok(t2.body.includes('benchmark calculation') || t2.body.includes('blueprint'))

    assert.equal(t3.step, 3)
    assert.equal(t3.day, 'Day 7')
    assert.ok(t3.body.includes('peer parallel') || t3.body.includes('case study'))

    assert.equal(t4.step, 4)
    assert.equal(t4.day, 'Day 11')
    assert.ok(t4.subjectLine.includes('Permission to close file?'))

    cadence.steps.forEach(step => {
      assert.ok(step.spamScore <= 20, `Step ${step.step} spam score should be low, got ${step.spamScore}`)
      assert.ok(step.readabilityGrade >= 3.0 && step.readabilityGrade <= 14.0, `Readability grade should be between 3 and 14, got ${step.readabilityGrade}`)
    })
  })
})
