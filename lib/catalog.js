/**
 * Saksham AI — live scheme catalog.
 * Seeds from the official DEMO_SCHEMES data; admin can append custom schemes
 * (Admin Portal → Add New Scheme). Custom schemes are also matched by the engine.
 */

import { DEMO_SCHEMES } from './seedData'

let customSchemes = []

export function getCatalog() {
  return [...DEMO_SCHEMES, ...customSchemes]
}

export function addCustomScheme(form) {
  const slug = (form.name || 'scheme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  const scheme = {
    id: `scheme-custom-${slug}-${Date.now()}`,
    name: form.name,
    shortName: form.shortName || form.name,
    department: form.department,
    nodalAgency: form.nodalAgency || form.department,
    schemeType: form.schemeType || 'CAPITAL_SUBSIDY',
    typeLabel: form.typeLabel || 'Credit Linked Capital Subsidy',
    description: form.description || '',
    minAge: Number(form.minAge) || 18,
    maxAge: Number(form.maxAge) || 70,
    minTurnover: 0,
    maxTurnover: 50000000,
    maxProjectCost: Number(form.maxProjectCost) || 2500000,
    subsidyPercentSpecial: Number(form.subsidyPercentSpecial) || 35,
    subsidyPercentGeneral: Number(form.subsidyPercentGeneral) || 25,
    states: Array.isArray(form.states) && form.states.length ? form.states : ['ALL_INDIA'],
    eligibleCategories: form.eligibleCategories || ['SC', 'ST', 'OBC', 'WOMEN', 'GENERAL'],
    targetCategories: form.targetCategories || ['SC', 'ST', 'WOMEN'],
    eligibleBusinessTypes: form.eligibleBusinessTypes || ['MANUFACTURING', 'SERVICES'],
    eligibleIndustries: ['All MSME Industries'],
    businessStages: form.businessStages || ['IDEATION', 'EARLY_STAGE'],
    supportTypes: form.supportTypes || ['CAPITAL_SUBSIDY', 'FINANCE_LOAN'],
    benefits: form.benefits || ['Government Financial Subsidy'],
    documents: form.documents || ['Aadhaar Card', 'PAN Card', 'Project Report'],
    applicationUrl: form.applicationUrl || 'https://msme.gov.in',
    officialWebsite: form.officialWebsite || 'https://msme.gov.in',
    deadline: form.deadline || 'Open All Year',
    applicationMode: form.applicationMode || 'Online',
    isActive: true,
    isPopular: false,
    badge: 'Admin Added',
  }
  customSchemes.push(scheme)
  return scheme
}

export function resetCatalog() {
  customSchemes = []
}
