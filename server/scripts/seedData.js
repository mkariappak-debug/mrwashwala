import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

const services = [
  {
    id: 'wash-fold',
    name: 'Wash & Fold',
    unit: 'kg',
    price: 49,
    features: ['Professional washing', 'Gentle drying', 'Neat folding'],
    featured: false
  },
  {
    id: 'dry-cleaning',
    name: 'Dry Cleaning',
    unit: 'item',
    price: 39,
    features: ['Delicate care', 'Stain removal', 'Professional pressing'],
    featured: true
  },
  {
    id: 'premium-bedding',
    name: 'Premium Bedding',
    unit: 'set',
    price: 129,
    features: ['Deep cleaning', 'Fabric care', 'Fresh delivery'],
    featured: false
  },
  {
    id: 'steam-press',
    name: 'Steam Press',
    unit: 'item',
    price: 79,
    features: ['Professional pressing', 'Crease removal', 'Perfect finish'],
    featured: false
  },
  {
    id: 'shoe-cleaning',
    name: 'Shoe Cleaning',
    unit: 'pair',
    price: 125,
    features: ['Deep cleaning', 'Protective coating', 'Like new look'],
    featured: false
  }
];

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing laundry services from database.');

    // Insert new services
    await Service.insertMany(services);
    console.log('Successfully seeded laundry services into database!');

    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
