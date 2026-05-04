import express from 'express';
import cors from 'cors';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { initSocket } from './utils/socket';
import callRoutes from './routes/callRoutes';
import 'dotenv/config';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // For regular REST API requests
app.use(express.urlencoded({ extended: true })); // IMPORTANT: Twilio sends application/x-www-form-urlencoded

import authRoutes from './routes/authRoutes';
import { authenticateToken } from './utils/authMiddleware';

app.use('/api/auth', authRoutes);

// Use modular routes
app.use('/api/call', callRoutes);
import healthRoutes from './routes/healthRoutes';
app.use('/api/health', healthRoutes);
import aiRoutes from './routes/aiRoutes';
app.use('/api/ai', aiRoutes);

// Original Users endpoint
app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await prisma.user.findMany({
    include: { payments: true }
  });
  res.json(users);
});

// Original Call logs endpoint
app.get('/api/calls', authenticateToken, async (req, res) => {
  const calls = await prisma.callLog.findMany({
    include: { user: true },
    orderBy: { timestamp: 'desc' }
  });
  res.json(calls);
});

// Original Analytics endpoints
app.get('/api/analytics', authenticateToken, async (req, res) => {
  const totalCalls = await prisma.callLog.count();
  const activeUsers = await prisma.user.count();
  
  const intentGroups = await prisma.callLog.groupBy({
    by: ['intent'],
    _count: {
      intent: true,
    },
  });

  const intentStats = intentGroups.map((group) => ({
    name: group.intent,
    value: group._count.intent,
  }));

  res.json({
    totalCalls,
    activeUsers,
    intentStats,
    aiPerformance: 95.4 // Mock performance score
  });
});

server.listen(PORT, () => {
  console.log(`Server & WebSocket running on port ${PORT}`);
});
