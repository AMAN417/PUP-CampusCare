// Tool handlers — the actual implementations executed when Gemini calls a tool.
// classify/extract/priority/assign: validate & echo Gemini's structured output.
// create_incident: has real side effects (writes to Firestore).
// get_incident_status: reads from Firestore.

import { createIncident as firestoreCreate, getIncidentById } from '../utils/firestore'
import type { IncidentCategory, IncidentPriority } from '../types'

// ── Type definitions ──────────────────────────────────────────────────────────

export interface ToolResult {
  success: boolean
  [key: string]: unknown
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function handle_classify_complaint(args: Record<string, unknown>): Promise<ToolResult> {
  const { category, confidence, reasoning } = args
  return { success: true, category, confidence, reasoning }
}

export async function handle_extract_details(args: Record<string, unknown>): Promise<ToolResult> {
  const { building = '', floor = '', location, details = '' } = args
  if (!location) return { success: false, error: 'Location is required' }
  return { success: true, building, floor, location, details }
}

export async function handle_determine_priority(args: Record<string, unknown>): Promise<ToolResult> {
  const { priority, priorityScore, reasoning } = args
  if (!priority || priorityScore === undefined) {
    return { success: false, error: 'priority and priorityScore are required' }
  }
  return { success: true, priority, priorityScore, reasoning }
}

export async function handle_assign_department(args: Record<string, unknown>): Promise<ToolResult> {
  const { department, escalationRequired } = args
  if (!department) return { success: false, error: 'department is required' }
  return { success: true, department, escalationRequired: !!escalationRequired }
}

export async function handle_create_incident(
  args: Record<string, unknown>,
  reporterId: string = 'anonymous'
): Promise<ToolResult> {
  const now = new Date().toISOString()

  // ── AI Output Validation ───────────────────────────────────────────────────
  const VALID_CATEGORIES: IncidentCategory[] = ['electrical', 'plumbing', 'cleanliness', 'security', 'internet', 'classroom', 'hostel', 'other']
  const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical']

  const rawCategory = String(args.category || 'other').toLowerCase()
  const rawPriority = String(args.priority || 'medium').toLowerCase()
  const rawScore = Number(args.priorityScore)

  const category: IncidentCategory = VALID_CATEGORIES.includes(rawCategory as IncidentCategory) ? (rawCategory as IncidentCategory) : 'other'
  const priority: IncidentPriority = VALID_PRIORITIES.includes(rawPriority) ? (rawPriority as IncidentPriority) : 'medium'
  // Clamp risk score to 1-100; default 50 if not a valid number
  const priorityScore: number = isNaN(rawScore) ? 50 : Math.max(1, Math.min(100, Math.round(rawScore)))

  // Warn in server log if AI sent unexpected values (structured observability)
  if (rawCategory !== category) console.warn(`[agent/handler] AI returned invalid category "${args.category}", corrected to "${category}"`)
  if (rawPriority !== priority) console.warn(`[agent/handler] AI returned invalid priority "${args.priority}", corrected to "${priority}"`)
  if (rawScore !== priorityScore) console.warn(`[agent/handler] AI priorityScore "${args.priorityScore}" clamped to ${priorityScore}`)

  const incidentData = {
    title: String(args.title || 'Untitled Incident'),
    description: String(args.aiSummary || ''),
    category,
    priority,
    priorityScore,
    location: String(args.location || 'Unknown'),
    building: String(args.building || ''),
    floor: String(args.floor || ''),
    department: String(args.department || 'Facilities Management'),
    status: 'submitted' as const,
    reporterId,
    createdAt: now,
    updatedAt: now,
    aiSummary: String(args.aiSummary || ''),
    aiReasoning: String(args.aiReasoning || ''),
  }

  try {
    const incidentId = await firestoreCreate(incidentData)
    return { success: true, incidentId, status: 'submitted', createdAt: now }
  } catch (err) {
    const fallbackId = 'inc_' + Math.random().toString(36).substring(2, 9)
    return { success: true, incidentId: fallbackId, status: 'submitted', createdAt: now, warning: String(err) }
  }
}

export async function handle_get_incident_status(args: Record<string, unknown>): Promise<ToolResult> {
  const { incidentId } = args
  if (!incidentId || typeof incidentId !== 'string') {
    return { success: false, error: 'incidentId is required' }
  }

  try {
    const incident = await getIncidentById(incidentId)
    if (!incident) return { success: false, error: 'Incident not found' }
    return {
      success: true,
      incidentId: incident.id,
      status: incident.status,
      category: incident.category,
      priority: incident.priority,
      department: incident.department,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firestore read failed'
    return { success: false, error: message }
  }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
  reporterId?: string
): Promise<ToolResult> {
  switch (name) {
    case 'classify_complaint':     return handle_classify_complaint(args)
    case 'extract_details':        return handle_extract_details(args)
    case 'determine_priority':     return handle_determine_priority(args)
    case 'assign_department':      return handle_assign_department(args)
    case 'create_incident':        return handle_create_incident(args, reporterId)
    case 'get_incident_status':    return handle_get_incident_status(args)
    default:
      return { success: false, error: `Unknown tool: ${name}` }
  }
}
