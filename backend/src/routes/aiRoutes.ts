import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const CLASSIFICATIONS = {
  HEALTH_PACKAGE: 'health_package',
  SYMPTOMS: 'symptoms',
  PAYMENT_ISSUE: 'payment_issue',
  ACCOUNT_ISSUE: 'account_issue',
  GENERAL_QUERY: 'general_query'
};

const RESPONSES: Record<string, string> = {
  [CLASSIFICATIONS.HEALTH_PACKAGE]: "Our health packages are designed to provide comprehensive coverage. You can view the details in the 'Directory' section or contact our support team for a personalized plan.",
  [CLASSIFICATIONS.SYMPTOMS]: "I'm sorry to hear you're feeling unwell. Based on your symptoms, I recommend scheduling a consultation with one of our doctors. Please keep monitoring your condition.",
  [CLASSIFICATIONS.PAYMENT_ISSUE]: "I understand you're having trouble with a payment. Our billing department will investigate this immediately. You'll receive an update within 24 hours.",
  [CLASSIFICATIONS.ACCOUNT_ISSUE]: "If you're having trouble with your account, please try resetting your password or contact our technical support for assistance.",
  [CLASSIFICATIONS.GENERAL_QUERY]: "Thank you for reaching out. How else can I assist you with your medical support needs today?"
};

const IVR_OPTIONS: Record<number, string> = {
  1: 'General Health Query',
  2: 'Symptoms Check',
  3: 'Medication Issues',
  4: 'Appointment Booking',
  5: 'Emergency',
  6: 'Complaints',
  7: 'Feedback',
  8: 'Other Medical Queries',
  9: 'Admin Support'
};

const IVR_RESPONSES: Record<number, string> = {
  1: "For general health queries, our AI can provide information based on standard medical guidelines. How can I help you today?",
  2: "I'll help you check your symptoms. Please describe what you're feeling, or schedule a doctor's visit.",
  3: "Regarding medication issues, please consult your prescription or speak with our pharmacist through the admin option.",
  4: "I can help you book an appointment. Please tell me your preferred date and time, or use the portal.",
  5: "EMERGENCY ALERT: We have logged an emergency case. Please stay on the line or visit the nearest emergency room immediately.",
  6: "We take complaints seriously. Your feedback has been logged, and an admin will review it shortly.",
  7: "Thank you for your feedback. We use this to improve our medical services for all families.",
  8: "For other medical queries, please provide more details so I can direct you to the right specialist.",
  9: "Connecting you to an administrator. They will be with you momentarily."
};

function classify(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/package|plan|subscription|cost|price/)) return CLASSIFICATIONS.HEALTH_PACKAGE;
  if (lower.match(/pain|fever|cough|sick|symptom|ache|hurt|flu/)) return CLASSIFICATIONS.SYMPTOMS;
  if (lower.match(/payment|bill|invoice|pay|card|refund|transaction/)) return CLASSIFICATIONS.PAYMENT_ISSUE;
  if (lower.match(/account|login|password|sign up|register|profile/)) return CLASSIFICATIONS.ACCOUNT_ISSUE;
  return CLASSIFICATIONS.GENERAL_QUERY;
}

router.post('/voice', async (req: Request, res: Response) => {
  const { text, userType, option } = req.body;
  const message = text || '';

  let classification = 'General';
  let response = "Thank you for reaching out. How can I assist you today?";
  let selectedOption: string | null = null;

  if (option && IVR_OPTIONS[option as number]) {
    classification = IVR_OPTIONS[option as number];
    response = IVR_RESPONSES[option as number];
    selectedOption = String(option);
  } else if (message) {
    classification = classify(message);
    response = RESPONSES[classification] || response;
  }

  try {
    const callLog = await prisma.callLog.create({
      data: {
        intent: message.substring(0, 50) || classification,
        category: classification,
        status: 'ongoing',
        transcript: `User (${userType || 'parent'}): ${message}\nAI: ${response}`,
        aiResponse: response,
        duration: 0,
        summary: `Web Voice IVR interaction (Option: ${selectedOption || 'None'})`,
        callSid: `web-${Date.now()}`,
        selectedOption: selectedOption
      }
    });

    res.json({
      response,
      classification,
      option: selectedOption,
      logId: callLog.id
    });
  } catch (error) {
    console.error('Error saving voice interaction:', error);
    res.status(500).json({ error: 'Failed to process voice interaction' });
  }
});

export default router;
