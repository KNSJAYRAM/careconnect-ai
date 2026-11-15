import bcrypt from 'bcryptjs';

class InMemoryDatabase {
  constructor() {
    this.users = [];
    this.concerns = [];
    this.documents = [];
    this.appointments = [];
    this.followups = [];
    this.timelineEvents = [];
    
    this.seedDefaultData();
  }

  seedDefaultData() {
    // Seed default demo user: jayram@example.com / password123
    const demoUserId = 'demo_user_660a1f2e';
    const demoUser = {
      _id: demoUserId,
      name: 'Jayram Kumar',
      email: 'jayram@example.com',
      password: bcrypt.hashSync('password123', 10), // password123
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
      },
      createdAt: new Date('2026-01-10T10:00:00Z')
    };
    this.users.push(demoUser);

    // Seed Concerns
    this.concerns.push(
      {
        _id: 'c1',
        userId: demoUserId,
        title: 'Recurring Tension Headaches',
        description: 'Occasional tightness around forehead after long work hours in front of screens.',
        category: 'General',
        severity: 'Moderate',
        date: new Date('2026-09-18T09:00:00Z'),
        notes: 'Noticeable on days with high screen time and lower water intake.',
        createdAt: new Date('2026-09-18T09:00:00Z')
      },
      {
        _id: 'c2',
        userId: demoUserId,
        title: 'Mild Joint Stiffness in Right Knee',
        description: 'Slight discomfort after morning jog.',
        category: 'Joints & Bones',
        severity: 'Low',
        date: new Date('2026-09-20T14:30:00Z'),
        notes: 'Resting helps reduce stiffness.',
        createdAt: new Date('2026-09-20T14:30:00Z')
      }
    );

    // Seed Documents
    this.documents.push(
      {
        _id: 'doc1',
        userId: demoUserId,
        name: 'Comprehensive Blood Panel 2026',
        type: 'Blood Test',
        fileUrl: '/uploads/sample_blood_test.pdf',
        uploadDate: new Date('2026-09-12T11:20:00Z'),
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
          ],
          disclaimer: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.'
        },
        createdAt: new Date('2026-09-12T11:20:00Z')
      },
      {
        _id: 'doc2',
        userId: demoUserId,
        name: 'Knee X-Ray Radiology Report',
        type: 'Scan',
        fileUrl: '/uploads/knee_xray.pdf',
        uploadDate: new Date('2026-09-21T16:00:00Z'),
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
          ],
          disclaimer: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.'
        },
        createdAt: new Date('2026-09-21T16:00:00Z')
      }
    );

    // Seed Appointments
    this.appointments.push(
      {
        _id: 'apt1',
        userId: demoUserId,
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
        },
        createdAt: new Date('2026-09-15T09:00:00Z')
      },
      {
        _id: 'apt2',
        userId: demoUserId,
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
        },
        createdAt: new Date('2026-09-22T11:00:00Z')
      }
    );

    // Seed Followups
    this.followups.push(
      {
        _id: 'f1',
        userId: demoUserId,
        appointmentId: 'apt1',
        title: 'Review Lipid Panel Results with Dr. Sarah',
        description: 'Discuss cholesterol reduction strategy during wellness visit.',
        dueDate: '2026-10-12',
        status: 'Pending',
        createdAt: new Date('2026-09-15T10:00:00Z')
      },
      {
        _id: 'f2',
        userId: demoUserId,
        appointmentId: 'apt2',
        title: 'Obtain Physical Therapy Referral for Right Knee',
        description: 'Ask Dr. Verma for referral if exercise adjustment is needed.',
        dueDate: '2026-10-18',
        status: 'Pending',
        createdAt: new Date('2026-09-22T12:00:00Z')
      },
      {
        _id: 'f3',
        userId: demoUserId,
        appointmentId: null,
        title: 'Hydration & Screen Break Tracker',
        description: 'Track daily water intake (2.5L) for 7 days to evaluate headache frequency.',
        dueDate: '2026-09-30',
        status: 'Completed',
        createdAt: new Date('2026-09-19T08:00:00Z')
      }
    );

    // Seed Timeline Events
    this.timelineEvents.push(
      {
        _id: 't1',
        userId: demoUserId,
        type: 'document',
        title: 'Blood Test Uploaded',
        description: 'Comprehensive Blood Panel 2026 report uploaded.',
        date: new Date('2026-09-12T11:20:00Z'),
        relatedId: 'doc1',
        createdAt: new Date('2026-09-12T11:20:00Z')
      },
      {
        _id: 't2',
        userId: demoUserId,
        type: 'appointment',
        title: 'Wellness Appointment Scheduled',
        description: 'Booked consultation with Dr. Sarah Jenkins for Oct 12.',
        date: new Date('2026-09-15T09:00:00Z'),
        relatedId: 'apt1',
        createdAt: new Date('2026-09-15T09:00:00Z')
      },
      {
        _id: 't3',
        userId: demoUserId,
        type: 'concern',
        title: 'Health Concern Logged',
        description: 'Recurring Tension Headaches recorded.',
        date: new Date('2026-09-18T09:00:00Z'),
        relatedId: 'c1',
        createdAt: new Date('2026-09-18T09:00:00Z')
      },
      {
        _id: 't4',
        userId: demoUserId,
        type: 'document',
        title: 'X-Ray Report Uploaded',
        description: 'Knee X-Ray Radiology Report uploaded.',
        date: new Date('2026-09-21T16:00:00Z'),
        relatedId: 'doc2',
        createdAt: new Date('2026-09-21T16:00:00Z')
      },
      {
        _id: 't5',
        userId: demoUserId,
        type: 'followup',
        title: 'Follow-up Task Completed',
        description: 'Hydration & Screen Break Tracker marked completed.',
        date: new Date('2026-09-23T15:00:00Z'),
        relatedId: 'f3',
        createdAt: new Date('2026-09-23T15:00:00Z')
      }
    );
  }
}

export default new InMemoryDatabase();
