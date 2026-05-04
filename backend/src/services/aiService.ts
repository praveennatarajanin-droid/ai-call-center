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
    const isPlaceholder = !process.env.OPENAI_API_KEY || 
                         process.env.OPENAI_API_KEY.includes('placeholder') || 
                         process.env.OPENAI_API_KEY.includes('dummy');

    if (isPlaceholder) {
      console.log('Using Mock AI Logic (Placeholder Key Detected)');
      return getMockResponse(text);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', 
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
    console.error('AI Processing Error, falling back to Mock:', error);
    return getMockResponse(text);
  }
};

const getMockResponse = (text: string) => {
  let intent = 'unknown';
  let response = "I'm sorry, I couldn't process that. Can you please repeat?";
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('pay') || lowerText.includes('bill') || lowerText.includes('money') || lowerText.includes('gst')) {
    intent = 'payment_issue';
    response = "I see you're asking about payments or billing. I can help you with your invoice details or payment status.";
  } else if (lowerText.includes('member') || lowerText.includes('account') || lowerText.includes('plan')) {
    intent = 'membership_query';
    response = "I can certainly help you with your account or membership plan. What specific details are you looking for?";
  } else if (lowerText.includes('complain') || lowerText.includes('angry') || lowerText.includes('bad') || lowerText.includes('issue')) {
    intent = 'complaint';
    response = "I'm very sorry you're having trouble. Please tell me more so I can fix this for you immediately.";
  } else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('yo')) {
    intent = 'enquiry';
    response = "Hello! I'm your AI assistant. How can I help you today?";
  } else {
    intent = 'enquiry';
    response = "Thanks for reaching out! How else can I assist you with our services today?";
  }
  
  return { intent, response };
};

