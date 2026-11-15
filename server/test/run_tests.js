import express from 'express';
import cors from 'cors';
import http from 'http';
import inMemoryDb from '../services/inMemoryDb.js';

import authRoutes from '../routes/authRoutes.js';
import profileRoutes from '../routes/profileRoutes.js';
import concernsRoutes from '../routes/concernsRoutes.js';
import documentsRoutes from '../routes/documentsRoutes.js';
import appointmentsRoutes from '../routes/appointmentsRoutes.js';
import followupsRoutes from '../routes/followupsRoutes.js';
import timelineRoutes from '../routes/timelineRoutes.js';
import dashboardRoutes from '../routes/dashboardRoutes.js';
import aiRoutes from '../routes/aiRoutes.js';
import notificationsRoutes from '../routes/notificationsRoutes.js';
import { errorHandler } from '../middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set in-memory db for testing
app.locals.useMemoryDb = true;
app.locals.inMemoryDb = inMemoryDb;

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/concerns', concernsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/followups', followupsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use(errorHandler);

const results = [];
function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.push({ name, status: 'PASS' });
      console.log(`  ✓ PASS: ${name}`);
    } catch (err) {
      results.push({ name, status: 'FAIL', error: err.message });
      console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
    }
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function request(endpoint, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = endpoint;
    req.headers = { ...headers };

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      req.headers['content-length'] = Buffer.byteLength(payload);
      req.push(payload);
    }
    req.push(null);

    const res = new http.ServerResponse(req);
    const chunks = [];

    res.write = function(chunk) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };

    res.end = function(chunk) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const bodyStr = Buffer.concat(chunks).toString('utf8');
      let data = bodyStr;
      try {
        data = JSON.parse(bodyStr);
      } catch {
        // keep text
      }
      resolve({ status: res.statusCode, data });
    };

    app.handle(req, res);
  });
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🧪 CareConnect AI Comprehensive Feature Test Suite`);
  console.log(`======================================================\n`);

  let demoToken = '';
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';

  // --- 1. AUTHENTICATION TESTS ---
  console.log(`--- 1. AUTHENTICATION TESTS ---`);
  await test('Login with seeded demo account (jayram@example.com / password123)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'jayram@example.com', password: 'password123' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.token, 'Token not returned');
    assert(res.data.email === 'jayram@example.com', 'Incorrect email');
    demoToken = res.data.token;
  })();

  await test('Login with generic demo email (demo@example.com / password123)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'demo@example.com', password: 'password123' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Token not returned');
  })();

  await test('Login with incorrect credentials returns 401', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'jayram@example.com', password: 'wrongpassword' }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  })();

  await test('Register User A with valid details', async () => {
    const email = `usera_${Date.now()}@example.com`;
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Patient User A',
        email,
        password: 'Password123!',
        dob: '1995-04-12',
        phone: '+1 555-0101'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.token, 'Token missing');
    userAToken = res.data.token;
    userAId = res.data._id;
  })();

  await test('Register User B with valid details (for multi-tenant isolation tests)', async () => {
    const email = `userb_${Date.now()}@example.com`;
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Patient User B',
        email,
        password: 'Password456!',
        dob: '1992-08-20',
        phone: '+1 555-0202'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.token, 'Token missing');
    userBToken = res.data.token;
    userBId = res.data._id;
  })();

  await test('Registration rejects duplicate email', async () => {
    const existingEmail = inMemoryDb.users[0].email;
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Clone User',
        email: existingEmail,
        password: 'Password123!'
      }
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  })();

  await test('Registration rejects short password (<6 chars)', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123'
      }
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  })();

  await test('Security: No demo password bypass on other registered accounts', async () => {
    const userA = inMemoryDb.users.find(u => u._id === userAId);
    assert(userA, 'User A not found in db');
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: userA.email, password: 'password123' }
    });
    assert(res.status === 401, `Expected 401, got ${res.status} - bypass vulnerability present!`);
  })();

  await test('Protected route /auth/me returns user profile without password', async () => {
    const res = await request('/api/auth/me', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(!res.data.password, 'Password leaked in /auth/me response');
    assert(res.data.name === 'Patient User A', 'Name mismatch');
  })();

  await test('Unauthorized request without token rejected with 401', async () => {
    const res = await request('/api/auth/me');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  })();

  await test('Update Password functionality (/auth/change-password)', async () => {
    // 1. Wrong current password fails
    const badRes = await request('/api/auth/change-password', {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: { currentPassword: 'WrongPassword!', newPassword: 'NewPassword999!' }
    });
    assert(badRes.status === 400, `Expected 400, got ${badRes.status}`);

    // 2. Correct current password succeeds
    const goodRes = await request('/api/auth/change-password', {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: { currentPassword: 'Password123!', newPassword: 'NewPassword999!' }
    });
    assert(goodRes.status === 200, `Expected 200, got ${goodRes.status}`);

    // 3. User A can now login with new password
    const userA = inMemoryDb.users.find(u => u._id === userAId);
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: userA.email, password: 'NewPassword999!' }
    });
    assert(loginRes.status === 200, 'Could not login with new password');
  })();

  // --- 2. PROFILE TESTS ---
  console.log(`\n--- 2. PROFILE TESTS ---`);
  await test('Get and Update Health Profile for User A', async () => {
    const updateRes = await request('/api/profile', {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        bloodGroup: 'B+',
        allergies: 'Aspirin, Shellfish',
        existingConditions: 'Hypertension',
        emergencyContact: { name: 'Emergency Contact A', phone: '+1 555-9999', relation: 'Sister' },
        relevantNotes: 'Prefers telehealth consultations.'
      }
    });
    assert(updateRes.status === 200, `Expected 200, got ${updateRes.status}`);
    assert(updateRes.data.profile.bloodGroup === 'B+', 'Blood group update failed');
    assert(updateRes.data.profile.allergies.includes('Aspirin'), 'Allergies array update failed');

    // Verify persistence on fresh GET
    const getRes = await request('/api/profile', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(getRes.status === 200, `Expected 200, got ${getRes.status}`);
    assert(getRes.data.profile.bloodGroup === 'B+', 'Profile persistence failed after refresh');
  })();

  // --- 3. HEALTH CONCERNS TESTS ---
  console.log(`\n--- 3. HEALTH CONCERNS TESTS ---`);
  let createdConcernId = '';
  await test('Create Health Concern for User A', async () => {
    const res = await request('/api/concerns', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        title: 'Persistent Lower Back Ache',
        description: 'Dull ache after sitting at desk for prolonged hours.',
        category: 'Pain',
        severity: 'Moderate',
        notes: 'Applying heat pad provides temporary relief.'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.title === 'Persistent Lower Back Ache', 'Title mismatch');
    createdConcernId = res.data._id;
  })();

  await test('Edit Health Concern for User A', async () => {
    const res = await request(`/api/concerns/${createdConcernId}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        title: 'Lower Back Ache with Hip Stiffness',
        severity: 'Low',
        notes: 'Improving with daily stretching.'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.title === 'Lower Back Ache with Hip Stiffness', 'Title not updated');
    assert(res.data.severity === 'Low', 'Severity not updated');
  })();

  await test('Verify Health Concern reflected in Timeline & Dashboard', async () => {
    const tRes = await request('/api/timeline', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(tRes.status === 200, 'Could not fetch timeline');
    const foundInTimeline = tRes.data.some(t => t.relatedId === createdConcernId);
    assert(foundInTimeline, 'Concern not found in timeline events');

    const dRes = await request('/api/dashboard', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(dRes.status === 200, 'Could not fetch dashboard');
    assert(dRes.data.totalConcerns >= 1, 'Concern not counted in dashboard summary');
  })();

  // --- 4. MEDICAL DOCUMENTS & AI SUMMARY TESTS ---
  console.log(`\n--- 4. MEDICAL DOCUMENTS & AI SUMMARY TESTS ---`);
  let createdDocId = '';
  await test('Upload Document with AI Summarization', async () => {
    const res = await request('/api/documents', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        name: 'Annual Lipid Profile & Glucose Test',
        type: 'Blood Test',
        description: 'Routine lab testing report',
        contentSnippet: 'Fasting Blood Sugar: 95 mg/dL, Total Cholesterol: 195 mg/dL, HDL: 55 mg/dL, LDL: 110 mg/dL'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.summary, 'AI summary not generated');
    assert(res.data.summary.overview, 'AI summary overview missing');
    assert(res.data.summary.disclaimer, 'AI summary disclaimer missing');
    assert(Array.isArray(res.data.summary.questionsToDiscuss), 'Questions array missing');
    createdDocId = res.data._id;
  })();

  await test('Get Document by ID and Verify Structure', async () => {
    const res = await request(`/api/documents/${createdDocId}`, {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.name === 'Annual Lipid Profile & Glucose Test', 'Document name mismatch');
    assert(res.data.summary.disclaimer.includes('not be considered medical advice'), 'Mandatory disclaimer missing');
  })();

  // --- 5. APPOINTMENTS & AI PREPARATION TESTS ---
  console.log(`\n--- 5. APPOINTMENTS & AI PREPARATION TESTS ---`);
  let createdApptId = '';

  await test('Validation: Create Appointment without reason rejected with 400', async () => {
    const res = await request('/api/appointments', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        providerName: 'Dr. Emily Watson',
        specialty: 'Physical Therapist',
        date: '2026-11-20',
        time: '03:30 PM',
        location: 'CareConnect Wellness Pavilion',
        reason: '   ' // whitespace only
      }
    });
    assert(res.status === 400, `Expected 400 for empty reason, got ${res.status}`);
    assert(res.data.message.includes('Reason for consultation is required'), 'Incorrect error message');
  })();

  await test('Create Appointment with User Concerns incorporated into AI Prep', async () => {
    const res = await request('/api/appointments', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        providerName: 'Dr. Emily Watson',
        specialty: 'Physical Therapist',
        date: '2026-11-20',
        time: '03:30 PM',
        location: 'CareConnect Wellness Pavilion',
        reason: 'Evaluation of Lower Back and Hip Stiffness',
        notes: 'Inquire about ergonomic chair recommendations.'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.aiPreparation, 'AI preparation checklist missing');
    assert(Array.isArray(res.data.aiPreparation.questionsToAsk), 'questionsToAsk array missing');
    
    // Verify user's recorded concerns were incorporated into generated prep
    const prepQuestions = res.data.aiPreparation.questionsToAsk.join(' ');
    const prepTopics = res.data.aiPreparation.topicsToDiscuss.join(' ');
    assert(
      prepQuestions.includes('Lower Back Ache') || prepTopics.includes('Lower Back Ache'),
      'AI preparation did not incorporate user-provided health concerns!'
    );
    createdApptId = res.data._id;
  })();

  await test('Edit Appointment and Toggle Status', async () => {
    const updateRes = await request(`/api/appointments/${createdApptId}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        time: '04:00 PM',
        location: 'CareConnect Wellness Pavilion - Suite 201'
      }
    });
    assert(updateRes.status === 200, `Expected 200, got ${updateRes.status}`);
    assert(updateRes.data.time === '04:00 PM', 'Appointment time not updated');

    // Toggle status to Completed
    const statusRes = await request(`/api/appointments/${createdApptId}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: { status: 'Completed' }
    });
    assert(statusRes.status === 200, 'Could not toggle status');
    assert(statusRes.data.status === 'Completed', 'Status not marked Completed');

    // Validation: Updating reason with whitespace-only fails
    const badUpdate = await request(`/api/appointments/${createdApptId}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: { reason: '   ' }
    });
    assert(badUpdate.status === 400, `Expected 400 for empty reason on edit, got ${badUpdate.status}`);
  })();

  await test('Get Single Appointment by ID (GET /api/appointments/:id)', async () => {
    const res = await request(`/api/appointments/${createdApptId}`, {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data._id === createdApptId, 'Returned appointment ID mismatch');
    assert(res.data.providerName === 'Dr. Emily Watson', 'Provider name mismatch');
    assert(res.data.status === 'Completed', 'Status should still be Completed');

    // Cross-user: User B cannot access User A's appointment by ID
    const forbiddenRes = await request(`/api/appointments/${createdApptId}`, {
      headers: { authorization: `Bearer ${userBToken}` }
    });
    assert(forbiddenRes.status === 404, `Expected 404 for cross-user access, got ${forbiddenRes.status}`);
  })();

  // --- 6. FOLLOW-UPS & OVERDUE STATUS TESTS ---
  console.log(`\n--- 6. FOLLOW-UPS & OVERDUE STATUS TESTS ---`);
  let followup1Id = '';
  let followup2Id = '';
  await test('Create Follow-up tasks (future and past due date)', async () => {
    // Future task
    const f1 = await request('/api/followups', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        title: 'Schedule Follow-up Physical Therapy Review',
        description: 'Assess lumbar posture exercises.',
        dueDate: '2026-12-01',
        status: 'Pending'
      }
    });
    assert(f1.status === 201, `Expected 201, got ${f1.status}`);
    assert(f1.data.status === 'Pending', 'Future task should be Pending');
    followup1Id = f1.data._id;

    // Overdue task (past date: 2026-09-01)
    const f2 = await request('/api/followups', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        title: 'Complete Ergonomic Desk Setup Assessment',
        description: 'Adjust monitor height and chair lumbar support.',
        dueDate: '2026-09-01'
      }
    });
    assert(f2.status === 201, `Expected 201, got ${f2.status}`);
    assert(f2.data.status === 'Overdue', 'Past due date must automatically be initialized or marked Overdue');
    followup2Id = f2.data._id;
  })();

  await test('Edit and Complete Follow-up Task', async () => {
    const editRes = await request(`/api/followups/${followup1Id}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${userAToken}` },
      body: {
        title: 'Schedule PT Review & Obtain Exercise Sheet',
        status: 'Completed'
      }
    });
    assert(editRes.status === 200, `Expected 200, got ${editRes.status}`);
    assert(editRes.data.title === 'Schedule PT Review & Obtain Exercise Sheet', 'Title not updated');
    assert(editRes.data.status === 'Completed', 'Status not completed');
  })();

  // --- 7. HEALTHCARE NAVIGATION ASSISTANT TESTS ---
  console.log(`\n--- 7. HEALTHCARE NAVIGATION ASSISTANT TESTS ---`);
  await test('Healthcare Navigation: Report guidance has disclaimer & no diagnosis', async () => {
    const res = await request('/api/ai/organize-information', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: { query: 'How do I interpret my high cholesterol blood report?' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.category === 'Understanding Medical Reports', 'Category mismatch');
    assert(res.data.disclaimer.includes('does not diagnose'), 'Safety disclaimer missing');
    assert(Array.isArray(res.data.suggestedSteps), 'Suggested steps missing');
  })();

  await test('Healthcare Navigation: Appointment prep query returns actionable organization steps', async () => {
    const res = await request('/api/ai/organize-information', {
      method: 'POST',
      headers: { authorization: `Bearer ${userAToken}` },
      body: { query: 'What should I prepare before visiting a cardiologist?' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.category === 'Appointment Preparation', 'Category mismatch');
  })();

  // --- 8. DYNAMIC NOTIFICATIONS TESTS ---
  console.log(`\n--- 8. DYNAMIC NOTIFICATIONS TESTS ---`);
  await test('Notifications dynamically reflect user tasks & documents', async () => {
    const res = await request('/api/notifications', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Notifications should be an array');
    assert(res.data.length > 0, 'User A should have dynamic notifications');
    const hasOverdueOrDocumentNotif = res.data.some(n => n.title.includes('Follow-up') || n.title.includes('Document') || n.title.includes('Consultation'));
    assert(hasOverdueOrDocumentNotif, 'Notifications do not reflect dynamic user data');
  })();

  // --- 9. MULTI-TENANT ISOLATION TESTS (Security) ---
  console.log(`\n--- 9. MULTI-TENANT ISOLATION TESTS ---`);
  await test('User B CANNOT access User A document by ID', async () => {
    const res = await request(`/api/documents/${createdDocId}`, {
      headers: { authorization: `Bearer ${userBToken}` }
    });
    assert(res.status === 404, `Expected 404 for other user document, got ${res.status}`);
  })();

  await test('User B CANNOT modify User A health concern', async () => {
    const res = await request(`/api/concerns/${createdConcernId}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${userBToken}` },
      body: { title: 'Hacked by User B!' }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);

    // Verify User A concern was not modified
    const checkRes = await request('/api/concerns', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    const c = checkRes.data.find(item => item._id === createdConcernId);
    assert(c && !c.title.includes('Hacked'), 'Security breach: User B modified User A concern!');
  })();

  await test('User B CANNOT delete User A appointment', async () => {
    const res = await request(`/api/appointments/${createdApptId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userBToken}` }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  })();

  await test('User B CANNOT delete User A follow-up task', async () => {
    const res = await request(`/api/followups/${followup1Id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userBToken}` }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  })();

  // --- 10. CLEANUP & DELETION TESTS ---
  console.log(`\n--- 10. DELETION & CASCADE TESTS ---`);
  await test('Delete Concern removes concern and related timeline event', async () => {
    const delRes = await request(`/api/concerns/${createdConcernId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(delRes.status === 200, `Expected 200, got ${delRes.status}`);

    // Verify timeline event cleaned up
    const tRes = await request('/api/timeline', {
      headers: { authorization: `Bearer ${userAToken}` }
    });
    const stillInTimeline = tRes.data.some(t => t.relatedId === createdConcernId);
    assert(!stillInTimeline, 'Timeline event was orphaned after concern deletion');
  })();

  await test('Delete Document removes document and related timeline event', async () => {
    const delRes = await request(`/api/documents/${createdDocId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(delRes.status === 200, `Expected 200, got ${delRes.status}`);
  })();

  await test('Delete Appointment removes appointment', async () => {
    const delRes = await request(`/api/appointments/${createdApptId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(delRes.status === 200, `Expected 200, got ${delRes.status}`);
  })();

  await test('Delete Follow-up removes task', async () => {
    const delRes = await request(`/api/followups/${followup1Id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${userAToken}` }
    });
    assert(delRes.status === 200, `Expected 200, got ${delRes.status}`);
  })();

  // --- 11. COMPLETE NEW-USER INDEPENDENT WORKFLOW & EMPTY STATE TESTS ---
  console.log(`\n--- 11. NEW-USER WORKFLOW & DYNAMIC UPDATES ---`);
  let userCToken = '';
  let userCId = '';

  await test('New user registers with completely independent clean health profile', async () => {
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Dr. Evelyn Reed',
        email: `evelyn.${Date.now()}@example.com`,
        password: 'Password123!',
        dob: '1992-04-12',
        phone: '+1 555-0143'
      }
    });
    assert(regRes.status === 201, `Expected 201, got ${regRes.status}`);
    userCToken = regRes.data.token;
    userCId = regRes.data._id;

    // Verify initial profile has no inherited demo data
    const profRes = await request('/api/profile', {
      headers: { authorization: `Bearer ${userCToken}` }
    });
    assert(profRes.status === 200, 'Could not fetch User C profile');
    assert(profRes.data.name === 'Dr. Evelyn Reed', 'User C name mismatch');
    assert(profRes.data.profile.bloodGroup === 'Not specified', 'Blood group should be Not specified');
    assert(Array.isArray(profRes.data.profile.allergies) && profRes.data.profile.allergies.length === 0, 'Allergies should be empty');
    assert(Array.isArray(profRes.data.profile.existingConditions) && profRes.data.profile.existingConditions.length === 0, 'Conditions should be empty');
  })();

  await test('New user dashboard displays exact clean zero statistics and empty states', async () => {
    const dashRes = await request('/api/dashboard', {
      headers: { authorization: `Bearer ${userCToken}` }
    });
    assert(dashRes.status === 200, `Expected 200, got ${dashRes.status}`);
    const d = dashRes.data;
    assert(d.userName === 'Dr. Evelyn Reed', `Expected Dr. Evelyn Reed, got ${d.userName}`);
    assert(d.upcomingAppointment === null, 'Upcoming appointment must be null');
    assert(d.totalDocuments === 0, 'Total documents must be 0');
    assert(d.pendingFollowups === 0, 'Pending followups must be 0');
    assert(d.totalConcerns === 0, 'Total concerns must be 0');
    assert(d.totalHealthEvents === 0, 'Total health events must be 0');
  })();

  await test('New user dashboard statistics update dynamically when records are added', async () => {
    // Add concern
    const cRes = await request('/api/concerns', {
      method: 'POST',
      headers: { authorization: `Bearer ${userCToken}` },
      body: {
        title: 'Severe Migraine Episodes',
        category: 'Pain',
        severity: 'Severe'
      }
    });
    assert(cRes.status === 201, 'Failed to add concern');

    // Add appointment
    const aRes = await request('/api/appointments', {
      method: 'POST',
      headers: { authorization: `Bearer ${userCToken}` },
      body: {
        providerName: 'Dr. Katherine Grey',
        specialty: 'Neurology',
        date: '2026-11-28',
        time: '11:00 AM',
        reason: 'Neurological evaluation for recurring migraines'
      }
    });
    assert(aRes.status === 201, 'Failed to add appointment');

    // Check dashboard again
    const dashUpdated = await request('/api/dashboard', {
      headers: { authorization: `Bearer ${userCToken}` }
    });
    const d = dashUpdated.data;
    assert(d.totalConcerns === 1, `Expected 1 concern, got ${d.totalConcerns}`);
    assert(d.upcomingAppointment?.providerName === 'Dr. Katherine Grey', 'Upcoming appointment not updated');
    assert(d.totalHealthEvents >= 2, 'Health timeline events not populated');
  })();

  await test('New user profile updates persist across logout and re-login', async () => {
    const updateRes = await request('/api/profile', {
      method: 'PUT',
      headers: { authorization: `Bearer ${userCToken}` },
      body: {
        bloodGroup: 'B+',
        allergies: 'Latex, Sulfa Drugs',
        emergencyContact: {
          name: 'David Reed',
          phone: '+1 555-0199',
          relation: 'Spouse'
        }
      }
    });
    assert(updateRes.status === 200, 'Profile update failed');

    // Fetch user profile again and verify persistence
    const profFresh = await request('/api/profile', {
      headers: { authorization: `Bearer ${userCToken}` }
    });
    assert(profFresh.data.profile.bloodGroup === 'B+', 'Blood group update not persisted');
    assert(profFresh.data.profile.allergies.includes('Latex'), 'Allergies not persisted');
    assert(profFresh.data.profile.emergencyContact.name === 'David Reed', 'Emergency contact not persisted');
  })();

  console.log(`\n======================================================`);
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`📊 Test Summary: Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`======================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
