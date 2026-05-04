import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with localized Indian context...');

  // Clear existing data to avoid duplicates during demo setup
  await prisma.callLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.package.deleteMany({});
  
  // Create dummy packages
  await prisma.package.createMany({
    data: [
      { name: 'Starter Plan', description: 'Basic AI support for small businesses', price: 1499.00 },
      { name: 'Professional Plan', description: 'Advanced sentiment analysis & higher concurrency', price: 4999.00 },
      { name: 'Enterprise Elite', description: 'Custom model training & 24/7 dedicated lines', price: 15999.00 }
    ]
  });

  // Create users with Indian names
  const user1 = await prisma.user.create({
    data: {
      name: 'Arjun Sharma',
      phone: '+91 98765 43210',
      type: 'EXISTING',
      payments: {
        create: [
          { amount: 4999.00, status: 'PAID' }
        ]
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      phone: '+91 87654 32109',
      type: 'EXISTING',
      payments: {
        create: [
          { amount: 1499.00, status: 'PAID' }
        ]
      }
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      phone: '+91 76543 21098',
      type: 'EXISTING',
      payments: {
        create: [
          { amount: 4999.00, status: 'PENDING' }
        ]
      }
    }
  });

  // Create mock call logs with Indian context
  await prisma.callLog.createMany({
    data: [
      { 
        userId: user1.id, 
        intent: 'Pro Plan Extension', 
        category: 'Sales',
        duration: 312, 
        sentiment: 'Positive',
        sentimentScore: 0.85,
        crmSynced: true,
        status: 'Completed',
        summary: 'Customer from Mumbai branch wants to extend their Professional plan for another 6 months.',
        transcript: 'AI: Namaste Arjun! How can I assist you today? User: I want to extend my pro plan. AI: Certainly! I see your Mumbai branch is currently on the Professional Plan. Would you like to extend for 6 or 12 months?'
      },
      { 
        userId: user2.id, 
        intent: 'GST Invoice Inquiry', 
        category: 'Billing',
        duration: 145, 
        sentiment: 'Neutral',
        sentimentScore: 0.55,
        crmSynced: true,
        status: 'Completed',
        summary: 'User requested a GST-compliant invoice for their last payment of ₹1,499.',
        transcript: 'AI: Hello Priya. How can I help? User: I need the GST invoice for my last payment. AI: I have triggered an email with your GST-compliant invoice to your registered ID.'
      },
      { 
        userId: user3.id, 
        intent: 'Payment Failure: UPI', 
        category: 'Billing',
        duration: 210, 
        sentiment: 'Negative',
        sentimentScore: 0.15,
        crmSynced: false,
        status: 'Completed',
        summary: 'User experienced a UPI transaction failure during checkout. Guided them to retry via NetBanking.',
        transcript: 'User: My UPI payment failed but money was deducted. AI: I apologize for the inconvenience, Rahul. Sometimes UPI gateways lag. If deducted, it will refund in 3-5 days. Would you like to try NetBanking instead?'
      },
      { 
        userId: user1.id, 
        intent: 'Integration: Zoho CRM', 
        category: 'Support',
        duration: 540, 
        sentiment: 'Positive',
        sentimentScore: 0.75,
        crmSynced: true,
        status: 'Transferred',
        summary: 'Technical query regarding syncing call logs directly into Zoho CRM. Transferred to Integration Specialist.',
        transcript: 'User: Can I sync these transcripts to my Zoho CRM? AI: Yes, we have a webhook-based integration for Zoho. Let me connect you to our technical lead, Rajesh, for the setup.'
      },
      { 
        intent: 'New Lead: Delhi Retail Chain', 
        category: 'Sales',
        duration: 88, 
        sentiment: 'Positive',
        sentimentScore: 0.92,
        crmSynced: false,
        status: 'Completed',
        summary: 'Proprietor of a retail chain in Delhi inquiring about automated order confirmation calls.',
        transcript: 'User: Do you handle order confirmation calls for retail? AI: Absolutely! We can automate the entire confirmation and delivery tracking process for you.'
      },
      { 
        userId: user2.id, 
        intent: 'Language Preference Change', 
        category: 'Account',
        duration: 120, 
        sentiment: 'Neutral',
        sentimentScore: 0.48,
        crmSynced: true,
        status: 'Completed',
        summary: 'User wants the AI to respond in Hindi for certain campaigns.',
        transcript: 'User: Can the AI talk in Hindi? AI: Yes, I can communicate in Hindi, English, and 5 other regional languages. I have updated your preference.'
      }

    ]
  });

  console.log('Database seeded with Indian context successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

