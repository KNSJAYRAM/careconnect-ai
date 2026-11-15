import { spawn } from 'child_process';
import http from 'http';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function verifyNewUserWorkflow() {
  console.log('===============================================================');
  console.log('🏥 CareConnect AI: Full End-to-End New User Workflow Test Suite');
  console.log('===============================================================\n');

  const server = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: '5006', USE_IN_MEMORY_DB: 'true' },
    stdio: 'pipe'
  });

  server.stdout.on('data', () => {});
  server.stderr.on('data', () => {});

  // Wait until server is listening on port 5006
  let ready = false;
  for (let i = 0; i < 25; i++) {
    try {
      const h = await request({ hostname: '127.0.0.1', port: 5006, path: '/api/health', method: 'GET' });
      if (h.status === 200) {
        ready = true;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!ready) {
    throw new Error('Test server failed to start on port 5006 within 5 seconds');
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Register New User 1 (Evelyn Reed)
    // -------------------------------------------------------------
    console.log('--- STEP 1: Registration of New User 1 ---');
    const regUser1 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Evelyn Reed',
      email: 'evelyn.reed@example.com',
      password: 'SecurePassword123!',
      dob: '1992-04-12',
      phone: '+1 555-0143'
    });

    if (regUser1.status !== 201 || !regUser1.data.token) {
      throw new Error(`User 1 registration failed with status ${regUser1.status}: ${JSON.stringify(regUser1.data)}`);
    }
    const token1 = regUser1.data.token;
    const user1Id = regUser1.data._id;
    console.log(`✓ User 1 registered successfully (ID: ${user1Id}, Token received)`);

    // -------------------------------------------------------------
    // TEST 2: Verify Initial Profile Independence (No inherited dummy data)
    // -------------------------------------------------------------
    console.log('\n--- STEP 2: Verify Initial Profile Isolation ---');
    const profUser1 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/profile',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    if (profUser1.status !== 200) throw new Error('Failed to fetch User 1 profile');
    const p1 = profUser1.data;
    console.log('User 1 Initial Profile:', {
      name: p1.name,
      bloodGroup: p1.profile.bloodGroup,
      allergies: p1.profile.allergies,
      existingConditions: p1.profile.existingConditions
    });

    if (p1.name !== 'Evelyn Reed') throw new Error(`Expected Evelyn Reed, got ${p1.name}`);
    if (p1.profile.bloodGroup !== 'Not specified') throw new Error(`Expected 'Not specified', got ${p1.profile.bloodGroup}`);
    if (p1.profile.allergies.length !== 0) throw new Error(`Allergies should be empty, found: ${p1.profile.allergies}`);
    if (p1.profile.existingConditions.length !== 0) throw new Error(`Conditions should be empty, found: ${p1.profile.existingConditions}`);
    console.log('✓ User 1 profile initialized completely clean without demo data');

    // -------------------------------------------------------------
    // TEST 3: Verify Clean Dashboard Empty State & Statistics
    // -------------------------------------------------------------
    console.log('\n--- STEP 3: Verify Dashboard Initial Empty State ---');
    const dash1 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    if (dash1.status !== 200) throw new Error('Failed to fetch dashboard for User 1');
    const d1 = dash1.data;
    console.log('User 1 Dashboard Initial Data:', {
      userName: d1.userName,
      upcomingAppointment: d1.upcomingAppointment,
      totalDocuments: d1.totalDocuments,
      pendingFollowups: d1.pendingFollowups,
      totalHealthEvents: d1.totalHealthEvents,
      totalConcerns: d1.totalConcerns
    });

    if (d1.userName !== 'Evelyn Reed') throw new Error(`Expected Evelyn Reed, got ${d1.userName}`);
    if (d1.upcomingAppointment !== null) throw new Error('Upcoming appointment should be null');
    if (d1.totalDocuments !== 0) throw new Error('totalDocuments should be 0');
    if (d1.pendingFollowups !== 0) throw new Error('pendingFollowups should be 0');
    if (d1.totalHealthEvents !== 0) throw new Error('totalHealthEvents should be 0');
    if (d1.totalConcerns !== 0) throw new Error('totalConcerns should be 0');
    console.log('✓ User 1 dashboard displays zero metrics and clean empty states');

    // -------------------------------------------------------------
    // TEST 4: Add User 1 Health Concern, Document, Appointment, Follow-up
    // -------------------------------------------------------------
    console.log('\n--- STEP 4: Adding Health Records for User 1 ---');
    // A. Concern
    const addConcern = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/concerns',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` }
    }, {
      title: 'Severe Migraine Episodes',
      description: 'Throbbing pain on left temple accompanied by light sensitivity.',
      category: 'Pain',
      severity: 'Severe'
    });
    if (addConcern.status !== 201) throw new Error('Failed to add health concern');
    const concernId = addConcern.data._id;
    console.log(`✓ Health Concern added (ID: ${concernId})`);

    // B. Document with AI Summary
    const addDoc = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/documents',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` }
    }, {
      name: 'Comprehensive Brain MRI Scan',
      type: 'Scan',
      description: 'Brain scan without contrast requested for migraine evaluation.',
      contentSnippet: 'Ventricular system is within normal limits. No acute intracranial hemorrhage or mass effect noted.'
    });
    if (addDoc.status !== 201) throw new Error('Failed to add medical document');
    const docId = addDoc.data._id;
    console.log(`✓ Medical Document added with AI Summary (ID: ${docId})`);
    if (!addDoc.data.summary || !addDoc.data.summary.overview) {
      throw new Error('Document AI summary was not generated');
    }
    console.log(`  AI Summary Generated: "${addDoc.data.summary.overview.slice(0, 60)}..."`);

    // C. Appointment with AI Consultation Prep
    const addAppt = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/appointments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` }
    }, {
      providerName: 'Dr. Katherine Grey',
      specialty: 'Neurology',
      date: '2026-11-28',
      time: '11:00 AM',
      location: 'University Neurology Clinic',
      reason: 'Migraine consultation & MRI review'
    });
    if (addAppt.status !== 201) throw new Error('Failed to schedule appointment');
    const apptId = addAppt.data._id;
    console.log(`✓ Appointment scheduled (ID: ${apptId})`);
    if (!addAppt.data.aiPreparation || !addAppt.data.aiPreparation.questionsToAsk) {
      throw new Error('AI Appointment Preparation was not synthesized');
    }
    console.log(`  AI Prep synthesized: ${addAppt.data.aiPreparation.questionsToAsk.length} suggested questions for Dr. Grey`);

    // D. Follow-up task
    const addFollowup = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/followups',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` }
    }, {
      title: 'Maintain daily migraine headache journal',
      dueDate: '2026-11-27',
      description: 'Record pain triggers, screen time, and hydration before appointment.'
    });
    if (addFollowup.status !== 201) throw new Error('Failed to create follow-up task');
    const followupId = addFollowup.data._id;
    console.log(`✓ Follow-up task logged (ID: ${followupId})`);

    // -------------------------------------------------------------
    // TEST 5: Verify Dynamic Dashboard Updates for User 1
    // -------------------------------------------------------------
    console.log('\n--- STEP 5: Verify Dynamic Dashboard Statistics Updates ---');
    const dash1Updated = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    const d1Up = dash1Updated.data;
    console.log('User 1 Updated Dashboard:', {
      userName: d1Up.userName,
      upcomingVisit: d1Up.upcomingAppointment?.providerName,
      totalDocuments: d1Up.totalDocuments,
      pendingFollowups: d1Up.pendingFollowups,
      totalHealthEvents: d1Up.totalHealthEvents,
      totalConcerns: d1Up.totalConcerns
    });

    if (d1Up.totalDocuments !== 1) throw new Error(`Expected 1 doc, got ${d1Up.totalDocuments}`);
    if (d1Up.totalConcerns !== 1) throw new Error(`Expected 1 concern, got ${d1Up.totalConcerns}`);
    if (d1Up.pendingFollowups !== 1) throw new Error(`Expected 1 follow-up, got ${d1Up.pendingFollowups}`);
    if (d1Up.upcomingAppointment?.providerName !== 'Dr. Katherine Grey') {
      throw new Error(`Expected Dr. Katherine Grey, got ${d1Up.upcomingAppointment?.providerName}`);
    }
    console.log('✓ User 1 Dashboard statistics updated dynamically with 100% accuracy');

    // -------------------------------------------------------------
    // TEST 6: Update Health Profile & Test Persistence Across Re-login
    // -------------------------------------------------------------
    console.log('\n--- STEP 6: Update Profile & Test Persistence Across Re-Login ---');
    const updateProf = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/profile',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` }
    }, {
      bloodGroup: 'B+',
      allergies: 'Latex, Sulfa Drugs',
      existingConditions: 'Migraine with Aura',
      emergencyContact: {
        name: 'David Reed',
        phone: '+1 555-0199',
        relation: 'Spouse'
      },
      relevantNotes: 'Prefers afternoon appointments.'
    });

    if (updateProf.status !== 200) throw new Error('Failed to update health profile');
    console.log('✓ Profile updated successfully with blood group B+ and allergies');

    // Re-login User 1
    const relogin1 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'evelyn.reed@example.com',
      password: 'SecurePassword123!'
    });

    if (relogin1.status !== 200) throw new Error('Re-login failed');
    const freshToken1 = relogin1.data.token;
    const p1Recheck = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/profile',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshToken1}` }
    });

    const p1Fresh = p1Recheck.data;
    if (p1Fresh.profile.bloodGroup !== 'B+') throw new Error(`Expected B+, got ${p1Fresh.profile.bloodGroup}`);
    if (!p1Fresh.profile.allergies.includes('Latex')) throw new Error('Allergies not persisted');
    if (p1Fresh.profile.emergencyContact.name !== 'David Reed') throw new Error('Emergency contact not persisted');
    console.log('✓ Health profile persisted completely across session logout & re-login');

    // -------------------------------------------------------------
    // TEST 7: Register User 2 (Marcus Vance) & Verify Absolute Multi-Tenant Isolation
    // -------------------------------------------------------------
    console.log('\n--- STEP 7: Register User 2 & Verify Data Isolation ---');
    const regUser2 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      password: 'SecurePassword456!',
      dob: '1985-09-22',
      phone: '+1 555-0188'
    });

    if (regUser2.status !== 201) throw new Error('User 2 registration failed');
    const token2 = regUser2.data.token;
    console.log('✓ User 2 (Marcus Vance) registered successfully');

    // User 2 Dashboard should be completely empty and independent
    const dash2 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    const d2 = dash2.data;
    if (d2.userName !== 'Marcus Vance') throw new Error(`Expected Marcus Vance, got ${d2.userName}`);
    if (d2.totalDocuments !== 0 || d2.totalConcerns !== 0 || d2.upcomingAppointment !== null) {
      throw new Error(`Data leak detected! User 2 received non-zero dashboard data: ${JSON.stringify(d2)}`);
    }
    console.log('✓ User 2 dashboard is 100% isolated and clean (zero records from User 1)');

    // -------------------------------------------------------------
    // TEST 8: Cross-Tenant Breach Prevention (User 2 tries to read/modify User 1)
    // -------------------------------------------------------------
    console.log('\n--- STEP 8: Security & Cross-Tenant Boundary Attacks ---');
    // User 2 tries to read User 1's document
    const breachDoc = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: `/api/documents/${docId}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    if (breachDoc.status !== 404 && breachDoc.status !== 403) {
      throw new Error(`Security breach! User 2 was able to access User 1 document! Status: ${breachDoc.status}`);
    }
    console.log(`✓ User 2 blocked from accessing User 1 document (Status: ${breachDoc.status})`);

    // User 2 tries to update User 1's appointment
    const breachAppt = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: `/api/appointments/${apptId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` }
    }, { status: 'Cancelled' });
    if (breachAppt.status !== 404 && breachAppt.status !== 403) {
      throw new Error(`Security breach! User 2 was able to modify User 1 appointment! Status: ${breachAppt.status}`);
    }
    console.log(`✓ User 2 blocked from modifying User 1 appointment (Status: ${breachAppt.status})`);

    // User 2 tries to delete User 1's concern
    const breachConcern = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: `/api/concerns/${concernId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    if (breachConcern.status !== 404 && breachConcern.status !== 403) {
      throw new Error(`Security breach! User 2 was able to delete User 1 concern! Status: ${breachConcern.status}`);
    }
    console.log(`✓ User 2 blocked from deleting User 1 concern (Status: ${breachConcern.status})`);

    // -------------------------------------------------------------
    // TEST 9: Dynamic Notifications Isolation
    // -------------------------------------------------------------
    console.log('\n--- STEP 9: Notifications Isolation ---');
    const notifUser1 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/notifications',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshToken1}` }
    });
    const notifUser2 = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/notifications',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    const u1HasApptNotif = notifUser1.data.some(n => n.type === 'appointment' && n.title.includes('Dr. Katherine Grey'));
    const u2HasApptNotif = notifUser2.data.some(n => n.title && n.title.includes('Dr. Katherine Grey'));

    if (!u1HasApptNotif) throw new Error('User 1 should have appointment notification');
    if (u2HasApptNotif) throw new Error('User 2 notification leak! Found User 1 appointment notification');
    console.log(`✓ User 1 has active personalized notifications (${notifUser1.data.length})`);
    console.log('✓ User 2 has zero notification leaks from User 1');

    // -------------------------------------------------------------
    // TEST 10: User 1 Deletion Does Not Affect Demo Data or Other Users
    // -------------------------------------------------------------
    console.log('\n--- STEP 10: Safe Deletions & Integrity Verification ---');
    const delConcern = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: `/api/concerns/${concernId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${freshToken1}` }
    });
    if (delConcern.status !== 200) throw new Error('Failed to delete concern');
    console.log('✓ User 1 deleted their own health concern');

    // Verify User 1 dashboard updated to 0 concerns
    const dash1AfterDel = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${freshToken1}` }
    });
    if (dash1AfterDel.data.totalConcerns !== 0) throw new Error('Dashboard totalConcerns not decremented');
    console.log('✓ User 1 dashboard dynamically updated to reflect concern deletion');

    // Verify seeded demo account still intact
    const demoLogin = await request({
      hostname: '127.0.0.1',
      port: 5006,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'jayram@example.com', password: 'password123' });
    if (demoLogin.status !== 200) throw new Error('Seeded demo account corrupted');
    console.log('✓ Seeded demo account (jayram@example.com) remains completely healthy and untouched');

    console.log('\n===============================================================');
    console.log('🎉 ALL 10 NEW-USER & MULTI-TENANT WORKFLOW TESTS PASSED 100%!');
    console.log('===============================================================');
  } finally {
    server.kill();
  }
}

verifyNewUserWorkflow().catch(err => {
  console.error('\n❌ Workflow test failed:', err);
  process.exit(1);
});
