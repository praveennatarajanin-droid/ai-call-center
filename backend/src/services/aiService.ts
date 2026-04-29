import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Memory cache for active call sessions
const sessions: Record<string, any[]> = {};

export const processSpeech = async (callSid: string, text: string) => {
  if (!sessions[callSid]) {
    sessions[callSid] = [
      { role: 'system', content: `You are a helpful call center AI assistant. 
        Detect intent from user input. Intents can be: enquiry, complaint, payment_issue, membership_query, or unknown. 
        Always respond in a natural, conversational way that can be read out loud over the phone.` }
    ];
  }

  sessions[callSid].push({ role: 'user', content: text });

  try {
    if (process.env.OPENAI_API_KEY === 'sk-dummy-openai-key' || !process.env.OPENAI_API_KEY) {
      // Mock logic if no real key is provided
      let intent = 'unknown';
      let response = "I'm sorry, I couldn't process that. Can you please repeat?";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('pay') || lowerText.includes('bill')) {
        intent = 'payment_issue';
        response = "I see you're calling about a payment issue. I can help with that. Let me look up your billing details.";
      } else if (lowerText.includes('member') || lowerText.includes('account')) {
        intent = 'membership_query';
        response = "I can certainly help you with your membership. What specific details do you need?";
      } else if (lowerText.includes('complain') || lowerText.includes('angry')) {
        intent = 'complaint';
        response = "I'm very sorry to hear you're having a bad experience. Please tell me more so I can fix it for you.";
      } else {
        intent = 'enquiry';
        response = "Thanks for your enquiry! How else can I assist you today?";
      }
      
      sessions[callSid].push({ role: 'assistant', content: response });
      return { intent, response };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or gpt-3.5-turbo
      messages: sessions[callSid] as any[],
      functions: [
        {
          name: 'detect_intent_and_respond',
          description: 'Detects the intent of the user and provides a conversational response to be spoken back.',
          parameters: {
            type: 'object',
            properties: {
              intent: { type: 'string', enum: ['enquiry', 'complaint', 'payment_issue', 'membership_query', 'unknown'] },
              response: { type: 'string', description: 'The natural spoken response to the user' }
            },
            required: ['intent', 'response']
          }
        }
      ],
      function_call: { name: 'detect_intent_and_respond' }
    });

    const funcCall = completion.choices[0].message.function_call;
    if (funcCall && funcCall.arguments) {
      const result = JSON.parse(funcCall.arguments);
      sessions[callSid].push({ role: 'assistant', content: result.response });
      return result;
    }

    return { intent: 'unknown', response: "I'm not sure how to respond to that." };

  } catch (error) {
    console.error('AI Processing Error:', error);
    return { intent: 'error', response: 'Sorry, our AI system is currently experiencing issues.' };
  }
};
