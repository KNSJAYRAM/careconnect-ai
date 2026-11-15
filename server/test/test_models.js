/**
 * CareConnect AI Mongoose Schema & Model Validation Tests
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import HealthConcern from '../models/HealthConcern.js';
import MedicalDocument from '../models/MedicalDocument.js';
import Appointment from '../models/Appointment.js';
import FollowUp from '../models/FollowUp.js';
import TimelineEvent from '../models/TimelineEvent.js';

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🧪 CareConnect AI Model & Schema Validation Tests`);
  console.log(`======================================================\n`);

  await test('User Schema validates required fields (name, email, password)', async () => {
    const invalidUser = new User({});
    const err = invalidUser.validateSync();
    assert(err, 'Expected validation error for empty User');
    assert(err.errors.name, 'Name should be required');
    assert(err.errors.email, 'Email should be required');
    assert(err.errors.password, 'Password should be required');
  });

  await test('User Schema default values (profile, bloodGroup, allergies)', async () => {
    const user = new User({ name: 'Test', email: 'test@example.com', password: 'password123' });
    assert(user.profile.bloodGroup === 'Not specified', 'Default bloodGroup mismatch');
    assert(Array.isArray(user.profile.allergies), 'Allergies should default to array');
    assert(Array.isArray(user.profile.existingConditions), 'Conditions should default to array');
    assert(user.profile.emergencyContact.name === '', 'Emergency contact should be initialized');
  });

  await test('User Schema matchPassword method verifies correctly', async () => {
    const user = new User({ name: 'Test', email: 'test@example.com', password: 'password123' });
    // Trigger pre-save hook manually
    await new Promise((resolve, reject) => {
      user.schema.s.hooks.execPre('save', user, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    assert(user.password !== 'password123', 'Password should be hashed');
    const isMatch = await user.matchPassword('password123');
    assert(isMatch === true, 'matchPassword failed for correct password');
    const isBadMatch = await user.matchPassword('wrongpassword');
    assert(isBadMatch === false, 'matchPassword returned true for bad password');
  });

  await test('HealthConcern Schema requires userId and title', async () => {
    const invalidConcern = new HealthConcern({});
    const err = invalidConcern.validateSync();
    assert(err, 'Expected validation error');
    assert(err.errors.userId, 'userId should be required');
    assert(err.errors.title, 'title should be required');

    const validConcern = new HealthConcern({
      userId: new mongoose.Types.ObjectId(),
      title: 'Tension Headaches'
    });
    const validErr = validConcern.validateSync();
    assert(!validErr, `Unexpected validation error: ${validErr}`);
    assert(validConcern.severity === 'Moderate', 'Default severity should be Moderate');
    assert(validConcern.category === 'General', 'Default category should be General');
  });

  await test('MedicalDocument Schema validates type enum and default disclaimer', async () => {
    const validDoc = new MedicalDocument({
      userId: new mongoose.Types.ObjectId(),
      name: 'Blood Test Report',
      type: 'Blood Test'
    });
    const err = validDoc.validateSync();
    assert(!err, `Validation failed: ${err}`);
    assert(validDoc.summary.disclaimer.includes('AI-generated summaries are for informational purposes only'), 'Default disclaimer missing');

    const invalidTypeDoc = new MedicalDocument({
      userId: new mongoose.Types.ObjectId(),
      name: 'Blood Test Report',
      type: 'InvalidType123'
    });
    const typeErr = invalidTypeDoc.validateSync();
    assert(typeErr && typeErr.errors.type, 'Expected enum validation error for invalid type');
  });

  await test('Appointment Schema validates status enum and required date/time', async () => {
    const appt = new Appointment({
      userId: new mongoose.Types.ObjectId(),
      providerName: 'Dr. Sarah',
      date: '2026-11-15',
      time: '10:00 AM'
    });
    const err = appt.validateSync();
    assert(!err, `Unexpected error: ${err}`);
    assert(appt.status === 'Upcoming', 'Status should default to Upcoming');

    const badStatusAppt = new Appointment({
      userId: new mongoose.Types.ObjectId(),
      providerName: 'Dr. Sarah',
      date: '2026-11-15',
      time: '10:00 AM',
      status: 'InvalidStatus'
    });
    const statusErr = badStatusAppt.validateSync();
    assert(statusErr && statusErr.errors.status, 'Expected enum validation error for status');
  });

  await test('FollowUp Schema validates status enum and required fields', async () => {
    const followup = new FollowUp({
      userId: new mongoose.Types.ObjectId(),
      title: 'Recheck Blood Sugar',
      dueDate: '2026-11-20'
    });
    const err = followup.validateSync();
    assert(!err, `Unexpected error: ${err}`);
    assert(followup.status === 'Pending', 'Default status should be Pending');

    const badFollowup = new FollowUp({
      userId: new mongoose.Types.ObjectId(),
      title: 'Task',
      dueDate: '2026-11-20',
      status: 'UnknownStatus'
    });
    const badErr = badFollowup.validateSync();
    assert(badErr && badErr.errors.status, 'Expected enum validation error for status');
  });

  await test('TimelineEvent Schema validates type enum', async () => {
    const event = new TimelineEvent({
      userId: new mongoose.Types.ObjectId(),
      type: 'appointment',
      title: 'Appointment Scheduled'
    });
    const err = event.validateSync();
    assert(!err, `Unexpected error: ${err}`);

    const badEvent = new TimelineEvent({
      userId: new mongoose.Types.ObjectId(),
      type: 'random_type',
      title: 'Event'
    });
    const badErr = badEvent.validateSync();
    assert(badErr && badErr.errors.type, 'Expected enum error for invalid timeline event type');
  });

  await test('Invalid ObjectId helper validation', async () => {
    assert(mongoose.Types.ObjectId.isValid('507f1f77bcf86cd799439011') === true, 'Valid ObjectId should pass');
    assert(mongoose.Types.ObjectId.isValid('invalid_id_123') === false, 'Invalid ObjectId should fail');
    assert(mongoose.Types.ObjectId.isValid('123') === false, 'Short ID should fail');
  });

  console.log(`\n======================================================`);
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`📊 Model Test Summary: Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`======================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
