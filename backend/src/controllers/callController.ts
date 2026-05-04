import { Request, Response } from 'express';
import { generateGreetingTwiML, generateResponseTwiML, generateFallbackTwiML } from '../services/twilioService';
import { processSpeech } from '../services/aiService';
import { getIo } from '../utils/socket';
import { PrismaClient } from '@prisma/client';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

const prisma = new PrismaClient();

// 1. Initial Webhook for Incoming Call
export const incomingCall = async (req: Request, res: Response) => {
  const { CallSid, From } = req.body;
  console.log(`Incoming call from ${From} (SID: ${CallSid})`);

  // Ensure user exists or create
  let user = await prisma.user.findUnique({ where: { phone: From } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone: From, name: 'Unknown Caller', type: 'NEW' }
    });
  }

  // Notify frontend dashboard
  const io = getIo();
  io.emit('call_incoming', { callSid: CallSid, from: From, user });

  // Respond with TwiML greeting
  const twiml = generateGreetingTwiML();
  res.type('text/xml');
  res.send(twiml);
};

// 2. Gather Webhook for Speech-to-Text Processing
export const handleGather = async (req: Request, res: Response) => {
  const { CallSid, SpeechResult, Confidence } = req.body;
  console.log(`Speech recognized: "${SpeechResult}" (Confidence: ${Confidence})`);

  const io = getIo();

  if (!SpeechResult) {
    res.type('text/xml');
    return res.send(generateFallbackTwiML());
  }

  // Emit transcription to frontend
  io.emit('transcription', { callSid: CallSid, text: SpeechResult, role: 'user' });

  // 3. Process with AI (Intent Detection & Response Generation)
  const aiResult = await processSpeech(CallSid, SpeechResult);
  
  // 4. Emit AI intent and response to frontend
  io.emit('ai_response', { 
    callSid: CallSid, 
    category: aiResult.category,
    intent: aiResult.intent, 
    priority: aiResult.priority,
    response: aiResult.response,
    role: 'ai'
  });

  if (aiResult.isEmergency) {
    io.emit('emergency_alert', { callSid: CallSid, summary: aiResult.summary });
  }

  // 5. Store in DB
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' } // Just grabbing latest for demo if phone not passed by gather
  });
  
  if (user && aiResult.intent !== 'unknown') {
    const callLog = await prisma.callLog.create({
      data: {
        userId: user.id,
        callSid: CallSid,
        intent: aiResult.intent,
        category: aiResult.category,
        priority: aiResult.priority,
        isEmergency: aiResult.isEmergency,
        duration: 30, // Mock duration
        summary: aiResult.summary,
        transcript: SpeechResult
      }
    });

    if (aiResult.category === 'Health' || aiResult.category === 'Emergency') {
      await prisma.healthReport.create({
        data: {
          userId: user.id,
          callId: callLog.id,
          symptoms: aiResult.symptoms,
          severity: aiResult.priority,
          summary: aiResult.summary
        }
      });
    }
  }

  // 6. Return Twilio Response
  const twiml = generateResponseTwiML(aiResult.response);
  res.type('text/xml');
  res.send(twiml);
};

// Manual Endpoint for Testing without Twilio
export const analyzeManual = async (req: Request, res: Response) => {
  const { text } = req.body;
  const result = await processSpeech('manual-session-id', text);
  res.json(result);
};

import { updateLiveCall } from '../services/twilioService';

export const adminReply = async (req: Request, res: Response) => {
  const { callSid, message } = req.body;

  try {
    await updateLiveCall(callSid, message);

    // Save to DB
    await prisma.callLog.update({
      where: { callSid },
      data: { adminReply: message, status: 'Completed' }
    });

    res.json({ success: true, message: 'Reply sent' });
  } catch (error) {
    console.error('Failed to send admin reply:', error);
    res.status(500).json({ error: 'Failed to send admin reply' });
  }
};

const IVR_MENU = `
  Press 1 for General Health Query.
  Press 2 for Symptoms Check.
  Press 3 for Medication Issue.
  Press 4 for Appointment Booking.
  Press 5 for Emergency.
  Press 6 for Complaint.
  Press 7 for Feedback.
  Press 8 for Other Medical Queries.
  Press 9 to Speak to Doctor or Admin.
`;

const IVR_CATEGORIES: Record<string, string> = {
  '1': 'General Health Query',
  '2': 'Symptoms Check',
  '3': 'Medication Issue',
  '4': 'Appointment Booking',
  '5': 'Emergency',
  '6': 'Complaint',
  '7': 'Feedback',
  '8': 'Other Medical Queries',
};

export const ivrVoice = async (req: Request, res: Response) => {
  const twiml = new VoiceResponse();
  const gather = twiml.gather({
    numDigits: 1,
    action: '/api/call/ivr/handle-key',
    method: 'POST'
  });
  gather.say({ voice: 'Polly.Amy-Neural' }, IVR_MENU);
  
  twiml.say("We didn't receive any input. Goodbye!");
  
  res.type('text/xml');
  res.send(twiml.toString());
};

export const ivrHandleKey = async (req: Request, res: Response) => {
  const { Digits } = req.body;
  const twiml = new VoiceResponse();

  if (Digits === '9') {
    twiml.say({ voice: 'Polly.Amy-Neural' }, "Connecting you to a doctor or admin. Please hold.");
    twiml.dial('+919600097807');
  } else if (IVR_CATEGORIES[Digits]) {
    const categoryName = IVR_CATEGORIES[Digits];
    twiml.say({ voice: 'Polly.Amy-Neural' }, `You selected ${categoryName}. Please state your condition clearly after the beep.`);
    twiml.record({
      action: `/api/call/ivr/process-recording?category=${encodeURIComponent(categoryName)}&opt=${Digits}`,
      maxLength: 30,
      playBeep: true,
      transcribe: true // Optional, but twilio might not transcribe instantly. We can use Gather input=speech instead for instant STT
    });
    // Alternative: Use Gather input=speech if you want instant transcript inline
    // twiml.gather({ input: ['speech'], action: `/api/call/ivr/process-recording?category=${encodeURIComponent(categoryName)}&opt=${Digits}` })
  } else {
    twiml.say({ voice: 'Polly.Amy-Neural' }, "Invalid selection. Goodbye.");
  }

  res.type('text/xml');
  res.send(twiml.toString());
};

export const ivrProcessRecording = async (req: Request, res: Response) => {
  const { From, CallSid, RecordingUrl, SpeechResult } = req.body;
  const categoryName = req.query.category as string || 'Unknown';
  const selectedOption = req.query.opt as string || '0';
  
  // Use speech result if Gather input=speech was used, else use recording URL or placeholder
  const transcript = SpeechResult || `(Recording saved: ${RecordingUrl || 'Not available'})`;
  const aiResponse = "Your request has been received and will be processed.";

  try {
    let user = await prisma.user.findUnique({ where: { phone: From || 'Unknown' } });
    if (!user) {
      user = await prisma.user.create({ data: { phone: From || 'Unknown', name: 'IVR Caller', type: 'NEW' } });
    }

    await prisma.callLog.create({
      data: {
        userId: user.id,
        callSid: CallSid,
        intent: 'Medical IVR Submission',
        category: categoryName,
        selectedOption,
        transcript,
        recordingUrl: RecordingUrl || null,
        aiResponse,
        status: 'Under Review',
        duration: 0, 
      }
    });
  } catch (err) {
    console.error("DB Error:", err);
  }

  const twiml = new VoiceResponse();
  twiml.say({ voice: 'Polly.Amy-Neural' }, aiResponse);
  twiml.hangup();

  // Notify frontend of new call
  getIo().emit('call_incoming', { callSid: CallSid, from: From });

  res.type('text/xml');
  res.send(twiml.toString());
};

export const downloadCallData = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const call = await prisma.callLog.findUnique({ where: { id } });
    if (!call) return res.status(404).json({ error: 'Call not found' });
    
    res.json({
      transcript: call.transcript || 'No transcript available',
      recordingUrl: call.recordingUrl || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch download data' });
  }
};

export const updateCallStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const call = await prisma.callLog.update({
      where: { id },
      data: { status }
    });
    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
