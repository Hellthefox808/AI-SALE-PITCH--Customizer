import React from 'react'

export function ExecutiveKpiBar ({ kpis = null }) {
  const data = kpis || {
    totalPitches: 0,
    personalizationDepthPct: 94.2,
    avgSpamScore: 10.5,
    avgReadabilityGrade: 7.1,
    repHoursSaved: 0
  }

  const cards = [
    {
      title: 'Pitches Synthesized',
      value: data.totalPitches,
      unit: 'emails',
      badge: '+18% this week',
      badgeClass: 'success',
      icon: '✉️'
    },
    {
      title: 'Personalization Depth',
      value: `${data.personalizationDepthPct}%`,
      unit: 'grounded',
      badge: 'Account-Grounded',
      badgeClass: 'cyan',
      icon: '🎯'
    },
    {
      title: 'Avg Spam Risk Index',
      value: data.avgSpamScore,
      unit: '/ 100',
      badge: data.avgSpamScore <= 15 ? 'Excellent Deliverability' : 'Moderate',
      badgeClass: data.avgSpamScore <= 15 ? 'success' : 'amber',
      icon: '🛡️'
    },
    {
      title: 'Readability Grade',
      value: `Grade ${data.avgReadabilityGrade}`,
      unit: 'Flesch-Kincaid',
      badge: 'Ideal B2B (5-8)',
      badgeClass: 'cyan',
      icon: '📖'
    },
    {
      title: 'Rep Hours Saved',
      value: `${data.repHoursSaved}`,
      unit: 'hours',
      badge: '~45m / pitch',
      badgeClass: 'success',
      icon: '⚡'
    }
  ]

  return (
    <div className='kpi-grid'>
      {cards.map((card, idx) => (
        <div key={idx} className='kpi-card'>
          <div className='kpi-header'>
            <span className='kpi-title'>{card.title}</span>
            <span className='kpi-icon'>{card.icon}</span>
          </div>
          <div className='kpi-value-row'>
            <span className='kpi-value'>{card.value}</span>
            <span className='kpi-unit'>{card.unit}</span>
          </div>
          <span className={`kpi-badge ${card.badgeClass}`}>
            {card.badge}
          </span>
        </div>
      ))}
    </div>
  )
}
