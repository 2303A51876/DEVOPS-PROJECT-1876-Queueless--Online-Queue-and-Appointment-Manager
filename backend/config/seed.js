const User = require('../models/User');
const Service = require('../models/Service');
const Queue = require('../models/Queue');

/**
 * Database Seeder
 * Seeds admin (pre-created), 10 users, 3 services on first run.
 * Passwords are hashed via User model's pre-save hook.
 * Admin cannot be created via UI — only through this seeder.
 */
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📦 Database already has data. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding database...');

    // ========== 1. Admin (pre-created, NOT accessible via registration) ==========
    const admin = new User({
      name: 'Thulasi Shylasri',
      email: 'thulasishylasri@gmail.com',
      password: 'password123',
      role: 'admin',
    });
    await admin.save();
    console.log('  ✅ Admin created');

    // ========== 2. Seed 10 Users (auto-generated emails) ==========
    const usersData = [
      { name: 'Vasudev Kazipeta', email: 'vasudevkazipeta@gmail.com' },
      { name: 'Pranav Thirunahari', email: 'pranavthirunahari@gmail.com' },
      { name: 'Srinivas Thirunahari', email: 'srinivasthirunahari@gmail.com' },
      { name: 'Akshar Thirunahari', email: 'aksharthirunahari@gmail.com' },
      { name: 'Varshil Kazipeta', email: 'varshilkazipeta@gmail.com' },
      { name: 'Vihaan Kazipeta', email: 'vihaankazipeta@gmail.com' },
      { name: 'Bhanu Thirunahari', email: 'bhanuthirunahari@gmail.com' },
      { name: 'Shresta Thirunahari', email: 'shrestathirunahari@gmail.com' },
      { name: 'Sheshu Thirunahari', email: 'sheshuthirunahari@gmail.com' },
      { name: 'Prasanna Thirunahari', email: 'prasannathirunahari@gmail.com' },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = new User({ ...u, password: 'password123', role: 'user' });
      await user.save();
      createdUsers.push(user);
    }
    console.log(`  ✅ ${createdUsers.length} users created`);

    // ========== 3. Seed Services ==========
    const servicesData = [
      {
        serviceName: 'Bank Service',
        description: 'Banking operations including deposits, withdrawals, account management, and loan processing.',
        maxQueueLimit: 30,
      },
      {
        serviceName: 'Hospital Appointment',
        description: 'Outpatient consultations, health checkups, specialist appointments, and medical reports.',
        maxQueueLimit: 25,
      },
      {
        serviceName: 'Government Office',
        description: 'Document verification, certificate issuance, passport services, and government inquiries.',
        maxQueueLimit: 20,
      },
    ];

    const createdServices = await Service.insertMany(servicesData);
    console.log(`  ✅ ${createdServices.length} services created`);

    // ========== 4. Pre-populate Queues ==========
    const queueEntries = [
      // Bank Service — 4 users
      { userId: createdUsers[0]._id, serviceId: createdServices[0]._id, tokenNumber: 1, status: 'waiting' },
      { userId: createdUsers[1]._id, serviceId: createdServices[0]._id, tokenNumber: 2, status: 'waiting' },
      { userId: createdUsers[2]._id, serviceId: createdServices[0]._id, tokenNumber: 3, status: 'waiting' },
      { userId: createdUsers[3]._id, serviceId: createdServices[0]._id, tokenNumber: 4, status: 'waiting' },
      // Hospital — 3 users
      { userId: createdUsers[4]._id, serviceId: createdServices[1]._id, tokenNumber: 1, status: 'waiting' },
      { userId: createdUsers[5]._id, serviceId: createdServices[1]._id, tokenNumber: 2, status: 'waiting' },
      { userId: createdUsers[6]._id, serviceId: createdServices[1]._id, tokenNumber: 3, status: 'waiting' },
      // Government — 3 users
      { userId: createdUsers[7]._id, serviceId: createdServices[2]._id, tokenNumber: 1, status: 'waiting' },
      { userId: createdUsers[8]._id, serviceId: createdServices[2]._id, tokenNumber: 2, status: 'waiting' },
      { userId: createdUsers[9]._id, serviceId: createdServices[2]._id, tokenNumber: 3, status: 'waiting' },
    ];

    await Queue.insertMany(queueEntries);
    console.log(`  ✅ ${queueEntries.length} queue entries created`);
    console.log('🌱 Seeding complete!');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedDatabase;
