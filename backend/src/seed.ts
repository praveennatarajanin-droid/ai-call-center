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
      { userId: user1.id, intent: 'package_inquiry', duration: 120 },
      { userId: user1.id, intent: 'payment_issue', duration: 45 },
      { userId: user2.id, intent: 'membership_info', duration: 200 },
      { intent: 'unknown', duration: 15 } // new user unassigned call
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
