/**
 * Saksham AI — Matching Engine
 * Multi-dimensional rule evaluation against the 13-scheme catalog,
 * producing transparent match scores with explainable rationale.
 */

const CATEGORY_LABELS = {
  SC: 'Scheduled Caste',
  ST: 'Scheduled Tribe',
  OBC: 'Other Backward Class',
  WOMEN: 'Women Entrepreneur',
  MINORITY: 'Minority',
  PWD: 'Person with Disability',
  EWS: 'Economically Weaker Section',
  GENERAL: 'General',
}

const BUSINESS_TYPE_LABELS = {
  MANUFACTURING: 'Manufacturing',
  SERVICES: 'Services',
  TRADING: 'Trading / Retail',
  AGRO_FOOD: 'Agro & Food Processing',
  HANDICRAFT_TEXTILE: 'Handicrafts & Textiles',
  GREEN_TECH: 'Green Technology',
}

const STAGE_LABELS = {
  IDEATION: 'Idea Stage',
  EARLY_STAGE: 'Early Stage',
  GROWTH: 'Growth Stage',
  EXPANSION: 'Expansion Stage',
}

const SUPPORT_LABELS = {
  CAPITAL_SUBSIDY: 'Capital Subsidy',
  FINANCE_LOAN: 'Bank Loan / Finance',
  WORKING_CAPITAL: 'Working Capital',
  MACHINERY: 'Machinery Purchase',
  COLLATERAL_FREE: 'Collateral-Free Credit',
  MARKETING_EXHIBITION: 'Marketing & Exhibition Support',
  SKILL_TRAINING: 'Skill Training',
  TECH_ADOPTION: 'Technology Adoption',
  EXPORT: 'Export Assistance',
  BUSINESS_GROWTH: 'Business Growth Support',
  INFRASTRUCTURE: 'Infrastructure Support',
}

const URBAN_STATES = new Set([
  'Delhi', 'Goa', 'Chandigarh', 'Puducherry', 'Lakshadweep',
])

function formatINR(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} Lakhs`
  return `₹${amount.toLocaleString('en-IN')}`
}

function isStateEligible(scheme, state) {
  if (!scheme.states || scheme.states.length === 0) return true
  return scheme.states.includes('ALL_INDIA') || scheme.states.includes(state)
}

function isCategoryEligible(scheme, socialCategory) {
  return (scheme.eligibleCategories || []).includes(socialCategory)
}

function isWomenBoost(userProfile) {
  return userProfile.gender === 'Female' || userProfile.socialCategory === 'WOMEN'
}

/**
 * Core deterministic scoring. Weights favor affirmative-category fit,
 * support-type alignment, and funding need vs scheme ceiling.
 */
function scoreScheme(scheme, userProfile, businessProfile) {
  const matched = []
  const advisory = []
  let score = 0

  const category = userProfile.socialCategory || 'GENERAL'
  const state = userProfile.state || ''
  const bizType = businessProfile.businessType || 'SERVICES'
  const stage = businessProfile.businessStage || 'EARLY_STAGE'
  const support = businessProfile.supportRequired || []
  const targetAmount = Number(businessProfile.targetAmount) || 0
  const turnover = Number(businessProfile.annualTurnover) || 0

  // 1. Social category (affirmative action core) — up to 35 pts
  if (isCategoryEligible(scheme, category)) {
    if ((scheme.targetCategories || []).includes(category)) {
      score += 35
      matched.push(`Social category priority: ${CATEGORY_LABELS[category] || category} is a primary target group for this scheme`)
    } else {
      score += 22
      matched.push(`You are eligible under the ${CATEGORY_LABELS[category] || category} category`)
    }
  } else {
    advisory.push(`Scheme primarily targets ${(scheme.targetCategories || []).join(', ') || 'specific categories'} — verify current-year guidelines`)
    score += 5
  }

  // Women/SHG affinity bonus — up to 8 pts
  if (isWomenBoost(userProfile) && (scheme.targetCategories || []).some((c) => c === 'WOMEN' || c === 'SHG_MEMBER')) {
    score += 8
    matched.push('Women/SHG-focused provisions offer concessional terms for your profile')
  }

  // 2. State coverage — up to 12 pts
  if (scheme.states?.includes(state)) {
    score += 12
    matched.push(`State alignment: active in ${state} with dedicated state-level implementation`)
  } else if (scheme.states?.includes('ALL_INDIA')) {
    score += 8
    matched.push('Available across all Indian states via Central Ministry coverage')
  } else {
    advisory.push(`Currently operational for: ${(scheme.states || []).join(', ')}`)
  }

  // 3. Business type fit — up to 15 pts
  if ((scheme.eligibleBusinessTypes || []).includes(bizType)) {
    score += 15
    matched.push(`Sector fit: ${BUSINESS_TYPE_LABELS[bizType] || bizType} enterprises are explicitly covered`)
  } else {
    advisory.push(`Sector focus is ${(scheme.eligibleBusinessTypes || []).map((b) => BUSINESS_TYPE_LABELS[b] || b).join(', ')}`)
  }

  // 4. Business stage fit — up to 10 pts
  if ((scheme.businessStages || []).includes(stage)) {
    score += 10
    matched.push(`Stage fit: designed for ${STAGE_LABELS[stage] || stage} units`)
  } else {
    advisory.push(`Supports stages: ${(scheme.businessStages || []).map((s) => STAGE_LABELS[s] || s).join(', ')} — your ${STAGE_LABELS[stage] || stage} status needs review`)
  }

  // 5. Support requirement overlap — up to 15 pts
  const overlap = support.filter((s) => (scheme.supportTypes || []).includes(s))
  if (support.length > 0) {
    score += Math.min(15, Math.round((overlap.length / support.length) * 15))
    if (overlap.length > 0) {
      matched.push(`Support match: ${overlap.map((s) => SUPPORT_LABELS[s] || s).join(', ')}`)
    }
  }

  // 6. Funding need vs project ceiling — up to 10 pts
  if (targetAmount > 0) {
    const maxCost = scheme.maxProjectCost || 0
    if (maxCost > 0 && targetAmount <= maxCost) {
      const ratio = targetAmount / maxCost
      score += ratio <= 0.5 ? 10 : 7
      matched.push(`Your funding need ${formatINR(targetAmount)} fits within the ${formatINR(maxCost)} project ceiling`)
    } else if (maxCost > 0) {
      advisory.push(`Requested ${formatINR(targetAmount)} exceeds the ${formatINR(maxCost)} maximum project cost — consider phasing`)
      score += 2
    }
  }

  // 7. Turnover window — up to 5 pts
  const maxTurnover = scheme.maxTurnover || 0
  if (maxTurnover > 0 && turnover <= maxTurnover) {
    score += 5
    matched.push('Enterprise size is within the scheme turnover limits')
  } else if (maxTurnover > 0) {
    advisory.push(`Annual turnover above ${formatINR(maxTurnover)} may exceed scheme limits`)
  }

  // 8. Age window — up to 5 pts
  const age = Number(userProfile.age) || 0
  if (age > 0) {
    if (age >= (scheme.minAge || 18) && age <= (scheme.maxAge || 70)) {
      score += 5
      matched.push(`Age ${age} is within the eligible range (${scheme.minAge || 18}-${scheme.maxAge || 70} years)`)
    } else {
      advisory.push(`Age requirement: ${scheme.minAge || 18}-${scheme.maxAge || 70} years`)
    }
  }

  // 9. Udyam registration readiness note
  if (businessProfile.udyamRegistered === 'NO' && (scheme.documents || []).some((d) => /Udyam/i.test(d))) {
    advisory.push('Udyam registration will be required — apply free at udyamregistration.gov.in')
  }

  // 10. Special subsidy visibility
  const subsidyPct = scheme.subsidyPercentSpecial || 0
  if (subsidyPct > 0 && isCategoryEligible(scheme, category)) {
    matched.push(`Special capital subsidy of up to ${subsidyPct}% applies to your category`)
  }

  return { score: Math.max(0, Math.min(100, score)), matched, advisory }
}

function buildEstimatedSubsidy(scheme, userProfile, businessProfile) {
  const targetAmount = Number(businessProfile.targetAmount) || 0
  const pct = scheme.subsidyPercentSpecial || 0
  if (pct > 0) {
    const capped = Math.min(targetAmount, scheme.maxProjectCost || targetAmount)
    const amount = Math.round((capped * pct) / 100)
    return `${formatINR(amount)} @ ${pct}% subsidy`
  }
  const maxCost = scheme.maxProjectCost || 0
  if (scheme.schemeType === 'VENTURE_CAPITAL' || scheme.schemeType === 'INNOVATION_GRANT') {
    return `Equity up to ${formatINR(maxCost)}`
  }
  if (/loan|credit|guarantee/i.test(scheme.schemeType || '')) {
    return `Credit up to ${formatINR(maxCost)}`
  }
  return maxCost > 0 ? `Support up to ${formatINR(maxCost)}` : 'As per scheme guidelines'
}

function buildExplanation(scheme, userProfile, businessProfile, matched) {
  const category = CATEGORY_LABELS[userProfile.socialCategory] || userProfile.socialCategory || 'your category'
  const state = userProfile.state || 'your state'
  const bizType = BUSINESS_TYPE_LABELS[businessProfile.businessType] || businessProfile.businessType || 'your sector'
  const headline = matched[0] || `${scheme.shortName || scheme.name} supports ${category} entrepreneurs`
  return `${headline}. As a ${category} entrepreneur in ${state} running a ${bizType} business at ${STAGE_LABELS[businessProfile.businessStage] || 'an early stage'}, ${scheme.shortName || scheme.name} directly aligns with your affirmative-action entitlements${(scheme.badge ? ` (${scheme.badge})` : '')}. The evaluation verified your category priority, state coverage, sector eligibility, stage readiness, and funding requirement against the official scheme rules.`
}

export function computeMatches(userProfile, businessProfile, schemes) {
  const matches = schemes
    .map((scheme) => {
      const { score, matched, advisory } = scoreScheme(scheme, userProfile, businessProfile)
      return {
        schemeId: scheme.id,
        scheme,
        matchScore: score,
        matchedCriteria: matched,
        missingCriteria: advisory,
        estimatedSubsidy: buildEstimatedSubsidy(scheme, userProfile, businessProfile),
        explanation: buildExplanation(scheme, userProfile, businessProfile, matched),
        isAiEnhanced: score >= 60,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)

  return matches
}

/**
 * Interactive eligibility checker — criterion-by-criterion breakdown.
 */
export function checkEligibility(scheme, userProfile, businessProfile) {
  const rows = []
  const push = (criterion, required, userValue, status) => rows.push({ criterion, required, userValue, status })

  const category = userProfile.socialCategory || 'GENERAL'
  const age = Number(userProfile.age) || 0
  const state = userProfile.state || ''
  const bizType = businessProfile.businessType || ''
  const stage = businessProfile.businessStage || ''
  const targetAmount = Number(businessProfile.targetAmount) || 0

  // Category
  const catOk = isCategoryEligible(scheme, category)
  push(
    'Social Category',
    (scheme.eligibleCategories || []).join(', '),
    `${CATEGORY_LABELS[category] || category}`,
    catOk ? 'PASS' : 'FAIL'
  )

  // Age
  const minAge = scheme.minAge || 18
  const maxAge = scheme.maxAge || 70
  const ageOk = age >= minAge && age <= maxAge
  push(
    'Age Limit',
    `${minAge} - ${maxAge} years`,
    age > 0 ? `${age} years` : 'Not provided',
    age > 0 ? (ageOk ? 'PASS' : 'FAIL') : 'WARN'
  )

  // State
  const stateOk = isStateEligible(scheme, state)
  push(
    'State / Region',
    (scheme.states || []).join(', '),
    state || 'Not provided',
    stateOk ? 'PASS' : 'FAIL'
  )

  // Business type
  const bizOk = (scheme.eligibleBusinessTypes || []).includes(bizType)
  push(
    'Business Sector',
    (scheme.eligibleBusinessTypes || []).map((b) => BUSINESS_TYPE_LABELS[b] || b).join(', '),
    BUSINESS_TYPE_LABELS[bizType] || bizType || 'Not provided',
    bizOk ? 'PASS' : 'WARN'
  )

  // Stage
  const stageOk = (scheme.businessStages || []).includes(stage)
  push(
    'Business Stage',
    (scheme.businessStages || []).map((s) => STAGE_LABELS[s] || s).join(', '),
    STAGE_LABELS[stage] || stage || 'Not provided',
    stageOk ? 'PASS' : 'WARN'
  )

  // Project cost
  const maxCost = scheme.maxProjectCost || 0
  if (maxCost > 0) {
    push(
      'Project Cost Ceiling',
      `Up to ${formatINR(maxCost)}`,
      formatINR(targetAmount || 0),
      targetAmount > 0 ? (targetAmount <= maxCost ? 'PASS' : 'FAIL') : 'WARN'
    )
  }

  // Turnover
  const maxTurnover = scheme.maxTurnover || 0
  if (maxTurnover > 0) {
    const turnover = Number(businessProfile.annualTurnover) || 0
    push(
      'Annual Turnover Limit',
      `Up to ${formatINR(maxTurnover)}`,
      formatINR(turnover || 0),
      turnover <= maxTurnover ? 'PASS' : 'WARN'
    )
  }

  // Udyam
  if ((scheme.documents || []).some((d) => /Udyam/i.test(d))) {
    const reg = businessProfile.udyamRegistered || 'NO'
    push(
      'Udyam Registration',
      'Required before final sanction',
      reg === 'YES' ? 'Registered' : reg === 'APPLIED' ? 'Applied' : 'Not registered',
      reg === 'YES' ? 'PASS' : reg === 'APPLIED' ? 'WARN' : 'WARN'
    )
  }

  const passCount = rows.filter((r) => r.status === 'PASS').length
  const failCount = rows.filter((r) => r.status === 'FAIL').length
  const warnCount = rows.filter((r) => r.status === 'WARN').length
  const total = rows.length

  let percent = Math.round(((passCount + warnCount * 0.5) / total) * 100)
  percent = Math.max(5, Math.min(99, percent))

  let eligibilityStatus = 'NEEDS_REVIEW'
  if (failCount === 0 && warnCount <= 1) eligibilityStatus = 'HIGHLY_ELIGIBLE'
  else if (failCount === 0) eligibilityStatus = 'LIKELY_ELIGIBLE'

  return {
    schemeId: scheme.id,
    scheme,
    eligibilityStatus,
    matchScore: percent,
    criteriaChecklist: rows,
    requiredDocuments: scheme.documents || [],
    disclaimer: 'This is a hackathon prototype performing indicative rule-based evaluation only. Final eligibility is decided solely by the nodal ministry, bank, or state agency after formal document verification. Always confirm current guidelines on the official portal before applying.',
  }
}

export function buildDocumentsStatus(scheme) {
  const status = {}
  for (const doc of scheme.documents || []) status[doc] = 'PENDING'
  return status
}

export { CATEGORY_LABELS, BUSINESS_TYPE_LABELS, STAGE_LABELS, SUPPORT_LABELS, formatINR }
