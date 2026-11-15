import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import HealthConcern from '../models/HealthConcern.js';
import MedicalDocument from '../models/MedicalDocument.js';
import Appointment from '../models/Appointment.js';
import FollowUp from '../models/FollowUp.js';
import TimelineEvent from '../models/TimelineEvent.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careconnect_ai';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await HealthConcern.deleteMany({});
    await MedicalDocument.deleteMany({});
    await Appointment.deleteMany({});
    await FollowUp.deleteMany({});
    await TimelineEvent.deleteMany({});

    // Create User
    const user = await User.create({
      name: 'Jayram Kumar',
      email: 'jayram@example.com',
      password: 'password123',
      dob: '1998-05-14',
      phone: '+91 98765 43210',
      profile: {
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Dust Mites'],
        existingConditions: ['Mild Asthma', 'Seasonal Allergies'],
        emergencyContact: {
          name: 'Anita Kumar',
          phone: '+91 98765 43211',
          relation: 'Mother'
        },
        relevantNotes: 'Prefers morning appointments. Annual physical due in October.'
      }
    });

    console.log(`Demo User Created: ${user.email} (Password: password123)`);

    // Create Concerns
    const concern1 = await HealthConcern.create({
      userId: user._id,
      title: 'Recurring Tension Headaches',
      description: 'Occasional tightness around forehead after long work hours in front of screens.',
      category: 'General',
      severity: 'Moderate',
      date: new Date('2026-09-18'),
      notes: 'Noticeable on days with high screen time and lower water intake.'
    });

    const concern2 = await HealthConcern.create({
      userId: user._id,
      title: 'Mild Joint Stiffness in Right Knee',
      description: 'Slight discomfort after morning jog.',
      category: 'Joints & Bones',
      severity: 'Low',
      date: new Date('2026-09-20'),
      notes: 'Resting helps reduce stiffness.'
    });

    // Create Documents
    const doc1 = await MedicalDocument.create({
      userId: user._id,
      name: 'Comprehensive Blood Panel 2026',
      type: 'Blood Test',
      fileUrl: '/uploads/sample_blood_test.pdf',
      uploadDate: new Date('2026-09-12'),
      description: 'Annual routine health checkup blood report.',
      contentSnippet: 'Fasting Blood Sugar: 98 mg/dL, Total Cholesterol: 210 mg/dL, Hemoglobin: 14.2 g/dL, WBC: 6.8 K/uL',
      summary: {
        overview: 'This document is a Comprehensive Blood Panel Report detailing glucose, lipid profile, and complete blood count metrics.',
        keyInfo: [
          'Fasting blood glucose level is within standard reference limits.',
          'Hemoglobin and oxygen-carrying red cells show good health status.',
          'Total cholesterol marker is slightly elevated above baseline recommendation.'
        ],
        importantValues: [
          'Total Cholesterol: 210 mg/dL (Reference < 200 mg/dL)',
          'Fasting Glucose: 98 mg/dL (Reference 70-99 mg/dL)',
          'Hemoglobin: 14.2 g/dL (Reference 13.5-17.5 g/dL)'
        ],
        termsExplained: [
          { term: 'Lipid Panel', explanation: 'Blood test measuring fats including cholesterol and triglycerides.' },
          { term: 'Fasting Glucose', explanation: 'Blood sugar level measured after an overnight fast.' }
        ],
        questionsToDiscuss: [
          'What dietary adjustments can help lower total cholesterol naturally?',
          'When should I schedule my next follow-up lipid screening?'
        ]
      }
    });

    const doc2 = await MedicalDocument.create({
      userId: user._id,
      name: 'Knee X-Ray Radiology Report',
      type: 'Scan',
      fileUrl: '/uploads/knee_xray.pdf',
      uploadDate: new Date('2026-09-21'),
      description: 'Evaluation of right knee Joint Space.',
      contentSnippet: 'AP and Lateral views of right knee show joint space preserved with minimal patellar wear.',
      summary: {
        overview: 'Radiological scan summary evaluating joint integrity in the right knee.',
        keyInfo: [
          'No evidence of bone fractures or major joint space narrowing.',
          'Minor patellar articular cartilage surface wear identified.'
        ],
        importantValues: [
          'Joint alignment: Intact and normal.',
          'Bone Density: Preserved.'
        ],
        termsExplained: [
          { term: 'AP View', explanation: 'Anteroposterior view - X-ray taken from front to back.' },
          { term: 'Patella', explanation: 'The knee cap bone.' }
        ],
        questionsToDiscuss: [
          'Are specific low-impact exercises recommended for knee stability?',
          'Should I use a supportive knee brace during exercise?'
        ]
      }
    });

    // Create Appointments
    const apt1 = await Appointment.create({
      userId: user._id,
      providerName: 'Dr. Sarah Jenkins',
      specialty: 'General Physician',
      date: '2026-10-12',
      time: '10:30 AM',
      location: 'CareConnect Health Center - Suite 402',
      reason: 'Routine Annual Wellness Exam & Blood Test Review',
      notes: 'Discuss cholesterol trends and headache logs.',
      status: 'Upcoming',
      aiPreparation: {
        questionsToAsk: [
          'What steps should I take regarding my 210 mg/dL total cholesterol reading?',
          'Could screen time and hydration be the main driver behind my forehead tension headaches?',
          'Do I need any routine immunization updates this year?'
        ],
        infoToBring: [
          'CareConnect Blood Test Report (12 Sep 2026)',
          'Symptom log for forehead tension headaches',
          'Current allergy details (Penicillin)'
        ],
        topicsToDiscuss: [
          'Annual preventative health review',
          'Cholesterol management and dietary recommendations',
          'Workplace ergonomics and screen breaks'
        ],
        relevantDocuments: [
          'Comprehensive Blood Panel 2026'
        ]
      }
    });

    const apt2 = await Appointment.create({
      userId: user._id,
      providerName: 'Dr. Rajesh Verma',
      specialty: 'Orthopedist',
      date: '2026-10-18',
      time: '02:00 PM',
      location: 'City Orthopedic Clinic - Room 12',
      reason: 'Right Knee Evaluation Post Jogging',
      notes: 'Bring X-Ray radiology report.',
      status: 'Upcoming',
      aiPreparation: {
        questionsToAsk: [
          'What physical therapy routine can strengthen muscles supporting the right knee?',
          'Is jogging safe to continue or should I transition to swimming/cycling?'
        ],
        infoToBring: [
          'Knee X-Ray Radiology Report (21 Sep 2026)',
          'Footwear details used for running'
        ],
        topicsToDiscuss: [
          'Knee joint alignment and cartilage wear',
          'Recommended knee exercises'
        ],
        relevantDocuments: [
          'Knee X-Ray Radiology Report'
        ]
      }
    });

    // Create FollowUps
    await FollowUp.create({
      userId: user._id,
      appointmentId: apt1._id,
      title: 'Review Lipid Panel Results with Dr. Sarah',
      description: 'Discuss cholesterol reduction strategy during wellness visit.',
      dueDate: '2026-10-12',
      status: 'Pending'
    });

    await FollowUp.create({
      userId: user._id,
      appointmentId: apt2._id,
      title: 'Obtain Physical Therapy Referral for Right Knee',
      description: 'Ask Dr. Verma for referral if exercise adjustment is needed.',
      dueDate: '2026-10-18',
      status: 'Pending'
    });

    await FollowUp.create({
      userId: user._id,
      appointmentId: null,
      title: 'Hydration & Screen Break Tracker',
      description: 'Track daily water intake (2.5L) for 7 days to evaluate headache frequency.',
      dueDate: '2026-09-30',
      status: 'Completed'
    });

    // Create Timeline Events
    await TimelineEvent.create({
      userId: user._id,
      type: 'document',
      title: 'Blood Test Uploaded',
      description: 'Comprehensive Blood Panel 2026 report uploaded.',
      date: new Date('2026-09-12'),
      relatedId: doc1._id.toString()
    });

    await TimelineEvent.create({
      userId: user._id,
      type: 'appointment',
      title: 'Wellness Appointment Scheduled',
      description: 'Booked consultation with Dr. Sarah Jenkins for Oct 12.',
      date: new Date('2026-09-15'),
      relatedId: apt1._id.toString()
    });

    await TimelineEvent.create({
      userId: user._id,
      type: 'concern',
      title: 'Health Concern Logged',
      description: 'Recurring Tension Headaches recorded.',
      date: new Date('2026-09-18'),
      relatedId: concern1._id.toString()
    });

    await TimelineEvent.create({
      userId: user._id,
      type: 'document',
      title: 'X-Ray Report Uploaded',
      description: 'Knee X-Ray Radiology Report uploaded.',
      date: new Date('2026-09-21'),
      relatedId: doc2._id.toString()
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
