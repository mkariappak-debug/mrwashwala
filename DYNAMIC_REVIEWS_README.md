# Dynamic Google Reviews System

## Overview

The Mr. WashWala website now features a dynamic testimonials section that pulls 5-star reviews from a MongoDB database and displays them in an auto-rotating carousel. This system is designed to be flexible, allowing for manual review entry initially and automatic syncing with Google Reviews in the future.

## Architecture

### Backend

**Models:**
- `server/models/Review.js` - MongoDB Schema for reviews with fields:
  - `author` - Reviewer's name
  - `rating` - Rating (1-5, only 5-star reviews are displayed)
  - `text` - Review content
  - `profilePhoto` - URL to profile image (optional)
  - `reviewDate` - When the review was created
  - `source` - Origin of review (google, manual, api)

**Routes:**
- `server/routes/reviewRoutes.js` - Express endpoints:
  - `GET /api/reviews` - Fetch all 5-star reviews (sorted by newest first)
  - `POST /api/reviews` - Create a new review
  - `GET /api/reviews/:id` - Get a specific review

### Frontend

**Components:**
- `client/src/components/Testimonials.jsx` - Main component that:
  - Fetches reviews from the backend API
  - Displays exactly 5 reviews at a time
  - Auto-rotates every 8 seconds
  - Handles loading and error states
  - Wraps around to the beginning when reaching the end
  - Shows profile images, names, dates, ratings, and verified badge

**Styling:**
- `client/src/styles.css` - All review card and carousel styling with glassmorphism design

## Setup Instructions

### 1. Start Backend Server

Ensure MongoDB is running, then start the Express server:

```bash
cd server
npm install
npm run dev
```

The API will be available at `http://localhost:5000/api/reviews`

### 2. Seed Initial Reviews

To populate the database with sample 5-star reviews:

```bash
cd server
node scripts/seedReviews.js
```

This will:
- Connect to MongoDB
- Clear existing reviews (optional, can be commented out)
- Insert 8 sample 5-star reviews
- Display a success message with review count

### 3. Start Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will automatically fetch reviews from the API when the page loads.

## Usage

### Displaying Reviews

The reviews carousel automatically appears in the testimonials section. It will:

1. **Load** - Show "Loading reviews..." message
2. **Fetch** - Get all 5-star reviews from the API
3. **Display** - Show 5 reviews at a time in the carousel
4. **Rotate** - Automatically advance to the next 5 reviews every 8 seconds
5. **Loop** - When reaching the end, wrap back to the beginning

### Adding New Reviews Manually

**Via API (using curl or Postman):**

```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Customer Name",
    "rating": 5,
    "text": "Your review text here...",
    "profilePhoto": null,
    "reviewDate": "2024-06-11",
    "source": "manual"
  }'
```

**Via MongoDB directly:**

```javascript
db.reviews.insertOne({
  author: "Customer Name",
  rating: 5,
  text: "Review text...",
  profilePhoto: null,
  reviewDate: new Date(),
  source: "manual"
})
```

## Features

### Automatic Rotation
- 5 reviews displayed at a time
- Auto-rotates every 8 seconds
- Smooth transitions between batches
- Wraps around seamlessly

### Responsive Design
- **Desktop**: 5 cards visible (20% width each)
- **Tablet (≤1200px)**: 3 cards visible (33% width each)
- **Mobile (≤768px)**: 2 cards visible (50% width each)
- **Small Mobile (≤480px)**: 1 card visible (100% width)

### Review Card Display
- Profile image (with placeholder if unavailable)
- Reviewer name
- Review date (formatted as "X days ago", "X months ago", etc.)
- 5-star rating display (★★★★★)
- Review text (truncated at 150 characters with "...")
- "Verified" badge with Google checkmark icon
- Glassmorphism design with hover effects

### Loading & Error States
- Loading message while fetching reviews
- Error message if API fails or no reviews available
- Review counter showing current batch and total count

## Future Enhancements

### Google Reviews Integration

To sync reviews directly from Google:

1. **Set up Google API**
   - Create a Google Cloud project
   - Enable Places API
   - Get API credentials

2. **Create sync endpoint**
   ```javascript
   // server/routes/reviewRoutes.js
   router.post('/sync-google', async (req, res) => {
     // Call Google Places API
     // Filter 5-star reviews
     // Save to MongoDB
   });
   ```

3. **Schedule automatic sync**
   - Use `node-cron` to run sync daily
   - Update `server/server.js`

4. **Track sync status**
   - Add `lastSyncDate` field to reviews
   - Prevent duplicate entries

### Customization Options

Add admin panel to:
- Approve/reject reviews
- Edit review text
- Set rotation interval
- Configure cards per batch

## Troubleshooting

### Reviews not loading
1. Check MongoDB connection in server console
2. Verify API endpoint: `GET http://localhost:5000/api/reviews`
3. Ensure CORS is enabled for frontend origin

### Old testimonials still showing
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check that old Testimonials.jsx component is replaced

### Reviews not rotating
1. Check browser console for errors
2. Verify `setInterval` is working (check React DevTools)
3. Ensure at least 6 reviews in database (for proper rotation)

## API Responses

### Successful GET /api/reviews
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "author": "Rajesh Kumar",
      "rating": 5,
      "text": "Great service!",
      "profilePhoto": null,
      "reviewDate": "2024-06-01T00:00:00.000Z",
      "source": "manual"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to fetch reviews",
  "error": "Connection error"
}
```

## Code Structure

```
server/
├── models/
│   └── Review.js (Mongoose schema)
├── routes/
│   └── reviewRoutes.js (Express endpoints)
├── scripts/
│   └── seedReviews.js (Database seeding)
└── server.js (Main app + route imports)

client/
├── src/
│   ├── components/
│   │   └── Testimonials.jsx (React component)
│   ├── styles.css (Carousel styling)
│   └── api/
│       └── api.js (API calls)
```

## Performance Notes

- Reviews are sorted by newest first
- MongoDB index on `rating` and `reviewDate` for fast queries
- Lean queries used for better performance
- Client-side rotation (no API calls during auto-scroll)

## Security Considerations

- Reviews are read-only from frontend
- POST endpoint exists for admin use only (add authentication)
- Input validation on backend for review creation
- Rate limiting recommended for production

## Support

For issues or questions, check:
1. Backend console for errors
2. Browser console for frontend errors
3. MongoDB Atlas/Compass for data verification
4. Network tab in browser DevTools for API calls
