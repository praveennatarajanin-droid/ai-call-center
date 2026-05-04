import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Get health reports for a user (simulated)
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const reports = await prisma.healthReport.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      include: {
        call: true
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health reports' });
  }
});

// Get all health reports (Admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await prisma.healthReport.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
        call: true
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health reports' });
  }
});

export default router;
