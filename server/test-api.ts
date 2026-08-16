import { createApp } from './src/app.js';
import { Server } from 'http';

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}/api/campuscare`;

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  details?: string;
}

const results: TestResult[] = [];

const runTests = async () => {
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  console.log(`\n🧪 Running PUP CampusCare API Test Suite on port ${TEST_PORT}...\n`);

  try {
    // 1. Health Check
    {
      const res = await fetch(`${BASE_URL}/health`);
      const body = await res.json() as any;
      const passed = res.status === 200 && body.success === true && body.data?.status === 'UP';
      results.push({
        name: 'GET /api/campuscare/health (Health check)',
        passed,
        status: res.status,
        details: `Message: "${body.message}" | Environment: ${body.data?.environment}`,
      });
    }

    // 2. List Complaints
    {
      const res = await fetch(`${BASE_URL}/complaints`);
      const body = await res.json() as any;
      const passed = res.status === 200 && body.success === true && Array.isArray(body.data) && body.data.length >= 5;
      results.push({
        name: 'GET /api/campuscare/complaints (List complaints)',
        passed,
        status: res.status,
        details: `Found ${body.data?.length} seed complaints in storage.`,
      });
    }

    // 3. Single Complaint Lookup
    {
      const res = await fetch(`${BASE_URL}/complaints/PUP-2026-0101`);
      const body = await res.json() as any;
      const passed = res.status === 200 && body.success === true && body.data?.id === 'PUP-2026-0101';
      results.push({
        name: 'GET /api/campuscare/complaints/PUP-2026-0101 (Get single complaint)',
        passed,
        status: res.status,
        details: `Title: "${body.data?.title?.slice(0, 40)}..." | Category: ${body.data?.category}`,
      });
    }

    // 4. Create New Complaint
    let createdId = '';
    {
      const payload = {
        title: 'Water Cooler Filter Replacement in Library Ground Floor',
        description: 'The drinking water cooler in the central library reading hall is dispensing cloudy water with high TDS. Filter needs replacement.',
        category: 'Water',
        location: 'Bhai Kahn Singh Nabha Central Library - Ground Floor',
        priority: 'Medium',
        studentName: 'Harmanpreet Singh',
        studentRollNo: 'PUP2024-CS-042',
      };

      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json() as any;
      createdId = body.data?.id || '';
      const passed = res.status === 201 && body.success === true && createdId.startsWith('PUP-');
      results.push({
        name: 'POST /api/campuscare/complaints (Submit new complaint)',
        passed,
        status: res.status,
        details: `Generated ID: ${createdId} | Status: ${body.data?.status}`,
      });
    }

    // 5. Patch Complaint (Assign Officer & Department)
    if (createdId) {
      const patchPayload = {
        assignedDepartment: 'Water Supply & Public Health',
        assignedTo: 'Er. Gurpreet Singh',
        priority: 'High',
      };

      const res = await fetch(`${BASE_URL}/complaints/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload),
      });
      const body = await res.json() as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        body.data?.assignedDepartment === 'Water Supply & Public Health' &&
        body.data?.assignedTo === 'Er. Gurpreet Singh' &&
        body.data?.priority === 'High';
      results.push({
        name: 'PATCH /api/campuscare/complaints/:id (Assign Department & Officer)',
        passed,
        status: res.status,
        details: `Assigned: ${body.data?.assignedTo} (${body.data?.assignedDepartment})`,
      });
    }

    // 6. Advance Status (Submitted -> Under Review)
    if (createdId) {
      const statusPayload = {
        status: 'Under Review',
        notes: 'Helpdesk review conducted. Work order requested.',
        department: 'Water Supply & Public Health',
      };

      const res = await fetch(`${BASE_URL}/complaints/${createdId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusPayload),
      });
      const body = await res.json() as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        body.data?.status === 'Under Review' &&
        body.data?.statusHistory?.length >= 2;
      results.push({
        name: 'POST /api/campuscare/complaints/:id/status (Advance status to Under Review)',
        passed,
        status: res.status,
        details: `Current Status: ${body.data?.status} | History steps: ${body.data?.statusHistory?.length}`,
      });
    }

    // 7. Add Comment
    if (createdId) {
      const commentPayload = {
        message: 'Technician has collected water sample for laboratory testing.',
        userName: 'Er. Gurpreet Singh (WSPH)',
        userRole: 'admin',
        isInternal: false,
      };

      const res = await fetch(`${BASE_URL}/complaints/${createdId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload),
      });
      const body = await res.json() as any;
      const passed =
        res.status === 201 &&
        body.success === true &&
        body.data?.comment?.message === commentPayload.message;
      results.push({
        name: 'POST /api/campuscare/complaints/:id/comments (Add comment/response)',
        passed,
        status: res.status,
        details: `Author: ${body.data?.comment?.userName} | ID: ${body.data?.comment?.id}`,
      });
    }

    // 8. Notifications List
    {
      const res = await fetch(`${BASE_URL}/notifications`);
      const body = await res.json() as any;
      const passed = res.status === 200 && body.success === true && Array.isArray(body.data) && body.data.length >= 3;
      results.push({
        name: 'GET /api/campuscare/notifications (List notifications)',
        passed,
        status: res.status,
        details: `Total notifications in queue: ${body.data?.length}`,
      });
    }

    // 9. Negative Test 1: Invalid Status Transition (Under Review -> Resolved directly is rejected)
    if (createdId) {
      const invalidStatusPayload = {
        status: 'Resolved', // Invalid jump (must go to Assigned -> In Progress first)
      };

      const res = await fetch(`${BASE_URL}/complaints/${createdId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidStatusPayload),
      });
      const body = await res.json() as any;
      const passed = res.status === 400 && body.success === false && body.error?.includes('Invalid status transition');
      results.push({
        name: 'Negative Test: Invalid status lifecycle jump (Expected 400 Bad Request)',
        passed,
        status: res.status,
        details: `Rejected correctly with message: "${body.error}"`,
      });
    }

    // 10. Negative Test 2: Missing Required Fields on Create
    {
      const invalidPayload = {
        title: 'A', // Too short
        category: 'InvalidCategory', // Invalid enum
        location: '', // Missing
        // Missing priority and description
      };

      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });
      const body = await res.json() as any;
      const passed = res.status === 400 && body.success === false && Array.isArray(body.errors) && body.errors.length >= 3;
      results.push({
        name: 'Negative Test: Validation schema error with multiple fields (Expected 400 Bad Request)',
        passed,
        status: res.status,
        details: `Validation errors caught (${body.errors?.length}): ${body.errors?.slice(0, 2).join('; ')}`,
      });
    }

    // 11. Negative Test 3: Non-existent Complaint ID (404)
    {
      const res = await fetch(`${BASE_URL}/complaints/PUP-2026-9999`);
      const body = await res.json() as any;
      const passed = res.status === 404 && body.success === false && body.error?.includes('not found');
      results.push({
        name: 'Negative Test: Nonexistent complaint ID lookup (Expected 404 Not Found)',
        passed,
        status: res.status,
        details: `Error returned: "${body.error}"`,
      });
    }

    // 12. Negative Test 4: Malformed Complaint ID format
    {
      const res = await fetch(`${BASE_URL}/complaints/invalid*id!%23`);
      const body = await res.json() as any;
      const passed = res.status === 400 && body.success === false && body.error?.includes('Invalid complaint ID format');
      results.push({
        name: 'Negative Test: Malformed complaint ID format (Expected 400 Bad Request)',
        passed,
        status: res.status,
        details: `Error returned: "${body.error}"`,
      });
    }

  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }

  // Print summary report
  console.log('='.repeat(70));
  console.log('  📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(70));
  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} [${r.status}] ${r.name}`);
    if (r.details) console.log(`   └─ ${r.details}`);
    if (!r.passed) allPassed = false;
  }
  console.log('='.repeat(70));

  if (!allPassed) {
    console.error('\n❌ Some API tests failed.');
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${results.length} API test cases passed successfully!`);
  }
};

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
