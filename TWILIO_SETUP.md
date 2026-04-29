# Full-Stack AI-Powered VoIP Call Handling System

## Architecture Implemented
We have successfully transformed the prototype into a production-ready WebRTC/VoIP architecture:

### Backend Structure (`/backend`)
We have completely refactored the Node.js Express server to a modular setup:
- `src/index.ts`: Bootstraps Express, Prisma, and Socket.io.
- `src/routes/callRoutes.ts`: Exposes `/incoming`, `/gather`, and `/analyze`.
- `src/controllers/callController.ts`: Handles Webhooks, emits WebSocket events, stores logs.
- `src/services/twilioService.ts`: Generates TwiML `<Say>` and `<Gather>` responses.
- `src/services/aiService.ts`: Integrates OpenAI's `gpt-4` function calling to process intent and maintain session context.
- `src/utils/socket.ts`: Global socket.io broadcaster for the React frontend.

### Frontend Dashboard (`/frontend`)
- Integrated `socket.io-client`.
- **Simulator Tab**: Rebuilt into a **Live Call Monitor**. It listens to real-time events (`call_incoming`, `transcription`, `ai_response`) pushed from the backend to display an active call stream instantly!

---

## 🛠️ How to Test It Locally

The frontend (`http://localhost:5173`) and backend (`http://localhost:5000`) are currently running in your environment.

### Option A: The "No-Twilio" Manual Test
I've built a testing input directly on the **Simulator** page of your React Dashboard:
1. Open the dashboard.
2. Go to the Simulator tab.
3. Type a message in the *Manual Testing* box. It hits the new `/api/call/analyze` endpoint.
4. You will see the WebSocket live stream instantly populate with your input and the AI's intent-detected response!

### Option B: The Full Twilio Real-Phone Test
To call a real phone number and speak naturally:

**Step 1: Expose your local port**
Download [Ngrok](https://ngrok.com/) and run this in your terminal to expose your Node server:
```bash
ngrok http 5000
```
*(Copy the generated HTTPS forwarding URL, e.g., `https://abcdef.ngrok.app`)*

**Step 2: Configure Twilio**
1. Get a Twilio Phone Number.
2. Go to the phone number configuration in your Twilio Console.
3. Find the **"A Call Comes In"** webhook field.
4. Paste your Ngrok URL followed by our route: `https://abcdef.ngrok.app/api/call/incoming` (Set to HTTP POST).

**Step 3: Add API Keys to `.env`**
Open `d:\projects\Ai based call\backend\.env` and paste your actual keys:
```env
OPENAI_API_KEY="sk-..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
```

**Step 4: Make the Call!**
1. Open the React Dashboard's **Simulator** page so you can watch the WebSockets.
2. Call your Twilio phone number from your real cell phone.
3. The system will say *"Hello! Welcome to the AI-Powered Call Center."*
4. Speak naturally. The audio will transcribe, pipe to OpenAI for intent classification, and the AI will speak a dynamic response back to you via Twilio! You'll see this all flash on your dashboard in real-time.
