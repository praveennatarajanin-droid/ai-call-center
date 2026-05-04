import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export const generateGreetingTwiML = () => {
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'Polly.Amy-Neural' }, "Hello! Welcome to the AI-Powered Call Center. How can I assist you today?");
  
  // Use <Gather> to listen for user input (Speech-to-Text)
  const gather = twiml.gather({
    input: ['speech'],
    action: '/api/call/gather',
    method: 'POST',
    timeout: 3,
    speechTimeout: 'auto',
  });
  
  return twiml.toString();
};

export const generateResponseTwiML = (text: string) => {
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'Polly.Amy-Neural' }, text);
  
  // Keep listening for more input after responding
  twiml.gather({
    input: ['speech'],
    action: '/api/call/gather',
    method: 'POST',
    timeout: 5,
    speechTimeout: 'auto',
  });
  
  return twiml.toString();
};

export const generateFallbackTwiML = () => {
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'Polly.Amy-Neural' }, "I'm sorry, I didn't catch that. Could you please repeat?");
  twiml.gather({
    input: ['speech'],
    action: '/api/call/gather',
    method: 'POST',
    timeout: 5,
  });
  return twiml.toString();
};

export const updateLiveCall = async (callSid: string, message: string) => {
  // If credentials are mock, we just simulate success
  if (process.env.TWILIO_ACCOUNT_SID === 'mock_sid' || !process.env.TWILIO_ACCOUNT_SID) {
    console.log(`Mock: Admin replied to ${callSid}: ${message}`);
    return true;
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'Polly.Amy-Neural' }, message);
  
  // After speaking admin message, keep the call open to hear parent response
  twiml.gather({
    input: ['speech'],
    action: '/api/call/gather',
    method: 'POST',
    timeout: 5,
  });

  await client.calls(callSid).update({ twiml: twiml.toString() });
  return true;
};
