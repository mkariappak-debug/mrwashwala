# 🗺️ Location Picker Setup

The checkout form now includes an interactive map picker (like Swiggy) where customers can:
- Click/drag on a map to select their pickup location
- Get automatic address lookup
- Choose between "Use My Current Location" or "Pick From Map"

## 📋 Setup Required: Google Maps API Key

To enable the map picker, you need to add a **Google Maps API Key**:

### Step 1: Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create an API key (Credentials → Create Credentials → API Key)
5. Copy the key

### Step 2: Add to `.env`
Edit `client/.env`:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Step 3: Restart Dev Server
```bash
cd client
npm run dev
```

## ✨ Features

- **📍 Current Location**: Uses device GPS
- **🗺️ Pick From Map**: Interactive map to select any location
- **🔄 Auto Address Lookup**: Reverse geocoding shows full address
- **✓ Visual Feedback**: Shows which method was used

## 🔒 Security Note
- Never commit `.env` with real API key
- Add `.env` to `.gitignore`
- Use API key restrictions in Google Cloud Console (restrict to your domain)
