import mongoose from 'mongoose';
import Review from '../models/Review.js';
import dotenv from 'dotenv';

dotenv.config();

const SAMPLE_REVIEWS = [
  {
    author: 'Rajesh Kumar',
    rating: 5,
    text: 'Mr. WashWala provides exceptional laundry service! My clothes always come back fresh and perfectly folded. Highly recommended!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-01'),
    source: 'manual'
  },
  {
    author: 'Priya Sharma',
    rating: 5,
    text: 'Same-day delivery is a game changer! I no longer have to worry about running out of neat business shirts. Keep up the great work!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-02'),
    source: 'manual'
  },
  {
    author: 'Amit Patel',
    rating: 5,
    text: 'Best laundry service in Mysuru. Professional, affordable, and reliable. I\'ve been using them for 6 months!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-03'),
    source: 'manual'
  },
  {
    author: 'Sneha Desai',
    rating: 5,
    text: 'Their shoe cleaning service is outstanding! My sneakers look brand new. Definitely worth trying!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-04'),
    source: 'manual'
  },
  {
    author: 'Vikram Singh',
    rating: 5,
    text: 'Outstanding service quality and very friendly staff. They treated my delicate suits with utmost care. Highly impressed!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-05'),
    source: 'manual'
  },
  {
    author: 'Neha Gupta',
    rating: 5,
    text: 'The stain removal service is amazing! Clothes that I thought were ruined came back looking perfect. Thank you!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-06'),
    source: 'manual'
  },
  {
    author: 'Arjun Reddy',
    rating: 5,
    text: 'Reliable, professional, and affordable. This is my go-to laundry service. Highly recommend to everyone!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-07'),
    source: 'manual'
  },
  {
    author: 'Divya Prabhu',
    rating: 5,
    text: 'Excellent service with quick turnaround time. My wedding saree was handled with such care. Perfect!',
    profilePhoto: null,
    reviewDate: new Date('2024-06-08'),
    source: 'manual'
  }
];

async function seedReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mrwashwala');
    console.log('✓ Connected to MongoDB');

    // Clear existing reviews (optional - comment out to keep old reviews)
    await Review.deleteMany({});
    console.log('✓ Cleared existing reviews');

    // Insert sample reviews
    const inserted = await Review.insertMany(SAMPLE_REVIEWS);
    console.log(`✓ Seeded ${inserted.length} sample reviews`);

    // Display inserted reviews
    console.log('\nInserted Reviews:');
    inserted.forEach((review, index) => {
      console.log(`${index + 1}. ${review.author} - ★★★★★ - "${review.text.substring(0, 50)}..."`);
    });

    console.log('\n✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
}

seedReviews();
