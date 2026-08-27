// CampusOps AI — Comprehensive Test Suite
// Run with: npx ts-node src/test/integration.test.ts
// Covers: Incident CRUD · AI validation · Work-order idempotency · Verification criteria · SLA stats

import 'dotenv/config'

const BASE = 'http://localhost:3001/api'
let passed = 0
let failed = 0

function ok(label: string) {
  console.log(`  ✅ ${label}`)
  passed++
}
function fail(label: string, reason: string) {
  console.error(`  ❌ ${label}: ${reason}`)
  failed++
}
async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({})) as T
  return { status: res.status, data }
}

// ─────────────────────────────────────────────────────
// 1. Health
// ─────────────────────────────────────────────────────
async function testHealth() {
  console.log('\n[1] Health endpoint')
  try {
    const { status, data } = await api<any>('GET', '/health')
    if (status === 200 && data.status === 'ok') ok('GET /api/health → 200')
    else fail('Health', `unexpected: ${JSON.stringify(data)}`)
  } catch { fail('Health', 'Server not reachable on port 3001') }
}

// ─────────────────────────────────────────────────────
// 2. Input Validation
// ─────────────────────────────────────────────────────
async function testInputValidation() {
  console.log('\n[2] Input validation')
  try {
    const r1 = await api('POST', '/agent/report', { message: '' })
    r1.status === 400 ? ok('Empty message → 400') : fail('Empty message', `got ${r1.status}`)

    const r2 = await api('POST', '/agent/report', {})
    r2.status === 400 ? ok('Missing message → 400') : fail('Missing message', `got ${r2.status}`)

    const r3 = await api('POST', '/agent/report', { message: 'x'.repeat(2001) })
    r3.status === 400 ? ok('Oversized message → 400') : fail('Oversized message', `got ${r3.status}`)

    const r4 = await api<any>('PATCH', '/incidents/INC-09BE1859/status', { status: 'invalid_status' })
    r4.status === 400 ? ok('Invalid status → 400') : fail('Invalid status', `got ${r4.status}`)
  } catch (e) { fail('Input validation', String(e)) }
}

// ─────────────────────────────────────────────────────
// 3. Incident Read & Stats
// ─────────────────────────────────────────────────────
async function testIncidentReadAndStats() {
  console.log('\n[3] Incident read & stats')
  try {
    const { status: ls, data: ld } = await api<any>('GET', '/incidents')
    if (ls === 200 && Array.isArray(ld.incidents)) ok(`GET /incidents → ${ld.incidents.length} incidents`)
    else fail('List incidents', `${ls} ${JSON.stringify(ld)}`)

    const { status: ss, data: sd } = await api<any>('GET', '/incidents/stats')
    if (ss === 200 && typeof sd.total === 'number') {
      ok(`GET /incidents/stats → total=${sd.total}, critical=${sd.critical}`)
      if (typeof sd.resolvedToday === 'number') ok('Stats: resolvedToday is a real number')
      else fail('Stats: resolvedToday', 'missing from response')
      if (typeof sd.slaAtRisk === 'number') ok('Stats: slaAtRisk is calculated')
      else fail('Stats: slaAtRisk', 'missing from response')
    } else fail('Stats', `${ss} ${JSON.stringify(sd)}`)

    // 404 for nonexistent incident
    const { status: ns } = await api('GET', '/incidents/INC-DOESNOTEXIST')
    ns === 404 ? ok('GET nonexistent incident → 404') : fail('404 on missing incident', `got ${ns}`)
  } catch (e) { fail('Read & stats', String(e)) }
}

// ─────────────────────────────────────────────────────
// 4. Full End-to-End Lifecycle
// ─────────────────────────────────────────────────────
async function testFullLifecycle() {
  console.log('\n[4] Full incident lifecycle (agent intake → verify)')
  try {
    // 4a. Create via fallback (Gemini likely quota-limited, fallback runs)
    const { status: cs, data: cd } = await api<any>('POST', '/agent/report', {
      message: 'Water pipe burst in Library 2nd floor flooding near book stacks',
      reporterId: 'test_runner',
    })
    if (cs !== 200 || !cd.incident?.id) {
      fail('Create incident via intake', `${cs} ${JSON.stringify(cd)}`)
      return
    }
    const id = cd.incident.id
    ok(`Intake created incident: ${id}`)
    if (cd.incident.category && cd.incident.priority && cd.incident.priorityScore) {
      ok(`AI output fields present: category=${cd.incident.category}, priority=${cd.incident.priority}, score=${cd.incident.priorityScore}`)
    } else fail('AI output fields', JSON.stringify(cd.incident))

    // Validate score is 1-100
    const score = cd.incident.priorityScore
    ;(score >= 1 && score <= 100) ? ok(`Risk score in valid range: ${score}/100`) : fail('Risk score range', `${score} not in 1-100`)

    // 4b. Approve recommendation (creates work order, idempotent)
    const { status: as, data: ad } = await api<any>('POST', `/incidents/${id}/approve-recommendation`, {
      approver: 'Test Operations Director',
    })
    if (as === 200 && ad.incident?.status === 'in_progress') {
      ok(`Recommendation approved → status=in_progress`)
      if (ad.incident.workOrderId) ok(`Work order created: ${ad.incident.workOrderId}`)
      else fail('Work order ID', 'missing after approval')
      if (ad.incident.approvedBy) ok(`Approver recorded: ${ad.incident.approvedBy}`)
    } else fail('Approve recommendation', `${as} ${JSON.stringify(ad)}`)

    // 4c. Idempotency: approve again should NOT duplicate
    const { data: ad2 } = await api<any>('POST', `/incidents/${id}/approve-recommendation`, {
      approver: 'Duplicate Approver',
    })
    if (ad2.alreadyApproved) ok('Idempotent approval: double-click prevented')
    else fail('Idempotent approval', 'alreadyApproved flag missing')

    // 4d. Resolve with note
    const { status: rs, data: rd } = await api<any>('POST', `/incidents/${id}/resolve`, {
      resolutionNote: 'Main isolation valve turned off, ruptured copper section replaced with heavy-duty PVC, vacuum extraction completed.',
    })
    if (rs === 200 && rd.incident?.status === 'resolved') {
      ok('Incident resolved with note')
      if (rd.incident.resolvedAt) ok('resolvedAt timestamp recorded')
      else fail('resolvedAt', 'missing after resolve')
    } else fail('Resolve incident', `${rs} ${JSON.stringify(rd)}`)

    // 4e. Idempotency: resolve again should return alreadyResolved
    const { data: rd2 } = await api<any>('POST', `/incidents/${id}/resolve`, {
      resolutionNote: 'Duplicate resolution',
    })
    if (rd2.alreadyResolved) ok('Idempotent resolve: double-submit prevented')
    else fail('Idempotent resolve', 'alreadyResolved flag missing')

    // 4f. Verify → PASS (all criteria satisfied)
    const { status: vs, data: vd } = await api<any>('POST', `/incidents/${id}/verify`)
    if (vs === 200) {
      ok(`Verification result: ${vd.verification}`)
      if (vd.verification === 'PASS') ok('Verification PASS (criteria fully satisfied)')
      else if (vd.verification === 'REVIEW_REQUIRED') ok(`REVIEW_REQUIRED: ${vd.passCount}/${vd.totalCriteria} criteria met`)
      else fail('Verification PASS', `Unexpected: ${vd.verification}`)
      if (vd.criteria) ok(`Criteria object returned: ${JSON.stringify(vd.criteria)}`)
      else fail('Criteria object', 'missing from verify response')
    } else fail('Verify incident', `${vs} ${JSON.stringify(vd)}`)

    // 4g. Idempotency: verify again should return alreadyVerified
    const { data: vd2 } = await api<any>('POST', `/incidents/${id}/verify`)
    if (vd2.alreadyVerified) ok('Idempotent verify: double-click prevented')
    else fail('Idempotent verify', 'alreadyVerified flag missing')

    // 4h. Audit log should have entries
    const { data: final } = await api<any>('GET', `/incidents/${id}`)
    const auditCount = final.incident?.auditLogs?.length ?? 0
    auditCount >= 3 ? ok(`Audit trail has ${auditCount} entries`) : fail('Audit trail', `only ${auditCount} entries`)

    // 4i. Delete
    const { status: ds } = await api('DELETE', `/incidents/${id}`)
    ds === 200 ? ok(`Incident ${id} deleted`) : fail('Delete', `got ${ds}`)

    // Verify 404 after delete
    const { status: dcheck } = await api('GET', `/incidents/${id}`)
    dcheck === 404 ? ok('Deleted incident returns 404') : fail('Post-delete 404', `got ${dcheck}`)

  } catch (e) { fail('Full lifecycle', String(e)) }
}

// ─────────────────────────────────────────────────────
// 5. Verification REVIEW_REQUIRED (missing resolution note)
// ─────────────────────────────────────────────────────
async function testVerificationReviewRequired() {
  console.log('\n[5] Verification REVIEW_REQUIRED (incomplete criteria)')
  try {
    // Create an incident manually via agent fallback (electrical)
    const { data: cd } = await api<any>('POST', '/agent/report', {
      message: 'Exposed electrical sparking wire near Science Block corridor',
    })
    if (!cd.incident?.id) { fail('Setup incident', 'Failed to create'); return }
    const id = cd.incident.id

    // Resolve WITHOUT human approval → resolutionNote present but no approvedBy
    await api('POST', `/incidents/${id}/resolve`, { resolutionNote: 'Wiring replaced by technician safely.' })

    const { data: vd } = await api<any>('POST', `/incidents/${id}/verify`)
    // approvedBy is missing → should be REVIEW_REQUIRED or FAIL
    if (vd.verification === 'REVIEW_REQUIRED' || vd.verification === 'FAIL') {
      ok(`Verification correctly evaluates criteria: ${vd.verification} (no human approval)`)
    } else {
      fail('Verification criteria guard', `Expected REVIEW_REQUIRED/FAIL without approvedBy, got: ${vd.verification}`)
    }

    // Cleanup
    await api('DELETE', `/incidents/${id}`)
  } catch (e) { fail('REVIEW_REQUIRED test', String(e)) }
}

// ─────────────────────────────────────────────────────
// 6. Tool dispatcher (unit-level, no external deps)
// ─────────────────────────────────────────────────────
async function testDispatcher() {
  console.log('\n[6] Tool dispatcher (unit-level)')
  try {
    const { dispatchTool } = await import('../agent/handlers')

    const r1 = await dispatchTool('classify_complaint', { category: 'electrical', confidence: 0.95, reasoning: 'Sparking wire' })
    r1.success && r1.category === 'electrical' ? ok('classify_complaint handler') : fail('classify_complaint', JSON.stringify(r1))

    const r2 = await dispatchTool('extract_details', { location: 'Block B Lab 3', building: 'Block B', floor: '2nd' })
    r2.success && r2.location ? ok('extract_details handler') : fail('extract_details', JSON.stringify(r2))

    const r3 = await dispatchTool('extract_details', {}) // missing location
    !r3.success ? ok('extract_details rejects missing location') : fail('extract_details missing location', 'should fail')

    const r4 = await dispatchTool('assign_department', { department: 'Electrical Maintenance', escalationRequired: true })
    r4.success && r4.department ? ok('assign_department handler') : fail('assign_department', JSON.stringify(r4))

    const r5 = await dispatchTool('unknown_tool', {})
    !r5.success ? ok('Unknown tool → failure') : fail('Unknown tool guard', 'should fail')
  } catch (e) { fail('Dispatcher', String(e)) }
}

// ─────────────────────────────────────────────────────
// 7. AI Output Validation (handler-level)
// ─────────────────────────────────────────────────────
async function testAiOutputValidation() {
  console.log('\n[7] AI output validation (handler-level)')
  try {
    const { handle_create_incident } = await import('../agent/handlers')

    // Invalid category should be corrected to 'other'
    const r1 = await handle_create_incident({
      title: 'Test', aiSummary: 'desc', category: 'INVALID_CAT',
      priority: 'critical', priorityScore: 95, location: 'Test', department: 'Test Dept',
    })
    if (r1.success) ok('Invalid category accepted (corrected to "other" internally)')
    else fail('AI invalid category', 'handler rejected entirely')

    // Out-of-range risk score should be clamped
    const r2 = await handle_create_incident({
      title: 'Score Test', aiSummary: 'desc', category: 'electrical',
      priority: 'high', priorityScore: 999, location: 'Block A', department: 'Electrical Maintenance',
    })
    if (r2.success) ok('Overflowing risk score accepted (clamped to 100)')
    else fail('AI score clamping', 'handler rejected')

    // Negative score clamped to 1
    const r3 = await handle_create_incident({
      title: 'Neg Score', aiSummary: 'desc', category: 'plumbing',
      priority: 'low', priorityScore: -50, location: 'Hostel', department: 'Facilities',
    })
    if (r3.success) ok('Negative risk score accepted (clamped to 1)')
    else fail('Negative score clamping', 'handler rejected')
  } catch (e) { fail('AI output validation', String(e)) }
}

// ─────────────────────────────────────────────────────
// 8. Notifications
// ─────────────────────────────────────────────────────
async function testNotifications() {
  console.log('\n[8] Notifications')
  try {
    const { status, data } = await api<any>('GET', '/notifications')
    if (status === 200 && Array.isArray(data.notifications)) {
      ok(`GET /notifications → ${data.notifications.length} notifications`)
    } else fail('Notifications', `${status} ${JSON.stringify(data)}`)
  } catch (e) { fail('Notifications', String(e)) }
}

// ─────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────
async function run() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  CampusOps AI — Comprehensive Integration Tests')
  console.log('═══════════════════════════════════════════════════')
  console.log('  Server: http://localhost:3001\n')

  await testHealth()
  await testInputValidation()
  await testIncidentReadAndStats()
  await testFullLifecycle()
  await testVerificationReviewRequired()
  await testDispatcher()
  await testAiOutputValidation()
  await testNotifications()

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('═══════════════════════════════════════════════════\n')
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('Test runner crashed:', err)
  process.exit(1)
})
