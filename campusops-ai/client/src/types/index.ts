// ─────────────────────────────────────────────
// Shared TypeScript types for CampusOps AI (client)
// ─────────────────────────────────────────────

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
  priorityScore: number
  location: string
  building?: string
  floor?: string
  department: string
  status: IncidentStatus
  reporterId: string
  createdAt: string
  updatedAt: string
  aiSummary?: string
  aiReasoning?: string
  aiRecommendation?: string
  aiConfidence?: number
  operationalImpact?: 'high' | 'medium' | 'low'
  assignedAt?: string
  resolvedAt?: string
  resolutionNote?: string
  verifiedByAi?: boolean
  workOrderId?: string
  approvedBy?: string
  auditLogs?: AuditLogEntry[]
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

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

export interface AgentReportResponse {
  incident: Incident
  aiSummary: string
  steps: string[]
}

export interface AdminStatsResponse {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  resolved: number
  inProgress: number
  pending: number
  resolvedToday: number
  slaAtRisk: number
  avgResolutionMinutes: number | null
  departmentCounts: Record<string, number>
  categoryCounts: Record<string, number>
}
