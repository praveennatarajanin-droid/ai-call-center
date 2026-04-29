import { Router } from 'express';
import { incomingCall, handleGather, analyzeManual } from '../controllers/callController';

const router = Router();

// Twilio Webhooks
// Ensure express.urlencoded({ extended: true }) is used in index.ts because Twilio sends x-www-form-urlencoded
router.post('/incoming', incomingCall);
router.post('/gather', handleGather);

// API Endpoints
router.post('/analyze', analyzeManual);

export default router;
