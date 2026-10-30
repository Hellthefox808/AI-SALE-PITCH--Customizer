import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { QualityEngine } from '../src/service/qualityEngine.js'

describe('QualityEngine — Deliverability, Spam & Readability Metrics', () => {
  it('identifies clean cold emails with low baseline spam score', () => {
    const email = 'Hi Julian, noticed the announcement regarding ApexCloud Series C. Scaling multi-cloud architectures often introduces unexpected egress overhead. Would you be open to comparing notes next Tuesday?'
    const result = QualityEngine.analyzeSpamScore(email, 'Quick question on ApexCloud architecture')

    assert.ok(result.score <= 15.0, `Spam score should be low, got ${result.score}`)
    assert.equal(result.level, 'Excellent')
    assert.equal(result.flags.length, 0)
  })

  it('detects high-risk spam keywords and flags them', () => {
    const spammyEmail = 'Act now! 100% free guaranteed winner! Double your money with exclusive deal today!!!'
    const result = QualityEngine.analyzeSpamScore(spammyEmail, 'URGENT EXCLUSIVE DEAL')

    assert.ok(result.score > 35.0, `Spam score should exceed 35, got ${result.score}`)
    assert.equal(result.level, 'High Risk')
    assert.ok(result.flags.length >= 3, 'Should trigger multiple spam flags')
  })

  it('computes Flesch-Kincaid Grade Level within reasonable bounds', () => {
    const text = 'This is a clear, concise email. We help high growth companies scale their cloud systems without latency.'
    const grade = QualityEngine.calculateReadabilityGrade(text)

    assert.ok(grade >= 4.0 && grade <= 9.0, `Grade level should be between 4 and 9, got ${grade}`)
  })

  it('accurately computes word count and reading time', () => {
    const text = 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen.'
    const metrics = QualityEngine.calculateReadingMetrics(text)

    assert.equal(metrics.wordCount, 14)
    assert.ok(metrics.readingTimeSec >= 4)
  })

  it('measures personalization depth ratio', () => {
    const text = 'Hi Diana, congratulations on joining DataPulse. We noticed your focus on scaling Fortune 500 accounts. We help sales teams achieve 3.8x higher response rates.'
    const depth = QualityEngine.calculatePersonalizationDepth(text, 'DataPulse', 'Diana', ['Fortune 500 accounts'])

    assert.ok(depth >= 70, `Personalization depth should be >= 70%, got ${depth}%`)
  })
})
