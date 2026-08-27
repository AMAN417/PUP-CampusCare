import type { Incident, AgentReportResponse, AdminStatsResponse, IncidentStatus } from '../types'

const BASE_URL = '/api'

export async function submitComplaint(
  message: string,
  reporterId: string = 'student_demo'
): Promise<AgentReportResponse> {
  const res = await fetch(`${BASE_URL}/agent/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, reporterId }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to process complaint (${res.status})`)
  }

  return res.json()
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${BASE_URL}/incidents`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch incidents')
  }
  const data = await res.json()
  return data.incidents || []
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents/${encodeURIComponent(id)}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Incident ${id} not found`)
  }
  const data = await res.json()
  return data.incident
}

export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  const res = await fetch(`${BASE_URL}/incidents/stats`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch operations statistics')
  }
  return res.json()
}

export async function updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to update status')
  }
  const data = await res.json()
  return data.incident
}

export async function deleteIncidentApi(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/incidents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to delete incident')
  }
  const data = await res.json()
  return data.success
}

export async function bulkUpdateIncidentStatus(ids: string[], status: IncidentStatus): Promise<Incident[]> {
  const res = await fetch(`${BASE_URL}/incidents/bulk-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to bulk update incidents')
  }
  const data = await res.json()
  return data.incidents
}

export async function verifyIncidentResolution(id: string): Promise<{ verification: string; incident: Incident }> {
  const res = await fetch(`${BASE_URL}/incidents/${encodeURIComponent(id)}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to verify resolution with AI')
  }
  return res.json()
}

export async function resolveIncident(id: string, resolutionNote?: string): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents/${encodeURIComponent(id)}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolutionNote }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to resolve incident')
  }
  const data = await res.json()
  return data.incident
}

export async function approveIncidentRecommendation(id: string, approver?: string): Promise<Incident> {
  const res = await fetch(`${BASE_URL}/incidents/${encodeURIComponent(id)}/approve-recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approver }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to approve recommendation')
  }
  const data = await res.json()
  return data.incident
}

// ── Notifications API ─────────────────────────

export async function fetchNotifications(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/notifications`)
  if (!res.ok) return []
  const data = await res.json()
  return data.notifications || []
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${BASE_URL}/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }).catch(() => {})
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${BASE_URL}/notifications/read-all`, { method: 'PATCH' }).catch(() => {})
}
