const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const PG = require('./models/PG');
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();
  try {
    await User.deleteMany({});
    await PG.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const owner1 = await User.create({
      name: 'Ramesh Sharma',
      email: 'owner1@pgfinder.com',
      password: 'password123',
      phone: '9876543210',
      role: 'owner',
    });

    const owner2 = await User.create({
      name: 'Priya Patel',
      email: 'owner2@pgfinder.com',
      password: 'password123',
      phone: '9876543211',
      role: 'owner',
    });

    await User.create({
      name: 'Rahul Student',
      email: 'student@pgfinder.com',
      password: 'password123',
      phone: '9876543212',
      role: 'student',
    });

    const pgs = [
      {
        owner: owner1._id,
        name: 'Sunrise Boys PG',
        description: 'Comfortable boys PG near MANIT. Clean rooms, home-cooked meals, and 24/7 security. Perfect for engineering students.',
        address: { street: '12 Polytechnic Square', area: 'Awadhpuri', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462026' },
        location: { type: 'Point', coordinates: [77.4126, 23.2296] },
        type: 'boys',
        price: { min: 4000, max: 7000 },
        roomTypes: [
          { type: 'single', price: 7000, available: true, amenities: ['AC', 'Attached Bathroom'] },
          { type: 'double', price: 5000, available: true, amenities: ['Fan', 'Shared Bathroom'] },
          { type: 'triple', price: 4000, available: true, amenities: ['Fan', 'Shared Bathroom'] },
        ],
        amenities: { wifi: true, ac: true, parking: true, laundry: true, meals: true, security: true, powerBackup: true, hotWater: true, cctv: true },
        nearbyPlaces: [
          { name: 'MANIT Bhopal', type: 'college', distance: '0.5 km' },
          { name: 'Awadhpuri Market', type: 'market', distance: '0.3 km' },
          { name: 'Apollo Hospital', type: 'hospital', distance: '1.2 km' },
        ],
        rules: ['No smoking inside', 'Guests allowed till 9 PM', 'Electricity charges extra'],
        contactPhone: '9876543210',
        contactEmail: 'owner1@pgfinder.com',
        isVerified: true,
        rating: 4.5,
        totalReviews: 12,
      },
      {
        owner: owner2._id,
        name: 'Green Valley Girls PG',
        description: 'Safe and homely girls PG in Kolar Road. Attached bathrooms, home food available, and 24/7 CCTV surveillance.',
        address: { street: '45 Kolar Road', area: 'Kolar', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462042' },
        location: { type: 'Point', coordinates: [77.4380, 23.1789] },
        type: 'girls',
        price: { min: 5000, max: 9000 },
        roomTypes: [
          { type: 'single', price: 9000, available: true, amenities: ['AC', 'Attached Bathroom', 'Study Table'] },
          { type: 'double', price: 6500, available: true, amenities: ['AC', 'Attached Bathroom'] },
        ],
        amenities: { wifi: true, ac: true, parking: false, laundry: true, meals: true, security: true, powerBackup: true, hotWater: true, cctv: true },
        nearbyPlaces: [
          { name: 'Barkatullah University', type: 'college', distance: '1.5 km' },
          { name: 'DB Mall', type: 'mall', distance: '2 km' },
        ],
        rules: ['Girls only', 'No male visitors', 'Gate closes at 10 PM'],
        contactPhone: '9876543211',
        contactEmail: 'owner2@pgfinder.com',
        isVerified: true,
        rating: 4.8,
        totalReviews: 24,
      },
      {
        owner: owner1._id,
        name: 'City Center Co-Living',
        description: 'Modern co-living space in the heart of Bhopal. High-speed internet and coworking space included.',
        address: { street: '78 MP Nagar Zone 1', area: 'MP Nagar', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462011' },
        location: { type: 'Point', coordinates: [77.4000, 23.2300] },
        type: 'coed',
        price: { min: 6000, max: 12000 },
        roomTypes: [
          { type: 'single', price: 12000, available: true, amenities: ['AC', 'Attached Bathroom', 'Balcony'] },
          { type: 'double', price: 8000, available: false, amenities: ['AC', 'Shared Bathroom'] },
        ],
        amenities: { wifi: true, ac: true, parking: true, laundry: true, meals: false, security: true, powerBackup: true, hotWater: true, cctv: true, gym: true },
        nearbyPlaces: [
          { name: 'Symbiosis University', type: 'college', distance: '1 km' },
          { name: 'Aura Mall', type: 'mall', distance: '0.5 km' },
        ],
        rules: ['No loud music after 11 PM', 'Visitors allowed in common areas only'],
        contactPhone: '9876543210',
        isVerified: true,
        rating: 4.2,
        totalReviews: 8,
      },
      {
        owner: owner2._id,
        name: 'Budget Stay PG',
        description: 'Affordable PG for students on a budget. Basic amenities, clean rooms, hygienic food at lowest prices.',
        address: { street: '22 Habibganj', area: 'Habibganj', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462024' },
        location: { type: 'Point', coordinates: [77.4320, 23.2280] },
        type: 'boys',
        price: { min: 2500, max: 4500 },
        roomTypes: [
          { type: 'double', price: 4500, available: true, amenities: ['Fan', 'Shared Bathroom'] },
          { type: 'triple', price: 3500, available: true, amenities: ['Fan', 'Shared Bathroom'] },
          { type: 'dormitory', price: 2500, available: true, amenities: ['Fan', 'Shared Bathroom'] },
        ],
        amenities: { wifi: true, ac: false, parking: false, laundry: false, meals: true, security: true, powerBackup: false, hotWater: true, cctv: false },
        nearbyPlaces: [
          { name: 'Bhopal Railway Station', type: 'transport', distance: '0.3 km' },
          { name: 'AIIMS Bhopal', type: 'hospital', distance: '3 km' },
        ],
        rules: ['No alcohol', 'Gate closes at 11 PM'],
        contactPhone: '9876543211',
        isVerified: false,
        rating: 3.8,
        totalReviews: 5,
      },
      {
        owner: owner1._id,
        name: "Scholar's Inn",
        description: 'Premium PG exclusively for students near Barkatullah University. Study rooms and library access available.',
        address: { street: '5 University Road', area: 'Barkatullah University Area', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462026' },
        location: { type: 'Point', coordinates: [77.3990, 23.2100] },
        type: 'coed',
        price: { min: 7000, max: 14000 },
        roomTypes: [
          { type: 'single', price: 14000, available: true, amenities: ['AC', 'Attached Bathroom', 'Study Desk'] },
          { type: 'double', price: 9000, available: true, amenities: ['AC', 'Shared Bathroom', 'Study Desk'] },
        ],
        amenities: { wifi: true, ac: true, parking: true, laundry: true, meals: true, security: true, powerBackup: true, hotWater: true, cctv: true, gym: true },
        nearbyPlaces: [
          { name: 'Barkatullah University', type: 'college', distance: '0.2 km' },
          { name: 'IPS Academy', type: 'college', distance: '0.5 km' },
        ],
        rules: ['Students only', 'Quiet hours 10 PM to 6 AM', 'No outside food in study area'],
        contactPhone: '9876543210',
        contactEmail: 'owner1@pgfinder.com',
        isVerified: true,
        rating: 4.9,
        totalReviews: 31,
      },
    ];

    await PG.insertMany(pgs);
    console.log('✅ Seed data inserted successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('  Owner 1 : owner1@pgfinder.com / password123');
    console.log('  Owner 2 : owner2@pgfinder.com / password123');
    console.log('  Student : student@pgfinder.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();