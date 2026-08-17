import { createApp } from './src/app.js';
import { Server } from 'http';
import { config, isSupabaseConfigured, getDataProvider } from './src/config/environment.js';
import { repositoryRegistry } from './src/repositories/index.js';
import { verifySupabaseConnection } from './src/database/verifyConnection.js';

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
  console.log('\n======================================================================');
  console.log('  🔍 ENVIRONMENT & CONFIGURATION VERIFICATION');
  console.log('======================================================================');
  console.log(`• DATA_PROVIDER:             ${getDataProvider()}`);
  console.log(`• SUPABASE_URL configured:    ${Boolean(config.SUPABASE_URL && config.SUPABASE_URL.length > 0)}`);
  console.log(`• SUPABASE_KEY configured:    ${Boolean((config.SUPABASE_ANON_KEY || config.SUPABASE_SERVICE_ROLE_KEY) && (config.SUPABASE_ANON_KEY || config.SUPABASE_SERVICE_ROLE_KEY).length > 0)}`);
  console.log(`• isSupabaseConfigured:       ${isSupabaseConfigured()}`);
  console.log(`• NODE_ENV:                   ${config.NODE_ENV}`);
  console.log('======================================================================\n');

  if (getDataProvider() === 'supabase') {
    console.log('Testing Supabase connectivity...');
    const connected = await verifySupabaseConnection();
    if (!connected) {
      console.warn('\n⚠️ Supabase connection failed or tables do not exist yet in your Supabase project.');
      console.warn('ℹ️ Please execute "server/src/database/schema.sql" in your Supabase SQL Editor.');
      console.warn('ℹ️ Running test suite in In-Memory provider mode for validation...\n');
      process.env.DATA_PROVIDER = 'memory';
      repositoryRegistry.resetForTesting();
    }
  }

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  console.log(`\n🧪 Running PUP CampusCare API & RBAC Test Suite on port ${TEST_PORT} (Provider: ${getDataProvider()})...\n`);

  let studentToken = '';
  let studentUser: any = null;
  let adminToken = '';
  let adminUser: any = null;
  let createdComplaintId = '';

  try {
    // 1. Health Check (Public endpoint)
    {
      const res = await fetch(`${BASE_URL}/health`);
      const body = (await res.json()) as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        body.data?.status === 'UP';
      results.push({
        name: 'GET /api/campuscare/health (Public Health check)',
        passed,
        status: res.status,
        details: `Message: "${body.message}" | Environment: ${body.data?.environment}`,
      });
    }

    // 2. Unauthenticated check (Expected 401 Unauthorized)
    {
      const res = await fetch(`${BASE_URL}/complaints`);
      const body = (await res.json()) as any;
      const passed = res.status === 401 && body.success === false;
      results.push({
        name: 'Negative Test: GET /complaints without token (Expected 401 Unauthorized)',
        passed,
        status: res.status,
        details: `Correctly rejected unauthenticated request: "${body.error}"`,
      });
    }

    // 3. Student Registration (Immediate access, session token issued, no email verification gate)
    const studentEmail = `student.${Date.now()}.${Math.floor(Math.random() * 100000)}@demo.pup.ac.in`;
    {
      const registerPayload = {
        name: `Simranjeet Singh ${Math.floor(Math.random() * 1000)}`,
        email: studentEmail,
        password: 'password123',
        rollNo: 'PUP2024-CS-099',
        department: 'Department of Computer Science & Engineering',
        hostel: 'Banda Singh Bahadur Hostel',
      };

      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });
      const body = (await res.json()) as any;
      const registeredUser = body.data?.user || null;
      const issuedToken = body.data?.token;

      const passed =
        res.status === 201 &&
        body.success === true &&
        Boolean(issuedToken) &&
        registeredUser?.role === 'student';

      results.push({
        name: 'POST /api/campuscare/auth/register (Immediate registration with JWT token)',
        passed,
        status: res.status,
        details: `Registered: ${registeredUser?.name} (${registeredUser?.email}) | Token issued immediately: ${Boolean(issuedToken)}`,
      });

      // 3b. Login with freshly registered credentials
      {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: studentEmail, password: 'password123' }),
        });
        const loginBody = (await loginRes.json()) as any;
        const loginPassed =
          loginRes.status === 200 &&
          loginBody.success === true &&
          Boolean(loginBody.data?.token);

        results.push({
          name: 'POST /api/campuscare/auth/login (Immediate login with new credentials)',
          passed: loginPassed,
          status: loginRes.status,
          details: `Logged in user: ${loginBody.data?.user?.name} | Role: ${loginBody.data?.user?.role}`,
        });
      }

      // 3c. Negative test: Login with invalid password (Expected 401)
      {
        const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: studentEmail, password: 'wrongpassword' }),
        });
        const badLoginBody = (await badLoginRes.json()) as any;
        const badLoginPassed = badLoginRes.status === 401 && badLoginBody.success === false;

        results.push({
          name: 'Negative Auth Test: Wrong password (Expected 401 Unauthorized)',
          passed: badLoginPassed,
          status: badLoginRes.status,
          details: `Correctly rejected invalid password: "${badLoginBody.error}"`,
        });
      }
    }

    // 4. Student Demo Authentication (Verified demo student account)
    {
      const res = await fetch(`${BASE_URL}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'student' }),
      });
      const body = (await res.json()) as any;
      studentToken = body.data?.token || '';
      studentUser = body.data?.user || null;
      const passed =
        res.status === 200 &&
        body.success === true &&
        Boolean(studentToken) &&
        studentUser?.role === 'student';

      results.push({
        name: 'POST /api/campuscare/auth/demo-login (Student Demo Authentication)',
        passed,
        status: res.status,
        details: `Authenticated Student: ${studentUser?.name} (${studentUser?.email}) | Role: ${studentUser?.role}`,
      });
    }

    // 4b. Admin Demo Authentication (Verified demo admin account)
    {
      const res = await fetch(`${BASE_URL}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      const body = (await res.json()) as any;
      adminToken = body.data?.token || '';
      adminUser = body.data?.user || null;
      const passed =
        res.status === 200 &&
        body.success === true &&
        Boolean(adminToken) &&
        adminUser?.role === 'admin';

      results.push({
        name: 'POST /api/campuscare/auth/demo-login (Admin Demo Authentication)',
        passed,
        status: res.status,
        details: `Authenticated Admin: ${adminUser?.name} (${adminUser?.email}) | Role: ${adminUser?.role}`,
      });
    }

    // 5. Auth Me Profile Verification
    {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const body = (await res.json()) as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        body.data?.user?.email === studentUser?.email;

      results.push({
        name: 'GET /api/campuscare/auth/me (Verify Bearer token & Profile)',
        passed,
        status: res.status,
        details: `Verified Profile: ${body.data?.user?.name} | ID: ${body.data?.user?.id}`,
      });
    }

    // 6. Student creates complaint (server derives identity, ignores spoofed identity)
    {
      const complaintPayload = {
        title: 'Water Leakage in 2nd Floor Corridor Washroom',
        description:
          'Continuous leakage in the main supply pipe causing water accumulation in hostel corridor.',
        category: 'Water',
        location: 'Banda Singh Bahadur Hostel - 2nd Floor Block B',
        priority: 'High',
        // Attempt to forge another user's identity (must be overridden server-side)
        studentName: 'Spoofed Name',
        studentId: 'spoofed-id',
      };

      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify(complaintPayload),
      });
      const body = (await res.json()) as any;
      createdComplaintId = body.data?.id || '';

      const passed =
        res.status === 201 &&
        body.success === true &&
        body.data?.studentId === studentUser?.id &&
        body.data?.studentName === studentUser?.name;

      results.push({
        name: 'POST /api/campuscare/complaints (Student creates complaint with server-side identity injection)',
        passed,
        status: res.status,
        details: `Generated ID: ${createdComplaintId} | Server Injected Student: ${body.data?.studentName} (${body.data?.studentId})`,
      });
    }

    // 7. Student lists complaints (strictly scoped to their complaints)
    {
      const res = await fetch(`${BASE_URL}/complaints`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const body = (await res.json()) as any;
      const allOwnedByStudent = (body.data || []).every(
        (c: any) => c.studentId === studentUser?.id
      );
      const passed =
        res.status === 200 &&
        body.success === true &&
        Array.isArray(body.data) &&
        body.data.length >= 1 &&
        allOwnedByStudent;

      results.push({
        name: 'GET /api/campuscare/complaints (Scoped to student user)',
        passed,
        status: res.status,
        details: `Found ${body.data?.length} complaint(s) belonging strictly to student ${studentUser?.name}.`,
      });
    }

    // 8. RBAC Test: Student attempts to advance status (Expected 403 Forbidden)
    if (createdComplaintId) {
      const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ status: 'Under Review' }),
      });
      const body = (await res.json()) as any;
      const passed = res.status === 403 && body.success === false;

      results.push({
        name: 'Negative RBAC Test: Student attempts status update (Expected 403 Forbidden)',
        passed,
        status: res.status,
        details: `Rejected student status transition: "${body.error}"`,
      });
    }

    // 9. RBAC Test: Student attempts to assign officer (Expected 403 Forbidden)
    if (createdComplaintId) {
      const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          assignedDepartment: 'Water Supply & Public Health',
          assignedTo: 'Er. Gurpreet Singh',
        }),
      });
      const body = (await res.json()) as any;
      const passed = res.status === 403 && body.success === false;

      results.push({
        name: 'Negative RBAC Test: Student attempts officer assignment (Expected 403 Forbidden)',
        passed,
        status: res.status,
        details: `Rejected student officer patch: "${body.error}"`,
      });
    }

    // 10. Admin assigns officer (Expected 200 OK)
    if (createdComplaintId) {
      const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          assignedDepartment: 'Water Supply & Public Health',
          assignedTo: 'Er. Gurpreet Singh',
        }),
      });
      const body = (await res.json()) as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        body.data?.assignedTo === 'Er. Gurpreet Singh';

      results.push({
        name: 'PATCH /api/campuscare/complaints/:id (Admin assigns Department & Officer)',
        passed,
        status: res.status,
        details: `Assigned: ${body.data?.assignedTo} (${body.data?.assignedDepartment})`,
      });
    }

    // 11. Admin advances status (Expected 200 OK)
    if (createdComplaintId) {
      const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'Under Review',
          notes: 'Triaged by maintenance desk. Work order assigned.',
          department: 'Water Supply & Public Health',
        }),
      });
      const body = (await res.json()) as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        body.data?.status === 'Under Review';

      results.push({
        name: 'POST /api/campuscare/complaints/:id/status (Admin advances status)',
        passed,
        status: res.status,
        details: `Advanced status to "${body.data?.status}" by ${adminUser?.name}`,
      });
    }

    // 12. Student adds comment to their complaint (Expected 201 Created)
    if (createdComplaintId) {
      const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          message: 'Thank you. Please send the technician before 4:00 PM.',
        }),
      });
      const body = (await res.json()) as any;
      const passed =
        res.status === 201 &&
        body.success === true &&
        body.data?.comment?.userName === studentUser?.name &&
        body.data?.comment?.userRole === 'student';

      results.push({
        name: 'POST /api/campuscare/complaints/:id/comments (Student adds comment)',
        passed,
        status: res.status,
        details: `Author: ${body.data?.comment?.userName} | ID: ${body.data?.comment?.id}`,
      });
    }

    // 13. Student Privacy: Student attempts to access another student's complaint (Expected 403 Forbidden)
    {
      // PUP-2026-0102 belongs to Navjot Kaur (user-student-2), not the registered student
      const res = await fetch(`${BASE_URL}/complaints/PUP-2026-0102`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const body = (await res.json()) as any;
      const passed = res.status === 403 && body.success === false;

      results.push({
        name: 'Negative Privacy Test: Student attempts to access another student\'s complaint (Expected 403 Forbidden)',
        passed,
        status: res.status,
        details: `Access denied as expected: "${body.error}"`,
      });
    }

    // 14. Scoped Notifications (Expected 200 OK)
    {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const body = (await res.json()) as any;
      const passed =
        res.status === 200 &&
        body.success === true &&
        Array.isArray(body.data);

      results.push({
        name: 'GET /api/campuscare/notifications (Authenticated & Scoped to user)',
        passed,
        status: res.status,
        details: `Total notifications for student: ${body.data?.length}`,
      });
    }

    // 15. Negative Test: Invalid status lifecycle jump (Admin)
    if (createdComplaintId) {
      const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'Resolved' }), // Invalid jump from Under Review to Resolved
      });
      const body = (await res.json()) as any;
      const passed = res.status === 400 && body.success === false;

      results.push({
        name: 'Negative Test: Invalid lifecycle transition jump (Expected 400 Bad Request)',
        passed,
        status: res.status,
        details: `Rejected invalid transition: "${body.error}"`,
      });
    }

    // 16. Negative Test: Missing required fields on complaint submission
    {
      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ title: 'A', category: 'InvalidCat' }),
      });
      const body = (await res.json()) as any;
      const passed = res.status === 400 && body.success === false;

      results.push({
        name: 'Negative Test: Schema validation errors on create (Expected 400 Bad Request)',
        passed,
        status: res.status,
        details: `Errors caught (${body.errors?.length}): ${body.errors?.slice(0, 2).join('; ')}`,
      });
    }

    // 17. Negative Test: Nonexistent complaint ID lookup (Admin)
    {
      const res = await fetch(`${BASE_URL}/complaints/PUP-2026-9999`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = (await res.json()) as any;
      const passed = res.status === 404 && body.success === false;

      results.push({
        name: 'Negative Test: Nonexistent complaint ID lookup (Expected 404 Not Found)',
        passed,
        status: res.status,
        details: `Returned: "${body.error}"`,
      });
    }

    // 18. Negative Test: Malformed complaint ID format
    {
      const res = await fetch(`${BASE_URL}/complaints/invalid*id!%23`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = (await res.json()) as any;
      const passed = res.status === 400 && body.success === false;

      results.push({
        name: 'Negative Test: Malformed complaint ID format (Expected 400 Bad Request)',
        passed,
        status: res.status,
        details: `Returned: "${body.error}"`,
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
    console.log(
      `\n🎉 All ${results.length} API & RBAC test cases passed successfully!`
    );
  }
};

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
