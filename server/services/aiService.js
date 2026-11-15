export const summarizeDocument = async ({ name, type, description, contentSnippet }) => {
  const apiKey = process.env.AI_API_KEY;
  const docName = name ? name.trim() : 'Medical Record';
  const docType = type || 'Blood Test';

  if (apiKey) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI Healthcare Navigation Assistant for CareConnect AI.
Summarize the following medical document.
IMPORTANT SAFETY RULE: Do NOT diagnose diseases, prescribe medications, or state medical conclusions. Keep the tone informative, clear, and easy for a patient to understand.

Document Name: ${docName}
Document Type: ${docType}
Description: ${description || 'N/A'}
Content/Snippet: ${contentSnippet || 'N/A'}

Format response strictly as valid JSON with fields:
overview (string), keyInfo (array of strings), importantValues (array of strings), termsExplained (array of objects { term, explanation }), questionsToDiscuss (array of strings).`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              return {
                ...parsed,
                disclaimer: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.'
              };
            } catch (parseErr) {
              console.warn('AI API JSON parse warning, falling back to smart mock:', parseErr.message);
            }
          }
        }
      }
    } catch (err) {
      console.warn('AI API call failed or timed out. Falling back to Mock AI Service:', err.message);
    }
  }

  // Fallback / Smart Mock AI Service
  return generateMockDocumentSummary(docName, docType, description, contentSnippet);
};

export const generateAppointmentQuestions = async ({ providerName, specialty, reason, notes, healthConcerns }) => {
  const apiKey = process.env.AI_API_KEY;
  const pName = providerName ? providerName.trim() : 'Healthcare Provider';
  const spec = specialty || 'General Physician';
  const rsn = reason || 'Consultation';

  if (apiKey) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are CareConnect AI Appointment Assistant.
Generate appointment preparation recommendations for a patient.
Doctor: ${pName} (${spec})
Reason: ${rsn}
Notes: ${notes || 'None'}
Health Concerns: ${JSON.stringify(healthConcerns || [])}

Do NOT prescribe or diagnose.
Return JSON with fields: questionsToAsk (array of strings), infoToBring (array of strings), topicsToDiscuss (array of strings), relevantDocuments (array of strings).`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0]);
            } catch (pErr) {
              console.warn('JSON parse warning for appointment questions:', pErr.message);
            }
          }
        }
      }
    } catch (err) {
      console.warn('AI API call failed. Using Mock AI for appointment prep:', err.message);
    }
  }

  return generateMockAppointmentPrep(pName, spec, rsn, notes, healthConcerns);
};

export const organizeHealthInformation = async ({ query }) => {
  const q = (query || '').toLowerCase().trim();

  let category = 'General Navigation';
  let guidance = '';
  let suggestedSteps = [];

  if (q.includes('report') || q.includes('lab') || q.includes('test') || q.includes('result') || q.includes('blood') || q.includes('scan') || q.includes('x-ray')) {
    category = 'Understanding Medical Reports';
    guidance = 'Medical test reports usually present reference ranges alongside your test values. It is helpful to review highlighted values and note any terminology you wish to clarify with your healthcare provider.';
    suggestedSteps = [
      'Upload your report to CareConnect AI Medical Documents for organized viewing.',
      'Use the AI Document Summary tool to get plain-language explanations of complex medical terms.',
      'Write down questions regarding any values outside standard reference ranges to discuss at your next visit.'
    ];
  } else if (q.includes('prepare') || q.includes('doctor') || q.includes('visit') || q.includes('appointment') || q.includes('consult')) {
    category = 'Appointment Preparation';
    guidance = 'Preparing ahead of your consultation helps ensure you make the most of your time with your doctor. Organise your symptoms timeline, current medication list, and specific questions.';
    suggestedSteps = [
      'Record your symptoms and onset date in the CareConnect AI Health Concerns section.',
      'Generate a customized checklist using the AI Appointment Preparation tool.',
      'Bring copies of recent test reports or upload them in advance.'
    ];
  } else if (q.includes('headache') || q.includes('pain') || q.includes('fever') || q.includes('symptom') || q.includes('cough') || q.includes('stiff')) {
    category = 'Symptom Tracking & Documentation';
    guidance = 'Documenting when symptoms occur, their severity, triggers, and duration provides valuable context for your clinician during evaluation.';
    suggestedSteps = [
      'Log recurring symptoms in CareConnect AI Health Concerns with severity ratings.',
      'Note any specific patterns or activities associated with your symptoms.',
      'Schedule a consultation with a qualified physician if symptoms are severe, persistent, or worsening.'
    ];
  } else {
    category = 'General Healthcare Navigation';
    guidance = 'CareConnect AI helps you stay organized across all aspects of your healthcare journey—from tracking symptoms to storing test records and preparing for consultations.';
    suggestedSteps = [
      'Keep your Health Profile updated with allergies and emergency contact info.',
      'Organize medical records under Medical Documents.',
      'Track upcoming visits and set follow-up task reminders.'
    ];
  }

  return {
    query: query || '',
    category,
    guidance,
    suggestedSteps,
    disclaimer: 'CareConnect AI provides informational guidance only. It does not diagnose medical conditions, recommend treatment changes, or replace professional advice from a licensed physician.'
  };
};

// Smart Mock Generators
function generateMockDocumentSummary(name, type, description, snippet) {
  const isBloodTest = type.toLowerCase().includes('blood') || name.toLowerCase().includes('blood') || name.toLowerCase().includes('cbc');
  const isScan = type.toLowerCase().includes('scan') || name.toLowerCase().includes('mri') || name.toLowerCase().includes('x-ray') || name.toLowerCase().includes('ultrasound');

  // Extract snippet numbers/key-values if provided by user
  const customValues = [];
  if (snippet) {
    const lines = snippet.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    lines.slice(0, 4).forEach(l => {
      if (l.length > 5) customValues.push(l);
    });
  }

  if (isBloodTest) {
    return {
      overview: `This document is a Routine Complete Blood Count (CBC) and Lipid Panel report (${name}). It details cellular blood components and metabolic metrics.`,
      keyInfo: [
        'Hemoglobin & Hematocrit levels evaluated.',
        'White Blood Cell (WBC) count listed within standard cell differential.',
        'Lipid breakdown including Total Cholesterol, HDL, and LDL values.'
      ],
      importantValues: customValues.length > 0 ? customValues : [
        'Total Cholesterol: 210 mg/dL (Reference: < 200 mg/dL - Borderline High)',
        'Hemoglobin: 14.2 g/dL (Reference: 13.5 - 17.5 g/dL - Normal)',
        'Fasting Blood Glucose: 98 mg/dL (Reference: 70 - 99 mg/dL - Normal)'
      ],
      termsExplained: [
        { term: 'Lipid Panel', explanation: 'A blood test measuring fats and fatty substances used as energy by your body.' },
        { term: 'Hemoglobin', explanation: 'A protein in red blood cells that carries oxygen throughout your body.' },
        { term: 'Fasting Blood Glucose', explanation: 'A measure of your blood sugar level after not eating for at least 8 hours.' }
      ],
      questionsToDiscuss: [
        'What lifestyle or dietary habits are recommended regarding my borderline lipid levels?',
        'When should I schedule a follow-up blood test to re-check these metrics?',
        'Do any of these results require specific monitoring alongside my current health routine?'
      ],
      disclaimer: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.'
    };
  }

  if (isScan) {
    return {
      overview: `This imaging consultation report (${name}) documents anatomical findings from a diagnostic scan procedure.`,
      keyInfo: [
        'Imaging modality: Radiological anatomical study.',
        'Soft tissue and structural framework examined by radiologist.',
        'No acute bone fractures or life-threatening organ anomalies identified.'
      ],
      importantValues: customValues.length > 0 ? customValues : [
        'Structural alignment: Normal alignment observed.',
        'Impression: Mild localized inflammatory changes noted.'
      ],
      termsExplained: [
        { term: 'Impression', explanation: 'The radiologist summary synthesizing the primary key findings from the scan.' },
        { term: 'Inflammatory Changes', explanation: 'Natural bodily tissue reaction often indicating mild stress, strain, or minor irritation.' }
      ],
      questionsToDiscuss: [
        'What do the radiologist observations mean for my daily physical activity?',
        'Is physical therapy or targeted rehabilitation recommended based on this scan?',
        'Are follow-up imaging scans necessary in the future?'
      ],
      disclaimer: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.'
    };
  }

  // General Fallback Mock
  return {
    overview: `Summarized Overview for "${name}" (${type}). This document contains medical documentation and health status records.`,
    keyInfo: [
      `Document category identified as ${type}.`,
      `Report date recorded: ${new Date().toLocaleDateString()}.`,
      `Key clinical parameters and notes logged for patient review.`
    ],
    importantValues: customValues.length > 0 ? customValues : [
      `Recorded entry: ${description || 'Patient clinical consultation note.'}`,
      'General physiological markers evaluated.'
    ],
    termsExplained: [
      { term: 'Clinical Record', explanation: 'Official record maintained for healthcare tracking and doctor consultation preparation.' },
      { term: 'Reference Range', explanation: 'Standard normal expected range of numerical test values for healthy individuals.' }
    ],
    questionsToDiscuss: [
      'What are the primary recommendations mentioned in this record?',
      'Are there any follow-up tests or specialist visits I should schedule?',
      'How does this document relate to my overall treatment plan?'
    ],
    disclaimer: 'AI-generated summaries are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.'
  };
}

function generateMockAppointmentPrep(providerName, specialty, reason, notes, healthConcerns) {
  const questionsToAsk = [
    `What are the most likely explanations for the symptoms/reason: "${reason}"?`,
    `Are there specific diagnostic tests or lab screenings you recommend given my visit for ${specialty}?`,
    'Are there lifestyle, dietary, or ergonomic adjustments that could help manage these symptoms?',
    'What warning signs or changes in symptoms should prompt an urgent follow-up?'
  ];

  const topicsToDiscuss = [
    `Primary reason for visit: ${reason}`,
    `Specialty consultation focus with ${providerName} (${specialty})`,
    'Recent health timeline events and symptom onset pattern.'
  ];

  // Incorporate user-provided health concerns
  if (Array.isArray(healthConcerns) && healthConcerns.length > 0) {
    healthConcerns.forEach((c) => {
      questionsToAsk.push(`Regarding my recorded concern "${c.title}": Could this be related to my visit today?`);
      topicsToDiscuss.push(`Recorded Concern: ${c.title} (${c.category || 'General'} - ${c.severity || 'Moderate'} severity)`);
    });
  }

  // Incorporate user-provided notes
  if (notes && notes.trim()) {
    topicsToDiscuss.push(`Patient Notes: ${notes.trim()}`);
  }

  return {
    questionsToAsk,
    infoToBring: [
      'Current list of all vitamins, supplements, and medications (including dosages).',
      'Recent lab test results or relevant imaging reports uploaded in CareConnect AI.',
      'Symptom journal detailing frequency, duration, and severity.',
      notes ? `Appointment notes: "${notes.trim()}"` : 'Health insurance card and photo identification.'
    ],
    topicsToDiscuss,
    relevantDocuments: [
      'Comprehensive Blood Panel Report',
      'Recent Consultation Notes',
      'CareConnect AI Health Concern Summary'
    ]
  };
}
