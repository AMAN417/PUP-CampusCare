// Focused tests for CampusOps AI agent
// Run with: npx ts-node src/test/agent.test.ts
// Tests: health endpoint, empty input rejection, tool schema validation, mock pipeline

import 'dotenv/config'

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

// ── Test 1: Health endpoint ───────────────────────────────────────────────────
async function testHealthEndpoint() {
  console.log('\n[1] Health endpoint')
  try {
    const res = await fetch('http://localhost:3001/api/health')
    const body = await res.json() as { status?: string }
    if (res.ok && body.status === 'ok') ok('GET /api/health → 200 { status: "ok" }')
    else fail('Health endpoint', `unexpected response: ${JSON.stringify(body)}`)
  } catch {
    fail('Health endpoint', 'Server not reachable — is it running on port 3001?')
  }
}

// ── Test 2: Empty input rejection ─────────────────────────────────────────────
async function testEmptyInputRejection() {
  console.log('\n[2] Empty input rejection')
  try {
    const res = await fetch('http://localhost:3001/api/agent/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    })
    if (res.status === 400) ok('POST /api/agent/report with empty message → 400')
    else fail('Empty message rejection', `expected 400, got ${res.status}`)

    const res2 = await fetch('http://localhost:3001/api/agent/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (res2.status === 400) ok('POST /api/agent/report with missing message → 400')
    else fail('Missing message rejection', `expected 400, got ${res2.status}`)
  } catch {
    fail('Empty input rejection', 'Server not reachable')
  }
}

// ── Test 3: Tool schema validation ────────────────────────────────────────────
async function testToolSchemas() {
  console.log('\n[3] Tool schema validation')
  try {
    const { toolDefinitions } = await import('../agent/tools')
    const requiredTools = [
      'classify_complaint',
      'extract_details',
      'determine_priority',
      'assign_department',
      'create_incident',
      'get_incident_status',
    ]

    for (const name of requiredTools) {
      const def = toolDefinitions.find((t) => t.name === name)
      if (!def) { fail(`Tool exists: ${name}`, 'Not found in toolDefinitions'); continue }
      if (!def.parameters) { fail(`Tool has parameters: ${name}`, 'Missing parameters schema'); continue }
      ok(`Tool schema valid: ${name}`)
    }
  } catch (err) {
    fail('Tool schema import', String(err))
  }
}

// ── Test 4: Dispatcher does not crash ─────────────────────────────────────────
async function testDispatcher() {
  console.log('\n[4] Tool dispatcher (no Firestore/Gemini required)')
  try {
    const { dispatchTool } = await import('../agent/handlers')

    const r1 = await dispatchTool('classify_complaint', {
      category: 'electrical', confidence: 0.9, reasoning: 'Mentions wiring'
    })
    if (r1.success && r1.category === 'electrical') ok('classify_complaint handler')
    else fail('classify_complaint handler', JSON.stringify(r1))

    const r2 = await dispatchTool('extract_details', { location: 'Block B Lab 3', building: 'Block B', floor: '2nd' })
    if (r2.success && r2.location === 'Block B Lab 3') ok('extract_details handler')
    else fail('extract_details handler', JSON.stringify(r2))

    const r3 = await dispatchTool('extract_details', {}) // missing location
    if (!r3.success) ok('extract_details rejects missing location')
    else fail('extract_details missing location guard', 'Should have failed')

    const r4 = await dispatchTool('assign_department', { department: 'Electrical Maintenance', escalationRequired: true })
    if (r4.success && r4.department === 'Electrical Maintenance') ok('assign_department handler')
    else fail('assign_department handler', JSON.stringify(r4))

    const r5 = await dispatchTool('unknown_tool', {})
    if (!r5.success) ok('Unknown tool returns failure')
    else fail('Unknown tool guard', 'Should have returned failure')
  } catch (err) {
    fail('Dispatcher test', String(err))
  }
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function run() {
  console.log('═══════════════════════════════════════')
  console.log('  CampusOps AI — Focused Test Suite')
  console.log('═══════════════════════════════════════')

  await testHealthEndpoint()
  await testEmptyInputRejection()
  await testToolSchemas()
  await testDispatcher()

  console.log('\n═══════════════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('═══════════════════════════════════════\n')
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('Test runner crashed:', err)
  process.exit(1)
})
