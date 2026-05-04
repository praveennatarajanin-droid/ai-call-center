import { Router } from 'express';
import { 
  incomingCall, handleGather, analyzeManual, adminReply, 
  ivrVoice, ivrHandleKey, ivrProcessRecording, updateCallStatus, downloadCallData 
} from '../controllers/callController';
import { authenticateToken } from '../utils/authMiddleware';

const router = Router();

// New IVR Endpoints
router.post('/ivr/voice', ivrVoice);
router.post('/ivr/handle-key', ivrHandleKey);
router.post('/ivr/process-recording', ivrProcessRecording);

// Twilio Webhooks (Legacy)
router.post('/incoming', incomingCall);
router.post('/gather', handleGather);

// Admin Action Endpoints
router.post('/reply', authenticateToken, adminReply);
router.put('/:id/status', authenticateToken, updateCallStatus);
router.get('/:id/download', authenticateToken, downloadCallData);

// API Endpoints
router.post('/analyze', analyzeManual);

export default router;
