export const FRAMEWORKS = {
  PAS: {
    id: 'PAS',
    name: 'Problem - Agitate - Solve',
    description: 'Pinpoints scale pain caused by growth, amplifies operational drag, introduces the solution.',
    targetLengthWords: 110
  },
  BAB: {
    id: 'BAB',
    name: 'Before - After - Bridge',
    description: 'Highlights previous friction, envisions seamless scale post-news, bridges with product.',
    targetLengthWords: 120
  },
  AIDA: {
    id: 'AIDA',
    name: 'Attention - Interest - Desire - Action',
    description: 'Hooks with news milestone, sparks interest in market shifts, creates desire via metrics, low-friction CTA.',
    targetLengthWords: 130
  },
  QuickStrike: {
    id: 'QuickStrike',
    name: '3-Sentence High-Impact Strike',
    description: 'Ultra-concise mobile-optimized cold outreach under 70 words.',
    targetLengthWords: 60
  }
}

export const TONES = {
  consultative: {
    id: 'consultative',
    label: 'Consultative Peer',
    adjective: 'thought-partner and advisory'
  },
  direct_roi: {
    id: 'direct_roi',
    label: 'Direct & Quantitative ROI',
    adjective: 'bottom-line and metrics-focused'
  },
  visionary: {
    id: 'visionary',
    label: 'Visionary & Strategic',
    adjective: 'forward-looking and transformative'
  }
}

export const TRIGGER_CATEGORIES = [
  'Funding',
  'Leadership',
  'Product Launch',
  'Expansion',
  'M&A',
  'Partnership'
]

export const SPAM_TRIGGER_WORDS = [
  { word: 'guarantee', weight: 15 },
  { word: 'guaranteed', weight: 15 },
  { word: '100% free', weight: 25 },
  { word: 'risk-free', weight: 20 },
  { word: 'act now', weight: 18 },
  { word: 'urgent', weight: 12 },
  { word: 'exclusive deal', weight: 15 },
  { word: 'make money', weight: 25 },
  { word: 'double your', weight: 20 },
  { word: 'no obligation', weight: 10 },
  { word: 'winner', weight: 25 },
  { word: 'congratulations', weight: 8 },
  { word: 'click here', weight: 20 },
  { word: 'free quote', weight: 15 },
  { word: 'instant access', weight: 12 }
]

export const ROLES = {
  SDR_REP: 'sdr_rep',
  SALES_MANAGER: 'sales_manager',
  ADMIN: 'admin'
}

export const JWT_SECRET = process.env.JWT_SECRET || 'ai-sales-pitch-customizer-dev-secret-key-384820'
export const PORT = process.env.PORT || 4000
