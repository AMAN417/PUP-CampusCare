import { Router, Request, Response } from 'express'
import { getAllIncidents, getIncidentById, updateIncident, deleteIncident, createNotification } from '../utils/firestore'
import type { IncidentStatus, IncidentPriority, IncidentCategory } from '../types'

const router = Router()

// ── Allowed enum values for input validation ──────────────────────────────────
const VALID_STATUSES: IncidentStatus[] = ['submitted', 'analyzing', 'assigned', 'in_progress', 'resolved', 'rejected']
const VALID_PRIORITIES: IncidentPriority[] = ['low', 'medium', 'high', 'critical']
const VALID_CATEGORIES: IncidentCategory[] = ['electrical', 'plumbing', 'cleanliness', 'security', 'internet', 'classroom', 'hostel', 'other']

// ── SLA deadlines by priority (minutes from incident creation) ─────────────────
const SLA_MINUTES: Record<IncidentPriority, number> = {
  critical: 15,
  high: 60,
  medium: 240,
  low: 1440,
}

/** Derive SLA deadline ISO string from incident creation time + priority */
function computeSlaDeadline(createdAt: string, priority: IncidentPriority): string {
  const created = new Date(createdAt).getTime()
  const minutes = SLA_MINUTES[priority] ?? 240
  return new Date(created + minutes * 60_000).toISOString()
}

/** Validate AI output fields before persisting */
function validateAiOutput(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const { category, priority, priorityScore, aiConfidence } = data

  if (category && !VALID_CATEGORIES.includes(category as IncidentCategory)) {
    errors.push(`Invalid category: "${category}"`)
  }
  if (priority && !VALID_PRIORITIES.includes(priority as IncidentPriority)) {
    errors.push(`Invalid priority: "${priority}"`)
  }
  const score = Number(priorityScore)
  if (priorityScore !== undefined && (isNaN(score) || score < 1 || score > 100)) {
    errors.push(`priorityScore must be 1–100, got: ${priorityScore}`)
  }
  const conf = Number(aiConfidence)
  if (aiConfidence !== undefined && (isNaN(conf) || conf < 0 || conf > 100)) {
    errors.push(`aiConfidence must be 0–100, got: ${aiConfidence}`)
  }

  return { valid: errors.length === 0, errors }
}

// GET /api/incidents - List all incidents
router.get('/', async (_req: Request, res: Response) => {
  try {
    const incidents = await getAllIncidents()
    res.json({ incidents })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /api/incidents/stats - Aggregate stats (derived from real incident data)
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const incidents = await getAllIncidents()
    const now = Date.now()

    const total = incidents.length
    const critical = incidents.filter((i) => i.priority === 'critical').length
    const high = incidents.filter((i) => i.priority === 'high').length
    const medium = incidents.filter((i) => i.priority === 'medium').length
    const low = incidents.filter((i) => i.priority === 'low').length
    const resolved = incidents.filter((i) => i.status === 'resolved').length
    const inProgress = incidents.filter((i) => i.status === 'in_progress').length
    const pending = incidents.filter((i) => ['submitted', 'analyzing', 'assigned'].includes(i.status)).length

    // Resolved today: incidents resolved within the last 24 hours
    const resolvedToday = incidents.filter((i) => {
      if (i.status !== 'resolved' || !i.resolvedAt) return false
      return now - new Date(i.resolvedAt).getTime() < 86_400_000
    }).length

    // SLA at-risk: non-resolved incidents past their SLA deadline
    const slaAtRisk = incidents.filter((i) => {
      if (i.status === 'resolved' || i.status === 'rejected') return false
      const deadline = computeSlaDeadline(i.createdAt, i.priority)
      return now > new Date(deadline).getTime()
    }).length

    // Average resolution time (minutes) from incidents that have resolvedAt
    const resolvedWithTime = incidents.filter((i) => i.resolvedAt && i.createdAt)
    const avgResolutionMinutes = resolvedWithTime.length > 0
      ? Math.round(
          resolvedWithTime.reduce((acc, i) => {
            return acc + (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime()) / 60_000
          }, 0) / resolvedWithTime.length
        )
      : null

    const departmentCounts: Record<string, number> = {}
    const categoryCounts: Record<string, number> = {}
    for (const inc of incidents) {
      if (inc.department) departmentCounts[inc.department] = (departmentCounts[inc.department] || 0) + 1
      if (inc.category) categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1
    }

    res.json({
      total,
      critical,
      high,
      medium,
      low,
      resolved,
      inProgress,
      pending,
      resolvedToday,
      slaAtRisk,
      avgResolutionMinutes,
      departmentCounts,
      categoryCounts,
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /api/incidents/:id - Get incident by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const incident = await getIncidentById(id)
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' })
      return
    }
    res.json({ incident })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// PATCH /api/incidents/:id/status - Update incident status (validated transition)
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body as { status: IncidentStatus }
  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
    return
  }

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const incident = await getIncidentById(id)
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' })
      return
    }

    const updates: Record<string, unknown> = { status }
    if (status === 'resolved') {
      updates.resolvedAt = incident.resolvedAt || new Date().toISOString()
    }

    const auditLogs = incident.auditLogs || []
    auditLogs.push({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: `Status changed to ${status}`,
      actor: 'Human Administrator',
      details: `Incident transitioned from ${incident.status} → ${status}`,
    })
    updates.auditLogs = auditLogs

    await updateIncident(id, updates)
    const updated = await getIncidentById(id)
    res.json({ incident: updated })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/incidents/bulk-status - Bulk update status (validated)
router.post('/bulk-status', async (req: Request, res: Response) => {
  const { ids, status } = req.body as { ids: string[]; status: IncidentStatus }
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids array is required and must be non-empty' })
    return
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
    return
  }

  try {
    for (const id of ids) {
      const existing = await getIncidentById(id)
      if (!existing) continue
      const updates: Record<string, unknown> = { status }
      if (status === 'resolved') {
        updates.resolvedAt = existing.resolvedAt || new Date().toISOString()
      }
      await updateIncident(id, updates)
    }
    const all = await getAllIncidents()
    res.json({ success: true, updatedCount: ids.length, incidents: all })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/incidents/:id/resolve - Mark resolved with resolution note
router.post('/:id/resolve', async (req: Request, res: Response) => {
  const { resolutionNote } = req.body as { resolutionNote?: string }
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const incident = await getIncidentById(id)
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' })
      return
    }
    // Idempotency: already resolved
    if (incident.status === 'resolved' && incident.resolvedAt) {
      const updated = await getIncidentById(id)
      res.json({ success: true, incident: updated, alreadyResolved: true })
      return
    }

    const note = resolutionNote?.trim() || 'Technician completed repairs and verified operation.'
    const auditLogs = incident.auditLogs || []
    auditLogs.push({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'Incident Marked Resolved by Human',
      actor: 'Human Administrator',
      details: note,
    })

    await updateIncident(id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNote: note,
      auditLogs,
    })

    // Emit resolved notification
    await createNotification({
      userId: 'admin_all',
      incidentId: id,
      title: 'Incident Resolved',
      message: `${incident.title} has been marked as resolved by the operations team.`,
      type: 'resolution',
      read: false,
      createdAt: new Date().toISOString(),
    }).catch(() => {})

    const updated = await getIncidentById(id)
    res.json({ success: true, incident: updated })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/incidents/:id/approve-recommendation - Human approves AI recommendation
// Idempotent: if already in_progress, returns current state without duplicate audit entry
router.post('/:id/approve-recommendation', async (req: Request, res: Response) => {
  const { approver = 'Campus Operations Admin' } = req.body as { approver?: string }
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const incident = await getIncidentById(id)
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' })
      return
    }

    // Idempotency: already approved/in_progress
    if (incident.status === 'in_progress' && incident.approvedBy) {
      const updated = await getIncidentById(id)
      res.json({ success: true, incident: updated, alreadyApproved: true })
      return
    }

    // Generate work order ID derived from incident ID for traceability
    const workOrderId = 'WO-' + incident.id.replace('INC-', '').substring(0, 6)
    const slaDeadline = computeSlaDeadline(incident.createdAt, incident.priority)

    const auditLogs = incident.auditLogs || []
    auditLogs.push({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'AI Recommendation Approved — Work Order Dispatched',
      actor: approver,
      details: `Dispatched to ${incident.department} · Work Order ${workOrderId} · SLA deadline: ${new Date(slaDeadline).toLocaleTimeString()}`,
    })

    await updateIncident(id, {
      status: 'in_progress',
      approvedBy: approver,
      workOrderId,
      auditLogs,
    })

    // Emit assignment notification
    await createNotification({
      userId: 'admin_all',
      incidentId: id,
      title: 'Work Order Dispatched',
      message: `${incident.title} — Work order ${workOrderId} assigned to ${incident.department}.`,
      type: 'assignment',
      read: false,
      createdAt: new Date().toISOString(),
    }).catch(() => {})

    const updated = await getIncidentById(id)
    res.json({ success: true, incident: updated })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /api/incidents/:id/verify - AI Safety Verification with real criteria
router.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const incident = await getIncidentById(id)
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' })
      return
    }

    // Idempotency: already verified
    if (incident.verifiedByAi) {
      const updated = await getIncidentById(id)
      res.json({ success: true, verification: 'PASS', incident: updated, alreadyVerified: true })
      return
    }

    // Real verification criteria — all must be satisfied for PASS
    const criteria = {
      statusResolved: incident.status === 'resolved',
      resolutionNotePresent: Boolean(incident.resolutionNote && incident.resolutionNote.trim().length >= 10),
      resolvedAtPresent: Boolean(incident.resolvedAt),
      approvedByHuman: Boolean(incident.approvedBy),
    }

    const passCount = Object.values(criteria).filter(Boolean).length
    const totalCriteria = Object.keys(criteria).length

    let verificationResult: 'PASS' | 'REVIEW_REQUIRED' | 'FAIL'
    if (passCount === totalCriteria) {
      verificationResult = 'PASS'
    } else if (passCount >= 2) {
      verificationResult = 'REVIEW_REQUIRED'
    } else {
      verificationResult = 'FAIL'
    }

    const now = new Date().toISOString()
    const auditLogs = incident.auditLogs || []
    auditLogs.push({
      id: 'log_' + Date.now(),
      timestamp: now,
      action: `AI Safety Verification: ${verificationResult}`,
      actor: 'CampusOps AI Verification Agent',
      details: `Criteria: status_resolved=${criteria.statusResolved}, resolution_note=${criteria.resolutionNotePresent}, resolved_at=${criteria.resolvedAtPresent}, human_approved=${criteria.approvedByHuman}. Result: ${verificationResult}.`,
    })

    const updates: Record<string, unknown> = {
      verifiedByAi: verificationResult === 'PASS',
      auditLogs,
    }
    // Only set resolvedAt if not already set
    if (!incident.resolvedAt && verificationResult === 'PASS') {
      updates.resolvedAt = now
      updates.status = 'resolved'
    }

    await updateIncident(id, updates)

    if (verificationResult === 'PASS') {
      await createNotification({
        userId: 'admin_all',
        incidentId: id,
        title: 'AI Verification: PASS',
        message: `${incident.title} has been certified as resolved by the AI Verification Agent.`,
        type: 'resolution',
        read: false,
        createdAt: now,
      }).catch(() => {})
    }

    const updated = await getIncidentById(id)
    res.json({
      success: true,
      verification: verificationResult,
      criteria,
      passCount,
      totalCriteria,
      incident: updated,
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const existed = await deleteIncident(id)
    if (!existed) {
      res.status(404).json({ error: 'Incident not found' })
      return
    }
    res.json({ success: true, deletedId: id })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router

