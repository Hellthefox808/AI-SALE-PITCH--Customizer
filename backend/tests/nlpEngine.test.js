import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { NlpEngine } from '../src/service/nlpEngine.js'

describe('NlpEngine — Entity Extraction & Trigger Classification', () => {
  it('extracts currency sums, percentages, and headcount milestones', () => {
    const text = 'Acme closed a $45M Series B round with 120% YoY growth and plans 150 new hires in Berlin.'
    const milestones = NlpEngine.extractKeyMilestones(text)

    assert.ok(milestones.some(m => m.includes('$45M')), 'Should extract $45M')
    assert.ok(milestones.some(m => m.includes('120%')), 'Should extract 120%')
    assert.ok(milestones.some(m => m.includes('150 new hires')), 'Should extract 150 new hires')
  })

  it('correctly classifies funding triggers', () => {
    const category = NlpEngine.classifyTrigger(
      'CloudScale Secures $80M Series C Funding to Power AI Workloads',
      'Lead investor Sequoia Capital participated in the round.'
    )
    assert.equal(category, 'Funding')
  })

  it('correctly classifies leadership appointments', () => {
    const category = NlpEngine.classifyTrigger(
      'SaaSMetric Names Sarah Connor as Chief Revenue Officer',
      'Connor joins as CRO to scale the global enterprise team.'
    )
    assert.equal(category, 'Leadership')
  })

  it('correctly classifies product launches', () => {
    const category = NlpEngine.classifyTrigger(
      'CyberShield Unveils Real-Time Autonomous Threat Isolation Engine 4.0',
      'The new release delivers zero-trust lateral protection.'
    )
    assert.equal(category, 'Product Launch')
  })

  it('correctly identifies urgency sentiment in latency spikes or outages', () => {
    const sentiment = NlpEngine.evaluateSentiment(
      'RetailHub Experiences Critical Checkout Latency Spike During Peak Surge',
      'Management initiates cloud modernization mandate to prevent further outages.'
    )
    assert.equal(sentiment, 'Urgent')
  })

  it('computes positive semantic relevance between product value and trigger', () => {
    const product = {
      name: 'HyperScale Cloud Optimizer',
      value_prop: 'Slashing AWS/GCP cloud bills by 35% and eliminating latency degradation during traffic surges.',
      pain_points: ['Unpredictable cloud spend', 'Latency spikes during surges'],
      proof_points: ['35% compute bill reduction']
    }
    const score = NlpEngine.calculateRelevance(
      'RetailHub experiences traffic surge and cloud latency bottlenecks',
      product
    )
    assert.ok(score >= 0.75, `Relevance score should be >= 0.75, got ${score}`)
  })
})
