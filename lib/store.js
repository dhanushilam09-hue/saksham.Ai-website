/**
 * Saksham AI — lightweight in-memory data store.
 * Mirrors the original API contracts exactly:
 *  - applications: { id, userId, schemeId, status, targetAmount, notes, documentsStatus, trackingNumber, lastUpdated, scheme }
 *  - notifications: { id, userId, title, message, createdAt }
 *  - adminStats: { totalSchemes, activeSchemes, totalApplications, totalMatches }
 */

import { getCatalog } from './catalog'
import { buildDocumentsStatus } from './matchingEngine'

let applications = []
let notifications = []
let idCounter = 1
let matchQueries = 24

function makeTrackingNumber() {
  const n = String(idCounter).padStart(3, '0')
  return `SAKSHAM-${n}`
}

function findScheme(schemeId) {
  return getCatalog().find((s) => s.id === schemeId) || null
}

export function getApplications(userId) {
  return applications
    .filter((a) => a.userId === userId)
    .map((a) => ({ ...a, scheme: findScheme(a.schemeId) || undefined }))
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
}

export function createApplication({ userId, schemeId, status = 'SAVED', targetAmount = 500000, notes = '' }) {
  const scheme = findScheme(schemeId)
  if (!scheme) return { error: 'Scheme not found' }
  if (applications.some((a) => a.userId === userId && a.schemeId === schemeId)) {
    return { error: 'Scheme is already saved to your pipeline.' }
  }

  const app = {
    id: `app-${idCounter}-${Date.now()}`,
    userId,
    schemeId,
    status,
    targetAmount: Number(targetAmount) || 500000,
    notes: notes || 'Saved for application document preparation.',
    documentsStatus: buildDocumentsStatus(scheme),
    trackingNumber: makeTrackingNumber(),
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  }
  idCounter += 1
  applications.push(app)

  notifications.unshift({
    id: `notif-${Date.now()}-${idCounter}`,
    userId,
    title: 'Scheme Added to Pipeline',
    message: `${scheme.shortName || scheme.name} was saved to your application tracker. Begin document preparation to reach READY_TO_APPLY.`,
    createdAt: new Date().toISOString(),
  })

  return { application: app }
}

export function updateApplication(appId, patch) {
  const app = applications.find((a) => a.id === appId)
  if (!app) return { error: 'Application not found' }

  if (patch.status) {
    app.status = patch.status
    const scheme = findScheme(app.schemeId)
    notifications.unshift({
      id: `notif-${Date.now()}-${app.id}`,
      userId: app.userId,
      title: 'Application Status Updated',
      message: `${scheme?.shortName || 'Your application'} moved to ${patch.status.replace(/_/g, ' ')}.`,
      createdAt: new Date().toISOString(),
    })
  }
  if (patch.documentsStatus) app.documentsStatus = patch.documentsStatus
  if (patch.notes !== undefined) app.notes = patch.notes
  app.lastUpdated = new Date().toISOString()
  return { application: app }
}

export function deleteApplication(appId) {
  const idx = applications.findIndex((a) => a.id === appId)
  if (idx === -1) return { error: 'Application not found' }
  applications.splice(idx, 1)
  return { success: true }
}

export function getNotifications(userId) {
  const general = [
    {
      id: 'notif-seed-1',
      userId,
      title: 'PMEGP: Special Category Drive',
      message: 'KVIC announced accelerated processing for SC/ST/Women applicants with 35% rural capital subsidy. District Task Force reviews now within 45 days.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'notif-seed-2',
      userId,
      title: 'T-PRIDE 45% Investment Subsidy',
      message: 'Telangana Industries Dept enhanced fixed capital investment subsidy to 45% (up to ₹75 Lakhs) for SC/ST women entrepreneurs under TS-iPASS.',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
  ]
  return [...notifications.filter((n) => n.userId === userId), ...general]
}

export function getAdminStats() {
  const catalog = getCatalog()
  const activeSchemes = catalog.filter((s) => s.isActive !== false).length
  return {
    totalSchemes: catalog.length,
    activeSchemes,
    totalApplications: applications.length,
    totalMatches: matchQueries,
  }
}

export function incrementMatchQueries() {
  matchQueries += 1
}

export function resetStore() {
  applications = []
  notifications = []
  idCounter = 1
  matchQueries = 24
}
