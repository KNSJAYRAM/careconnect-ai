import { summarizeDocument, generateAppointmentQuestions, organizeHealthInformation } from '../services/aiService.js';

export const summarizeDocumentController = async (req, res) => {
  try {
    const { name, type, description, contentSnippet } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Document name is required' });
    }

    const summary = await summarizeDocument({ name, type, description, contentSnippet });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const appointmentQuestionsController = async (req, res) => {
  try {
    const { providerName, specialty, reason, notes, healthConcerns } = req.body;
    const prep = await generateAppointmentQuestions({
      providerName: providerName || 'Healthcare Provider',
      specialty: specialty || 'General Physician',
      reason: reason || 'Consultation',
      notes,
      healthConcerns
    });
    res.json(prep);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const organizeInformationController = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const result = await organizeHealthInformation({ query });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
