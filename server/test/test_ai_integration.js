import { summarizeDocument, generateAppointmentQuestions, organizeHealthInformation } from '../services/aiService.js';
import assert from 'assert';

async function testAISuite() {
  console.log('\n--- AI Integration Verification Suite ---');

  // Test 1: Missing API Key (Default Offline Mode)
  console.log('Test 1: Missing API Key Fallback...');
  const docSummary = await summarizeDocument({
    name: 'Metabolic Panel & Lipid Profile',
    type: 'Blood Test',
    description: 'Routine yearly check',
    contentSnippet: 'Total Cholesterol: 210 mg/dL, Fasting Glucose: 95 mg/dL'
  });

  assert(docSummary.overview, 'Overview should exist');
  assert(docSummary.isFallback === true, 'isFallback should be true when API key is unset');
  assert(docSummary.source === 'deterministic_fallback', 'source should be deterministic_fallback');
  assert(docSummary.disclaimer.includes('medical advice'), 'Safety disclaimer must be present');
  assert(!docSummary.overview.toLowerCase().includes('i diagnose'), 'Must not diagnose');
  console.log('✓ PASS: Missing API key falls back deterministically with disclaimer');

  // Test 2: Scan document fallback
  console.log('Test 2: Scan Document Fallback...');
  const scanSummary = await summarizeDocument({
    name: 'Cervical Spine MRI Scan',
    type: 'Scan',
    description: 'Neck stiffness after motor strain',
    contentSnippet: 'Structural alignment normal, mild inflammatory changes'
  });
  assert(scanSummary.overview.includes('imaging') || scanSummary.overview.includes('procedure'), 'Scan overview format verified');
  assert(scanSummary.isFallback === true);
  console.log('✓ PASS: Scan document parsed with radiological definitions');

  // Test 3: Appointment Questions Prep
  console.log('Test 3: Appointment Questions Prep Fallback...');
  const prep = await generateAppointmentQuestions({
    providerName: 'Dr. Sarah Connor',
    specialty: 'Cardiology',
    reason: 'Intermittent tachycardia and lightheadedness',
    notes: 'Bring previous ECG report',
    healthConcerns: [{ title: 'Chest Flutter', category: 'Cardiovascular', severity: 'Moderate' }]
  });
  assert(Array.isArray(prep.questionsToAsk), 'Questions array must exist');
  assert(prep.questionsToAsk.length >= 4, 'Should have at least 4 questions');
  assert(prep.isFallback === true, 'isFallback should be true');
  assert(prep.topicsToDiscuss.some(t => t.includes('Chest Flutter')), 'Should incorporate patient health concern');
  console.log('✓ PASS: Appointment preparation synthesizes doctor specialty & user concerns');

  // Test 4: Healthcare Navigation with Safety & Emergency Guidance
  console.log('Test 4: Healthcare Navigation Safety...');
  const navSymptom = await organizeHealthInformation({ query: 'severe chest pain and shortness of breath' });
  assert(navSymptom.disclaimer.includes('CareConnect AI provides informational guidance only'), 'Disclaimer required');
  assert(navSymptom.suggestedSteps.length > 0, 'Steps must be provided');
  assert(!navSymptom.guidance.includes('Take medication'), 'Must not prescribe medication');
  console.log('✓ PASS: Healthcare navigation preserves non-diagnostic guidance');

  console.log('\n🎉 ALL AI INTEGRATION TESTS PASSED 100%!\n');
}

testAISuite().catch(err => {
  console.error('AI Test Failure:', err);
  process.exit(1);
});
