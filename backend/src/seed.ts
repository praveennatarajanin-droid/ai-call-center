import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create dummy packages
  await prisma.package.createMany({
    data: [
      { name: 'Basic Plan', description: 'Standard support package', price: 19.99 },
      { name: 'Pro Plan', description: 'Priority support + advanced features', price: 49.99 },
      { name: 'Enterprise Plan', description: '24/7 dedicated support', price: 199.99 }
    ]
  });

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      phone: '+1234567890',
      type: 'EXISTING',
      payments: {
        create: [
          { amount: 49.99, status: 'PAID' }
        ]
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      phone: '+1987654321',
      type: 'EXISTING',
      payments: {
        create: [
          { amount: 19.99, status: 'PENDING' }
        ]
      }
    }
  });

  // Create mock call logs
  await prisma.callLog.createMany({
    data: [
      { 
        userId: user1.id, 
        intent: 'Enterprise Upgrade Inquiry', 
        category: 'Sales',
        duration: 245, 
        sentiment: 'Positive',
        status: 'Completed',
        summary: 'Customer interested in upgrading from Pro to Enterprise plan for their team of 50.',
        transcript: 'AI: Hello! How can I help you? User: I want to know about the enterprise plan. AI: Certainly, for a team of your size, the Enterprise plan offers unlimited calls and priority support...'
      },
      { 
        userId: user1.id, 
        intent: 'Billing Discrepancy', 
        category: 'Billing',
        duration: 180, 
        sentiment: 'Neutral',
        status: 'Completed',
        summary: 'User questioned a double charge on their recent invoice. Verified and scheduled a refund.',
        transcript: 'AI: I see the double charge. I have initiated a refund process. User: Thank you, that was quick.'
      },
      { 
        userId: user2.id, 
        intent: 'Technical Integration Support', 
        category: 'Support',
        duration: 420, 
        sentiment: 'Negative',
        status: 'Transferred',
        summary: 'User struggling with Twilio webhook configuration. Call transferred to senior engineer.',
        transcript: 'User: My webhooks are not firing. AI: I have checked the logs and see a 403 error. Let me transfer you to a specialist.'
      },
      { 
        intent: 'New Lead: Product Demo Request', 
        category: 'Sales',
        duration: 95, 
        sentiment: 'Positive',
        status: 'Completed',
        summary: 'Potential customer requested a live demo of the AI Call Center platform.',
        transcript: 'User: Can I see a demo? AI: I can certainly schedule that for you. What time works best?'
      }
    ]
  });


  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
