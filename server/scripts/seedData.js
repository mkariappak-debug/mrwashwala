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
    featured: false,
    displayType: 'main'
  },
  {
    id: 'dry-cleaning',
    name: 'Dry Cleaning',
    unit: 'item',
    price: 39,
    features: ['Delicate care', 'Stain removal', 'Professional pressing'],
    featured: true,
    displayType: 'main'
  },
  {
    id: 'premium-bedding',
    name: 'Premium Bedding',
    unit: 'set',
    price: 129,
    features: ['Deep cleaning', 'Fabric care', 'Fresh delivery'],
    featured: false,
    displayType: 'main'
  },
  {
    id: 'steam-press',
    name: 'Steam Press',
    unit: 'item',
    price: 79,
    features: ['Professional pressing', 'Crease removal', 'Perfect finish'],
    featured: false,
    displayType: 'main'
  },
  {
    id: 'shoe-cleaning',
    name: 'Shoe Cleaning',
    unit: 'pair',
    price: 125,
    features: ['Deep cleaning', 'Protective coating', 'Like new look'],
    featured: false,
    displayType: 'main'
  },
  {
    id: 'dryclean-shirt-tshirt',
    name: 'Shirt/T-Shirt',
    unit: 'item',
    price: 39,
    features: ['Dry clean', 'Soft finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Men's Wear"
  },
  {
    id: 'dryclean-formal-jeans',
    name: 'Formal/Jeans',
    unit: 'item',
    price: 44,
    features: ['Dry clean', 'Stain removal'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Men's Wear"
  },
  {
    id: 'dryclean-coat',
    name: 'Coat',
    unit: 'item',
    price: 149,
    features: ['Dry clean', 'Pressing'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Men's Wear"
  },
  {
    id: 'dryclean-suit-2',
    name: 'Suit (2 Piece)',
    unit: 'item',
    price: 249,
    features: ['Dry clean', 'Finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Men's Wear"
  },
  {
    id: 'dryclean-suit-3',
    name: 'Suit (3 Piece)',
    unit: 'item',
    price: 299,
    features: ['Dry clean', 'Finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Men's Wear"
  },
  {
    id: 'dryclean-jacket',
    name: 'Jacket',
    unit: 'item',
    price: 99,
    features: ['Dry clean', 'Steam press'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Men's Wear"
  },
  {
    id: 'dryclean-kurta',
    name: 'Kurta',
    unit: 'item',
    price: 75,
    features: ['Dry clean', 'Gentle care'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Women's Wear"
  },
  {
    id: 'dryclean-salwar',
    name: 'Salwar',
    unit: 'item',
    price: 75,
    features: ['Dry clean', 'Soft finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Women's Wear"
  },
  {
    id: 'dryclean-saree',
    name: 'Saree',
    unit: 'item',
    price: 159,
    features: ['Dry clean', 'Delicate handling'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Women's Wear"
  },
  {
    id: 'dryclean-dress',
    name: 'Dress',
    unit: 'item',
    price: 100,
    features: ['Dry clean', 'Finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Women's Wear"
  },
  {
    id: 'dryclean-western',
    name: 'Western',
    unit: 'item',
    price: 99,
    features: ['Dry clean', 'Fresh finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: "Women's Wear"
  },
  {
    id: 'dryclean-carpet',
    name: 'Carpet (sq ft)',
    unit: 'sq ft',
    price: 24,
    features: ['Dry clean', 'Fabric safe'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: 'Others'
  },
  {
    id: 'dryclean-toy-cleaning',
    name: 'Toy Cleaning',
    unit: 'item',
    price: 399,
    features: ['Gentle wash', 'Safe drying'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: 'Others'
  },
  {
    id: 'dryclean-bag-cleaning',
    name: 'Bag Cleaning',
    unit: 'item',
    price: 199,
    features: ['Deep clean', 'Soft finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: 'Others'
  },
  {
    id: 'dryclean-curtain-cleaning',
    name: 'Curtain Cleaning(sq ft)',
    unit: 'sq ft',
    price: 39,
    features: ['Fabric care', 'Steam finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Dry Clean',
    customizeSubcategory: 'Others'
  },
  {
    id: 'bedset-big-blankets',
    name: 'Big Blankets',
    unit: 'item',
    price: 225,
    features: ['Deep clean', 'Soft finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Bed Set Clean'
  },
  {
    id: 'bedset-small-blankets',
    name: 'Small Blankets',
    unit: 'item',
    price: 199,
    features: ['Deep clean', 'Fresh feel'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Bed Set Clean'
  },
  {
    id: 'bedset-bedsheets',
    name: 'Bedsheets',
    unit: 'item',
    price: 129,
    features: ['Deep clean', 'Smooth finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Bed Set Clean'
  },
  {
    id: 'shoe-sports-shoe',
    name: 'Sports Shoe',
    unit: 'pair',
    price: 210,
    features: ['Deep clean', 'Sole shine'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Shoe Cleaning'
  },
  {
    id: 'shoe-casual-shoe',
    name: 'Casual Shoe',
    unit: 'pair',
    price: 200,
    features: ['Deep clean', 'Fresh finish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Shoe Cleaning'
  },
  {
    id: 'shoe-formal-leather',
    name: 'Formal/Leather',
    unit: 'pair',
    price: 299,
    features: ['Leather care', 'Polish'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Shoe Cleaning'
  },
  {
    id: 'shoe-boots',
    name: 'Boots',
    unit: 'pair',
    price: 299,
    features: ['Deep clean', 'Leather care'],
    featured: false,
    displayType: 'customize',
    customizeCategory: 'Shoe Cleaning'
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
