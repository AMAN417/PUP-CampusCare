// ─────────────────────────────────────────────
// Shared TypeScript types for CampusOps AI
// ─────────────────────────────────────────────

// ── Enums ────────────────────────────────────

export type IncidentCategory =
  | 'electrical'
  | 'plumbing'
  | 'cleanliness'
  | 'security'
  | 'internet'
  | 'classroom'
  | 'hostel'
  | 'other'

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical'

export type IncidentStatus =
  | 'submitted'
  | 'analyzing'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'

export type UserRole = 'student' | 'staff' | 'admin'

export type NotificationType = 'status_update' | 'assignment' | 'resolution' | 'general'

// ── Incident ─────────────────────────────────

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  actor: string
  details?: string
}

export type WorkOrderStatus = 'created' | 'assigned' | 'in_progress' | 'completed' | 'verified'

export interface WorkOrder {
  id: string
  incidentId: string
  title: string
  assignedTeam: string
  priority: IncidentPriority
  riskScore: number
  slaDeadline: string
  status: WorkOrderStatus
  location: string
  resolutionNotes?: string
  createdAt: string
  completedAt?: string
  verifiedAt?: string
  verificationResult?: 'PASS' | 'REVIEW_REQUIRED' | 'FAIL'
}

export interface Incident {
  id: string
  title: string
  description: string
  category: IncidentCategory
  priority: IncidentPriority
  priorityScore: number          // 1–100, set by AI
  location: string
  building?: string
  floor?: string
  department: string
  status: IncidentStatus
  reporterId: string
  createdAt: string              // ISO 8601
  updatedAt: string
  aiSummary?: string
  aiReasoning?: string
  aiRecommendation?: string
  aiConfidence?: number          // e.g. 95 (percentage)
  operationalImpact?: 'high' | 'medium' | 'low'
  assignedAt?: string
  resolvedAt?: string
  resolutionNote?: string
  verifiedByAi?: boolean
  workOrderId?: string
  approvedBy?: string
  auditLogs?: AuditLogEntry[]
}

// ── User ─────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

// ── Notification ─────────────────────────────

export interface Notification {
  id: string
  userId: string
  incidentId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}
