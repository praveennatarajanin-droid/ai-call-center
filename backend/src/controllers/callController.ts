import { Request, Response } from 'express';
import { generateGreetingTwiML, generateResponseTwiML, generateFallbackTwiML } from '../services/twilioService';
import { processSpeech } from '../services/aiService';
import { getIo } from '../utils/socket';
import { PrismaClient } from '@prisma/client';

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
    intent: aiResult.intent, 
    response: aiResult.response,
    role: 'ai'
  });

  // 5. Store in DB
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' } // Just grabbing latest for demo if phone not passed by gather
  });
  
  if (user && aiResult.intent !== 'unknown') {
    await prisma.callLog.create({
      data: {
        userId: user.id,
        intent: aiResult.intent,
        duration: 30, // Mock duration
      }
    });
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
