import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Memory cache for active call sessions
const sessions: Record<string, any[]> = {};

export const processSpeech = async (callSid: string, text: string) => {
  if (!sessions[callSid]) {
    sessions[callSid] = [
      { role: 'system', content: `You are a helpful and empathetic AI health assistant taking calls from elderly parents on behalf of their children.
        Your goal is to detect their health symptoms or issues, provide comforting immediate verbal responses, and extract actionable data.
        Categories can be: Health, Emergency, General, Support. 
        Priorities can be: low, medium, high, emergency.
        Always respond in a natural, conversational way that can be read out loud over the phone.` }
    ];
  }

  sessions[callSid].push({ role: 'user', content: text });

  try {
    if (process.env.OPENAI_API_KEY === 'mock_key' || !process.env.OPENAI_API_KEY) {
      // Mock logic if no real key is provided
      let category = 'General';
      let intent = 'general_chat';
      let priority = 'low';
      let response = "I'm sorry, I couldn't catch that clearly. Can you please repeat?";
      let symptoms = [];
      let summary = "User said: " + text;
      
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('pain') || lowerText.includes('chest') || lowerText.includes('breathe') || lowerText.includes('emergency')) {
        category = 'Emergency';
        intent = 'medical_emergency';
        priority = 'emergency';
        symptoms = ['chest pain', 'difficulty breathing'];
        response = "I am so sorry you are feeling this way. I am alerting your family immediately, please try to stay calm.";
        summary = "Potential emergency detected. Caller reported severe symptoms.";
      } else if (lowerText.includes('fever') || lowerText.includes('cough') || lowerText.includes('headache')) {
        category = 'Health';
        intent = 'mild_symptoms';
        priority = 'medium';
        symptoms = ['fever', 'cough'];
        response = "I understand you have a fever. Make sure you drink plenty of water. I will let your son know.";
        summary = "Caller reported mild symptoms like fever or cough.";
      } else {
        category = 'General';
        intent = 'general_enquiry';
        priority = 'low';
        response = "Thanks for letting me know! How else can I assist you today?";
      }
      
      sessions[callSid].push({ role: 'assistant', content: response });
      return { category, intent, priority, symptoms: symptoms.join(', '), summary, response, isEmergency: priority === 'emergency' };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the requested model
      messages: sessions[callSid] as any[],
      functions: [
        {
          name: 'detect_health_and_respond',
          description: 'Detects the health status of the caller and extracts symptoms, priority, and a summary.',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: ['Health', 'Emergency', 'General', 'Support'] },
              intent: { type: 'string', description: 'Brief description of the call intent' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'emergency'] },
              symptoms: { type: 'array', items: { type: 'string' }, description: 'List of extracted symptoms' },
              summary: { type: 'string', description: 'A short summary of the health concern for the child to read' },
              response: { type: 'string', description: 'The natural spoken response to the parent' }
            },
            required: ['category', 'intent', 'priority', 'symptoms', 'summary', 'response']
          }
        }
      ],
      function_call: { name: 'detect_health_and_respond' }
    });

    const funcCall = completion.choices[0].message.function_call;
    if (funcCall && funcCall.arguments) {
      const result = JSON.parse(funcCall.arguments);
      sessions[callSid].push({ role: 'assistant', content: result.response });
      return {
        category: result.category,
        intent: result.intent,
        priority: result.priority,
        symptoms: result.symptoms.join(', '),
        summary: result.summary,
        response: result.response,
        isEmergency: result.priority === 'emergency'
      };
    }

    return { category: 'General', intent: 'unknown', priority: 'low', symptoms: '', summary: 'No clear intent', response: "I'm not sure how to respond to that.", isEmergency: false };

  } catch (error) {
    console.error('AI Processing Error:', error);
    return { category: 'Error', intent: 'error', priority: 'low', symptoms: '', summary: 'Error processing request', response: 'Sorry, I am having trouble understanding right now.', isEmergency: false };
  }
};
