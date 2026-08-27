// Minimal Firestore utility helpers (server-side, Admin SDK)
import { db } from '../firebase'
import type { Incident, User, Notification } from '../types'
import { randomUUID } from 'crypto'

// In-memory fallback store when Firebase credentials are not yet configured
const inMemoryIncidents = new Map<string, Incident>()
const inMemoryNotifications = new Map<string, Notification>()

// Pre-seed realistic initial incidents for enterprise simulation
function seedInitialData() {
  const seeds: Incident[] = [
    {
      id: 'INC-09BE1859',
      title: 'Exposed & Sparking Electrical Conduits near Washroom',
      description: 'The electrical wire near the Block B second floor washroom is exposed and sparking. Students are using this corridor continuously.',
      category: 'electrical',
      priority: 'critical',
      priorityScore: 95,
      location: 'Block B, 2nd Floor Corridor near Washroom',
      building: 'Block B',
      floor: '2nd Floor',
      department: 'Electrical Maintenance',
      status: 'in_progress',
      reporterId: 'student_771',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      aiSummary: 'Live electrical spark detected along high-traffic student transit corridor. Critical shock and fire risk identified.',
      aiReasoning: 'Exposed live wiring in damp washroom corridor poses immediate life safety risk. High priority score calibrated due to active student footfall.',
    },
    {
      id: 'INC-08FA4421',
      title: 'Main Supply Pipeline Rupture Flooding Lift Lobby',
      description: 'Major water pipeline rupture in Girls Hostel Block 3 ground floor corridor causing rapid flooding near the elevator pit.',
      category: 'plumbing',
      priority: 'high',
      priorityScore: 82,
      location: 'Girls Hostel Block 3, Ground Floor Lift Lobby',
      building: 'Girls Hostel Block 3',
      floor: 'Ground Floor',
      department: 'Facilities & Plumbing',
      status: 'assigned',
      reporterId: 'warden_02',
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      aiSummary: 'High-volume water main leak threatening lift electrical shaft and slip hazard in residential lobby.',
      aiReasoning: 'Water accumulation adjacent to elevator shaft requires immediate isolation of main valve to prevent mechanical damage.',
    },
    {
      id: 'INC-07CC3190',
      title: 'Computer Lab 402 HVAC Compressor Failure During Exams',
      description: 'Central AC unit in Computer Lab 402 Science Block has stopped working and is making a loud rattling sound during lab exams.',
      category: 'classroom',
      priority: 'medium',
      priorityScore: 58,
      location: 'Science Block, Room 402',
      building: 'Science Block',
      floor: '4th Floor',
      department: 'HVAC & Maintenance',
      status: 'submitted',
      reporterId: 'prof_sharma',
      createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      aiSummary: 'Thermal overload and mechanical failure on central AC unit affecting 60 student workstations.',
      aiReasoning: 'Moderate urgency: lab temperature elevated during ongoing mid-semester exams, non-life-threatening.',
    },
    {
      id: 'INC-06DD9120',
      title: 'Central Library 3rd Floor Core WiFi Access Point Down',
      description: 'The WiFi access point on the 3rd floor Central Library reading hall is completely dead with no signal for 2 hours.',
      category: 'internet',
      priority: 'medium',
      priorityScore: 60,
      location: 'Central Library, 3rd Floor Reading Hall',
      building: 'Central Library',
      floor: '3rd Floor',
      department: 'IT Support & Telecom',
      status: 'resolved',
      reporterId: 'student_librarian',
      createdAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      aiSummary: 'PoE power injector tripped on core access point. Service restored via reboot & firmware check.',
      aiReasoning: 'IT connectivity outage impacting study zones; routed to network administrators.',
    },
    {
      id: 'INC-05AA1084',
      title: 'Broken Exterior Security Lighting at East Gate Perimeter',
      description: 'Three high-mast perimeter floodlights are out near East Gate boundary wall creating a dark blind spot.',
      category: 'security',
      priority: 'high',
      priorityScore: 78,
      location: 'East Gate Perimeter Road',
      building: 'East Boundary',
      floor: 'Ground',
      department: 'Campus Security',
      status: 'in_progress',
      reporterId: 'guard_singh',
      createdAt: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      aiSummary: 'Nighttime security vulnerability detected on outer boundary perimeter.',
      aiReasoning: 'Perimeter darkness creates physical security blindspot; high priority escalation to security patrols.',
    },
  ]

  for (const s of seeds) {
    inMemoryIncidents.set(s.id, s)
  }

  // Pre-seed actionable notifications
  const notifs: Notification[] = [
    {
      id: 'notif_01',
      userId: 'admin_all',
      incidentId: 'INC-09BE1859',
      title: 'Critical Hazard Dispatched',
      message: 'Critical electrical incident at Block B assigned to Electrical Maintenance.',
      type: 'assignment',
      read: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_02',
      userId: 'admin_all',
      incidentId: 'INC-08FA4421',
      title: 'High Priority Flooding Alert',
      message: 'Water leakage in Girls Hostel Block 3 assigned to Facilities & Plumbing.',
      type: 'status_update',
      read: false,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_03',
      userId: 'admin_all',
      incidentId: 'INC-06DD9120',
      title: 'Incident Resolved & Verified',
      message: 'WiFi access point in Central Library marked as Resolved.',
      type: 'resolution',
      read: true,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ]

  for (const n of notifs) {
    inMemoryNotifications.set(n.id, n)
  }
}

seedInitialData()

// ── Incidents ────────────────────────────────

export const incidentsRef = () => db?.collection ? db.collection('incidents') : null
export const notificationsRef = () => db?.collection ? db.collection('notifications') : null


export async function getAllIncidents(): Promise<Incident[]> {
  try {
    const ref = incidentsRef()
    if (ref) {
      const snap = await ref.orderBy('createdAt', 'desc').get()
      if (!snap.empty) {
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Incident))
      }
    }
  } catch (err) {
    console.warn('[Firestore] getAllIncidents error, using in-memory store:', (err as Error).message)
  }
  return Array.from(inMemoryIncidents.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  try {
    const ref = incidentsRef()
    if (ref) {
      const snap = await ref.doc(id).get()
      if (snap.exists) return { id: snap.id, ...snap.data() } as Incident
    }
  } catch (err) {
    console.warn('[Firestore] getIncidentById error, checking in-memory store:', (err as Error).message)
  }
  return inMemoryIncidents.get(id) || null
}

export async function createIncident(data: Partial<Incident> & Omit<Incident, 'id'>): Promise<string> {
  const generatedId = (data as any).id || 'INC-' + randomUUID().substring(0, 8).toUpperCase()
  const payload = { ...data, id: generatedId }
  try {
    const ref = incidentsRef()
    if (ref) {
      await ref.doc(generatedId).set(payload)
      inMemoryIncidents.set(generatedId, payload as Incident)
      return generatedId
    }
  } catch (err) {
    console.warn('[Firestore] createIncident failed (credentials incomplete), saved in-memory:', (err as Error).message)
  }

  // Fallback in-memory
  const incident: Incident = payload as Incident
  inMemoryIncidents.set(generatedId, incident)
  return generatedId
}

export async function updateIncident(id: string, data: Partial<Incident>): Promise<void> {
  try {
    const ref = incidentsRef()
    if (ref) {
      await ref.doc(id).update({ ...data, updatedAt: new Date().toISOString() })
    }
  } catch (err) {
    console.warn('[Firestore] updateIncident fallback:', (err as Error).message)
  }
  const existing = inMemoryIncidents.get(id)
  if (existing) {
    inMemoryIncidents.set(id, { ...existing, ...data, updatedAt: new Date().toISOString() })
  }
}

export async function deleteIncident(id: string): Promise<boolean> {
  try {
    const ref = incidentsRef()
    if (ref) {
      await ref.doc(id).delete()
    }
  } catch (err) {
    console.warn('[Firestore] deleteIncident fallback:', (err as Error).message)
  }
  const existed = inMemoryIncidents.has(id)
  inMemoryIncidents.delete(id)
  return existed
}

// ── Users ─────────────────────────────────────

export const usersRef = () => db?.collection ? db.collection('users') : null

export async function getUserById(id: string): Promise<User | null> {
  try {
    const ref = usersRef()
    if (ref) {
      const snap = await ref.doc(id).get()
      if (snap.exists) return { id: snap.id, ...snap.data() } as User
    }
  } catch {
    // fallback
  }
  return null
}

export async function upsertUser(id: string, data: Omit<User, 'id'>): Promise<void> {
  try {
    const ref = usersRef()
    if (ref) {
      await ref.doc(id).set(data, { merge: true })
    }
  } catch {
    // fallback
  }
}

// ── Notifications ─────────────────────────────

export async function createNotification(data: Omit<Notification, 'id'>): Promise<string> {
  const generatedId = 'notif_' + randomUUID().substring(0, 8)
  try {
    const ref = notificationsRef()
    if (ref) {
      const docRef = await ref.add(data)
      return docRef.id
    }
  } catch {
    // fallback
  }
  const notif: Notification = { id: generatedId, ...data }
  inMemoryNotifications.set(generatedId, notif)
  return generatedId
}

export async function getAllNotifications(): Promise<Notification[]> {
  try {
    const ref = notificationsRef()
    if (ref) {
      const snap = await ref.orderBy('createdAt', 'desc').get()
      if (!snap.empty) {
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification))
      }
    }
  } catch {
    // fallback
  }
  return Array.from(inMemoryNotifications.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const ref = notificationsRef()
    if (ref) {
      await ref.doc(id).update({ read: true })
    }
  } catch {
    // fallback
  }
  const existing = inMemoryNotifications.get(id)
  if (existing) {
    inMemoryNotifications.set(id, { ...existing, read: true })
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const ref = notificationsRef()
    if (ref) {
      const snap = await ref.where('read', '==', false).get()
      const batch = db?.batch ? db.batch() : null
      if (batch) {
        snap.docs.forEach((d) => batch.update(d.ref, { read: true }))
        await batch.commit()
      }
    }
  } catch {
    // fallback
  }
  for (const [id, notif] of inMemoryNotifications.entries()) {
    inMemoryNotifications.set(id, { ...notif, read: true })
  }
}
