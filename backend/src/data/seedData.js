import bcrypt from 'bcryptjs'

export async function seedDatabase (db) {
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get()
  if (userCheck.count > 0) {
    return
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash('password123', saltRounds)

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `)

  insertUser.run('usr-sdr-1', 'Sarah Connor', 'sdr@pitchcraft.io', passwordHash, 'sdr_rep')
  insertUser.run('usr-mgr-1', 'Marcus Vance', 'manager@pitchcraft.io', passwordHash, 'sales_manager')
  insertUser.run('usr-adm-1', 'Elena Rostova', 'admin@pitchcraft.io', passwordHash, 'admin')

  // 2. Accounts
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, domain, industry, size, hq_location, annual_revenue, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertAccount.run('acc-1', 'ApexCloud Networks', 'apexcloud.io', 'Cloud Infrastructure', '1,200 employees', 'San Francisco, CA', '$85M ARR', 'Distributed cloud networking and edge compute fabric provider.')
  insertAccount.run('acc-2', 'DataPulse Analytics', 'datapulse.ai', 'Enterprise Big Data & AI', '450 employees', 'New York, NY', '$38M ARR', 'Real-time telemetry and predictive data warehouse intelligence.')
  insertAccount.run('acc-3', 'SecureShield Cyber', 'secureshield.com', 'Cybersecurity', '800 employees', 'Austin, TX', '$62M ARR', 'Autonomous endpoint security and zero-trust perimeter defense.')
  insertAccount.run('acc-4', 'FinFlow Payments', 'finflowpay.com', 'FinTech & Banking', '2,500 employees', 'Boston, MA', '$210M ARR', 'Global multi-currency checkout rail and real-time fraud mitigation platform.')
  insertAccount.run('acc-5', 'BioGenix Pharma', 'biogenixlabs.org', 'Life Sciences & Biotech', '3,200 employees', 'Cambridge, MA', '$420M Revenue', 'Precision genomics pipelines and clinical drug trial computational models.')
  insertAccount.run('acc-6', 'OmniRetail Global', 'omniretail.store', 'E-Commerce & Retail Tech', '5,000 employees', 'Seattle, WA', '$680M GMV', 'Unified headless commerce engine powering omnichannel retail brands.')
  insertAccount.run('acc-7', 'LogixSupply', 'logixsupply.io', 'Logistics & Supply Chain', '950 employees', 'Chicago, IL', '$74M ARR', 'Autonomous freight intelligence and multimodal shipping routing software.')
  insertAccount.run('acc-8', 'ScaleOps Dev', 'scaleops.dev', 'Developer Tooling', '350 employees', 'Denver, CO', '$24M ARR', 'Cloud-native Kubernetes efficiency and developer platform engineering tools.')

  // 3. Contacts
  const insertContact = db.prepare(`
    INSERT INTO contacts (id, account_id, name, title, email, linkedin_url, persona_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  insertContact.run('con-1', 'acc-1', 'Julian Hayes', 'VP of Cloud Infrastructure', 'j.hayes@apexcloud.io', 'https://linkedin.com/in/julianhayes-cloud', 'Decision Maker')
  insertContact.run('con-2', 'acc-1', 'Maya Lin', 'Director of DevOps & SRE', 'm.lin@apexcloud.io', 'https://linkedin.com/in/mayalin-devops', 'Champion')
  insertContact.run('con-3', 'acc-2', 'Diana Chen', 'Chief Revenue Officer', 'd.chen@datapulse.ai', 'https://linkedin.com/in/dianachen-cro', 'Decision Maker')
  insertContact.run('con-4', 'acc-2', 'Liam Thorne', 'VP of Engineering', 'l.thorne@datapulse.ai', 'https://linkedin.com/in/liamthorne-eng', 'Technical Evaluator')
  insertContact.run('con-5', 'acc-3', 'Arthur Pendelton', 'Chief Information Security Officer', 'a.pendelton@secureshield.com', 'https://linkedin.com/in/arthurpendelton-ciso', 'Decision Maker')
  insertContact.run('con-6', 'acc-3', 'Chloe Bennett', 'Head of Security Architecture', 'c.bennett@secureshield.com', 'https://linkedin.com/in/chloebennett-sec', 'Champion')
  insertContact.run('con-7', 'acc-4', 'Robert Sterling', 'SVP of Global Merchant Solutions', 'r.sterling@finflowpay.com', 'https://linkedin.com/in/robertsterling-fin', 'Decision Maker')
  insertContact.run('con-8', 'acc-4', 'Ananya Patel', 'Director of Engineering, Settlement Rails', 'a.patel@finflowpay.com', 'https://linkedin.com/in/ananyapatel-rails', 'Technical Evaluator')
  insertContact.run('con-9', 'acc-5', 'Dr. Henrik Lindqvist', 'Chief Technology Officer', 'h.lindqvist@biogenixlabs.org', 'https://linkedin.com/in/henriklindqvist-cto', 'Decision Maker')
  insertContact.run('con-10', 'acc-6', 'Jessica Morales', 'VP of Digital Commerce & Infrastructure', 'j.morales@omniretail.store', 'https://linkedin.com/in/jessicamorales-ecom', 'Decision Maker')
  insertContact.run('con-11', 'acc-7', 'Trevor Vance', 'Chief Operating Officer', 't.vance@logixsupply.io', 'https://linkedin.com/in/trevorvance-coo', 'Decision Maker')
  insertContact.run('con-12', 'acc-8', 'Nathalie Dupont', 'Head of Platform Engineering', 'n.dupont@scaleops.dev', 'https://linkedin.com/in/nathaliedupont-platform', 'Champion')

  // 4. News Triggers / Press Releases
  const insertNews = db.prepare(`
    INSERT INTO news_triggers (id, account_id, title, summary, source_url, published_date, trigger_category, sentiment, key_facts_json, relevance_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertNews.run(
    'trg-1',
    'acc-1',
    'ApexCloud Secures $65M Series C to Accelerate Multi-Cloud Mesh Architecture',
    'ApexCloud announced a $65M Series C round led by Horizon Ventures with participation from existing investors. The round comes as the company surpassed 140% YoY ARR growth. Capital will be deployed to expand enterprise GTM across EMEA and double the engineering team.',
    'https://news.techpulse.com/apexcloud-65m-series-c',
    '2026-10-18',
    'Funding',
    'Positive',
    JSON.stringify(['$65M Series C round', 'Led by Horizon Ventures', '140% YoY ARR growth', 'Doubling EMEA engineering headcount']),
    0.95
  )

  insertNews.run(
    'trg-2',
    'acc-2',
    'DataPulse Names Former Snowflake Executive Diana Chen as Chief Revenue Officer',
    'DataPulse announced the appointment of Diana Chen as Chief Revenue Officer. Chen joins with 18 years of SaaS sales leadership, having scaled go-to-market teams from $20M to $250M. Her mandate is to expand DataPulse enterprise sales across Fortune 500 accounts.',
    'https://prwire.business/datapulse-hires-chen-cro',
    '2026-10-22',
    'Leadership',
    'Positive',
    JSON.stringify(['Diana Chen appointed CRO', 'Ex-Snowflake sales leader', 'Scaling Fortune 500 enterprise GTM', 'Expanding sales rep organization']),
    0.92
  )

  insertNews.run(
    'trg-3',
    'acc-3',
    'SecureShield Unveils Zero-Trust Automated Containment Engine 4.0',
    'SecureShield launched Engine 4.0, delivering sub-300ms autonomous lateral threat containment. The update achieves complete SOC 2 Type II and FedRAMP readiness, targeting federal defense contractors and healthcare systems.',
    'https://cyberbrief.tech/secureshield-engine-4',
    '2026-10-14',
    'Product Launch',
    'Positive',
    JSON.stringify(['Engine 4.0 launched', 'Sub-300ms threat isolation', 'SOC 2 Type II & FedRAMP certified', 'Focus on federal and healthcare tiers']),
    0.88
  )

  insertNews.run(
    'trg-4',
    'acc-4',
    'FinFlow Completes Acquisition of Cross-Border Payment Gateway PayWave for $120M',
    'FinFlow completed its strategic acquisition of PayWave for $120M in cash and stock. The transaction adds 42 international currency corridors and direct connection to EU SEPA Instant settlement networks.',
    'https://fintechnews.io/finflow-acquires-paywave-120m',
    '2026-10-09',
    'M&A',
    'Positive',
    JSON.stringify(['$120M acquisition of PayWave', '42 new cross-border corridors', 'Direct EU SEPA Instant integration', 'High volume currency settlement']),
    0.94
  )

  insertNews.run(
    'trg-5',
    'acc-5',
    'BioGenix Announces European Headquarters Expansion in Zurich with 200 New Hires',
    'BioGenix Pharma is establishing a secondary computational biology research center in Zurich, Switzerland. The €45M capital commitment will fund laboratory informatics infrastructure and ensure adherence to stringent EMA compliance guidelines.',
    'https://lifesci.daily/biogenix-zurich-expansion-45m',
    '2026-10-25',
    'Expansion',
    'Positive',
    JSON.stringify(['€45M capital investment in Zurich', '200 computational biology hires', 'EMA regulatory compliance focus', 'Genomic data pipeline buildout']),
    0.91
  )

  insertNews.run(
    'trg-6',
    'acc-6',
    'OmniRetail Reports 85% Cyber Monday Surge, Targets Cloud Modernization to Prevent Outages',
    'Following an unprecedented 85% traffic surge during Q4 shopping events, OmniRetail experienced 3 critical checkout latency spikes caused by database replication bottlenecks. Executive leadership announced an immediate cloud modernization initiative.',
    'https://retailinsider.biz/omniretail-cloud-modernization-surge',
    '2026-10-27',
    'Expansion',
    'Urgent',
    JSON.stringify(['85% peak traffic surge', '3 critical checkout latency spikes', 'Database replication bottlenecks', 'Mandatory Q1 cloud modernization mandate']),
    0.96
  )

  insertNews.run(
    'trg-7',
    'acc-7',
    'LogixSupply Partners with Tier-1 Automotive Giants to Roll Out Autonomous Fleet Telematics',
    'LogixSupply formalized multi-year agreements with leading automotive manufacturers to embed its autonomous fleet tracking software directly into 50,000 heavy commercial trucks starting next quarter.',
    'https://freighttech.org/logixsupply-automotive-tier1-partner',
    '2026-10-12',
    'Partnership',
    'Positive',
    JSON.stringify(['Tier-1 automotive partnership', '50,000 commercial trucks equipped', 'Direct OEM telematics integration', 'Multimodal route optimization']),
    0.89
  )

  insertNews.run(
    'trg-8',
    'acc-8',
    'ScaleOps Closes $28M Series A to Expand Automated Kubernetes FinOps Platform',
    'ScaleOps secured $28M in Series A funding to expand its real-time Kubernetes optimization engine. The platform automatically rightsizes cloud instances and eliminates cluster resource waste without manual SRE intervention.',
    'https://devopsmonthly.com/scaleops-28m-series-a-finops',
    '2026-10-19',
    'Funding',
    'Positive',
    JSON.stringify(['$28M Series A round', 'Automated Kubernetes rightsizing', 'Eliminates cluster overprovisioning', 'Over 400 enterprise clusters monitored']),
    0.93
  )

  // 5. Products
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, category, tagline, value_prop, pain_points_json, target_personas_json, proof_points_json, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertProduct.run(
    'prod-1',
    'HyperScale Cloud Optimizer',
    'Cloud Cost & Infrastructure',
    'Autonomous Multi-Cloud Efficiency & Latency Elimination',
    'Continuously analyzes cloud topology and workload spikes, slashing AWS/GCP infrastructure bills by 35% while eliminating database replication lag and latency degradation during peak traffic.',
    JSON.stringify(['Unpredictable cloud spend after rapid scaling', 'Microservice latency spikes during traffic surges', 'Engineering toil spent manually tuning cluster resources']),
    JSON.stringify(['VP of Infrastructure', 'Director of DevOps & SRE', 'CTO']),
    JSON.stringify(['35% average compute bill reduction in 30 days', 'Zero latency degradation across 1.2B daily requests at DoorDash tier', 'SOC 2 Type II certified agentless deployment in 15 minutes']),
    1
  )

  insertProduct.run(
    'prod-2',
    'PipelineVelocity AI',
    'Sales Intelligence & Revenue Acceleration',
    'Account-Based Buying Signal Detection & Auto-Personalized Outreach',
    'Monitors 15,000+ business news channels and executive movements, identifying high-intent trigger events and drafting customized outreach that boosts cold meeting book rates by 3.8x.',
    JSON.stringify(['Low cold email response rates under 1.5%', 'Sales reps wasting 12+ hours weekly researching company news', 'Generic template outreach burning enterprise domain reputations']),
    JSON.stringify(['Chief Revenue Officer', 'VP of Sales', 'Head of Sales Development']),
    JSON.stringify(['3.8x higher qualified response rate vs static templates', 'Over 14 hours saved per sales rep every week', 'Trusted by 450+ high-growth B2B revenue teams']),
    1
  )

  insertProduct.run(
    'prod-3',
    'SentinelZero Shield',
    'Cybersecurity & Compliance',
    'Real-time Threat Isolation & Continuous Zero-Trust Verification',
    'Provides automated identity containment and continuous audit-ready compliance reporting across distributed cloud workforces and hybrid data silos.',
    JSON.stringify(['Expanding attack surface following remote or global hiring', 'Tedious manual compliance auditing for SOC 2, HIPAA, and GDPR', 'Slow lateral movement detection exceeding 4 hours']),
    JSON.stringify(['CISO', 'Head of Security Architecture', 'VP of InfoSec']),
    JSON.stringify(['Sub-180ms automated lateral breach containment', 'Pre-built audit mapping for 14 enterprise frameworks', 'Ranked #1 in Forrester Wave for Zero-Trust Microsegmentation']),
    1
  )

  insertProduct.run(
    'prod-4',
    'DataNexus Mesh',
    'Enterprise Data Engineering',
    'Sub-Second Event Streaming & Declarative Cross-Cloud ETL',
    'Connects legacy on-prem databases and modern cloud lakes into a unified real-time event stream with guaranteed zero-data-loss guarantees and automated schema migration.',
    JSON.stringify(['Data silos after M&A acquisitions or global expansions', 'Fragile custom pipeline scripts breaking on schema changes', 'Slow batch updates hindering real-time customer analytics']),
    JSON.stringify(['Chief Technology Officer', 'VP of Engineering', 'Lead Data Architect']),
    JSON.stringify(['Processes 40M events/sec with sub-5ms p99 latency', 'Instant connector sync across 80+ enterprise platforms', '4x reduction in pipeline engineering overhead']),
    1
  )

  insertProduct.run(
    'prod-5',
    'RetentionEngine AI',
    'Customer Success & Expansion',
    'Predictive Churn Diagnostics & Automated Revenue Expansion Triggers',
    'Analyzes product usage telemetry, sentiment, and support tickets to flag churn risks 90 days before renewal and spotlight high-velocity account expansion opportunities.',
    JSON.stringify(['Surprise customer churn on mid-market accounts', 'Customer success teams reacting too late to telemetry drops', 'Missed expansion cues when accounts hire new leadership']),
    JSON.stringify(['Chief Customer Officer', 'VP of Customer Success', 'Chief Revenue Officer']),
    JSON.stringify(['Reduced net revenue churn by 22% in 2 quarters', '88% accuracy in predicting account downgrades 90 days prior', 'Automated expansion playbooks driving $4.2M in net new ARR']),
    1
  )

  // 6. Pitch Templates
  const insertTemplate = db.prepare(`
    INSERT INTO pitch_templates (id, framework, name, structure_prompt, default_tone, is_system)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  insertTemplate.run(
    'tmpl-pas',
    'PAS',
    'Problem - Agitate - Solve',
    'Hook with news milestone; agitate the operational drag that accompanies rapid expansion; present the product solution as the stabilizing bridge.',
    'direct_roi',
    1
  )

  insertTemplate.run(
    'tmpl-bab',
    'BAB',
    'Before - After - Bridge',
    'Reflect the prior constraint; depict the post-scaling paradise enabled by recent milestone; bridge the gap with the solution.',
    'consultative',
    1
  )

  insertTemplate.run(
    'tmpl-aida',
    'AIDA',
    'Attention - Interest - Desire - Action',
    'Attention: Congratulate on specific news fact. Interest: Address industry shift. Desire: Provide concrete ROI benchmark. Action: Propose low-friction 15-minute sync.',
    'direct_roi',
    1
  )

  insertTemplate.run(
    'tmpl-quick',
    'QuickStrike',
    '3-Sentence High-Impact Strike',
    'Sentence 1: Personalized trigger acknowledgement. Sentence 2: Provocative value metric from similar peers. Sentence 3: Soft low-friction question.',
    'consultative',
    1
  )

  // 7. Seed Pitches
  const insertPitch = db.prepare(`
    INSERT INTO pitches (
      id, account_id, contact_id, news_trigger_id, product_id,
      framework, tone, subject_line, body_content, variants_json,
      spam_score, readability_grade, word_count, status, feedback_rating,
      created_by, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const sampleVariants1 = [
    {
      variantId: 'A',
      styleName: 'Direct & Quantitative ROI',
      subjectLine: "Quick question on ApexCloud's $65M Series C & EMEA mesh scale",
      body: "Hi Julian,\n\nSaw the news regarding ApexCloud's $65M Series C round led by Horizon Ventures—massive congratulations on surpassing 140% YoY ARR growth.\n\nAs you double engineering across EMEA to scale your multi-cloud mesh fabric, cloud infrastructure friction and cross-region egress overhead typically spike by 40%+.\n\nHyperScale Cloud Optimizer was built precisely for this phase. We help high-growth network platforms automate cloud rightsizing and trim infrastructure spend by 35% without requiring SRE firefighting.\n\nWould you be open to a 10-minute briefing next Tuesday to review how we streamlined similar mesh architectures?",
      spamScore: 12.0,
      readabilityGrade: 7.2,
      wordCount: 88
    },
    {
      variantId: 'B',
      styleName: 'Consultative Peer',
      subjectLine: 'Julian - thoughts on EMEA cloud architecture after Series C',
      body: 'Hi Julian,\n\nExciting milestone with the $65M Series C announcement. Scaling multi-cloud architectures while expanding an EMEA engineering hub often uncovers unexpected cloud resource drift and peering latency bottlenecks.\n\nWe recently partnered with peer infrastructure teams navigating identical growth curves, enabling them to autonomously stabilize microservice latency and reduce monthly compute by 35%.\n\nCurious how your team is managing multi-cloud efficiency as headcount doubles? Open to sharing notes if useful.',
      spamScore: 8.5,
      readabilityGrade: 6.8,
      wordCount: 74
    },
    {
      variantId: 'C',
      styleName: 'Visionary & Strategic',
      subjectLine: "ApexCloud's next chapter: scaling multi-cloud without margin drag",
      body: "Hi Julian,\n\nSurpassing 140% YoY growth and locking in $65M from Horizon Ventures signals a pivotal inflection for ApexCloud's distributed fabric.\n\nAt this velocity, maintaining gross margins requires decoupling traffic volume from cloud resource consumption. HyperScale Cloud Optimizer provides the autonomous control plane to scale edge workloads effortlessly.\n\nWould it make sense to explore what this looks like for ApexCloud's 2027 roadmap?",
      spamScore: 14.0,
      readabilityGrade: 7.5,
      wordCount: 66
    }
  ]

  insertPitch.run(
    'pch-1',
    'acc-1',
    'con-1',
    'trg-1',
    'prod-1',
    'PAS',
    'direct_roi',
    "Quick question on ApexCloud's $65M Series C & EMEA mesh scale",
    sampleVariants1[0].body,
    JSON.stringify(sampleVariants1),
    12.0,
    7.2,
    88,
    'approved',
    5,
    'usr-sdr-1',
    '2026-10-20 14:32:00',
    '2026-10-21 09:15:00'
  )

  const sampleVariants2 = [
    {
      variantId: 'A',
      styleName: 'Direct & Quantitative ROI',
      subjectLine: 'Welcome to DataPulse, Diana – Scaling GTM to Fortune 500',
      body: 'Hi Diana,\n\nCongratulations on stepping into the CRO role at DataPulse. Having scaled revenue organizations from $20M to $250M at Snowflake, your focus on accelerating Fortune 500 penetration is timely.\n\nAs you expand your enterprise sales rep footprint, the biggest operational drain is usually rep ramp time and generic outbound decay.\n\nPipelineVelocity AI automates account-based trigger signal tracking across 15,000+ sources, generating personalized pitches that deliver 3.8x higher meeting conversions while saving 14 hours per rep weekly.\n\nWorth exploring how this could supercharge your incoming enterprise cohort?',
      spamScore: 9.0,
      readabilityGrade: 7.0,
      wordCount: 89
    }
  ]

  insertPitch.run(
    'pch-2',
    'acc-2',
    'con-3',
    'trg-2',
    'prod-2',
    'AIDA',
    'consultative',
    'Welcome to DataPulse, Diana – Scaling GTM to Fortune 500',
    sampleVariants2[0].body,
    JSON.stringify(sampleVariants2),
    9.0,
    7.0,
    89,
    'sent',
    4,
    'usr-sdr-1',
    '2026-10-23 11:10:00',
    '2026-10-23 15:45:00'
  )

  // 8. Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_role, action, entity_type, entity_id, details_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertAudit.run('aud-1', 'usr-sdr-1', 'sdr_rep', 'CREATE_PITCH', 'pitches', 'pch-1', JSON.stringify({ framework: 'PAS', account: 'ApexCloud Networks' }), '2026-10-20 14:32:00')
  insertAudit.run('aud-2', 'usr-mgr-1', 'sales_manager', 'APPROVE_PITCH', 'pitches', 'pch-1', JSON.stringify({ approvedBy: 'Marcus Vance', score: 5 }), '2026-10-21 09:15:00')
  insertAudit.run('aud-3', 'usr-sdr-1', 'sdr_rep', 'CREATE_PITCH', 'pitches', 'pch-2', JSON.stringify({ framework: 'AIDA', account: 'DataPulse Analytics' }), '2026-10-23 11:10:00')
  insertAudit.run('aud-4', 'usr-sdr-1', 'sdr_rep', 'SEND_PITCH', 'pitches', 'pch-2', JSON.stringify({ recipient: 'd.chen@datapulse.ai' }), '2026-10-23 15:45:00')
}
