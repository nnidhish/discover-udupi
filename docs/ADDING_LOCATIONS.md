# Adding Locations to Discover Udupi

This guide will help you add new locations to the Discover Udupi app. As a beginner, you'll find step-by-step instructions for the easiest method.

## Method 1: Direct Code Editing (Recommended for Beginners)

This is the simplest way to add locations. You'll edit a TypeScript file directly.

### Step 1: Open the Locations File

Navigate to the `data` folder in your project and open `locations.ts`:

```
discover-udupi/
  └── data/
      └── locations.ts
```

### Step 2: Understand the Location Structure

Each location is an object with the following required fields:

```typescript
{
  id: number,                    // Unique number (use the next available number)
  name: string,                   // Location name (e.g., "Malpe Beach")
  category: string,               // One of: "temples", "food", "beaches", "photography", "shopping", "culture"
  image: string,                 // Image path or URL (see Image Guide below)
  blurDataURL?: string,           // Optional: Blur placeholder for better loading
  description: string,            // Brief description (2-3 sentences)
  tips: string,                   // Local tips for visitors
  hours: string,                 // Opening hours (e.g., "7:00 AM - 10:00 PM")
  rating: number,                // Rating from 0.0 to 5.0
  reviews: number,               // Number of reviews
  address: string,                // Full address
  highlights: string[],           // Array of highlight keywords (e.g., ["Water Sports", "Sunset Views"])
  bestTime: string,              // Best time to visit (e.g., "Evening for sunset")
  lat: number,                   // Latitude coordinate
  lng: number                    // Longitude coordinate
}
```

### Step 3: Add Your Location

1. Find the end of the `locations` array (before the closing `];`)
2. Add a comma after the last location
3. Add your new location object

**Example:**

```typescript
{
  id: 11,  // Use the next available number
  name: "Kudlu Falls",
  category: "photography",
  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  description: "A beautiful waterfall surrounded by lush greenery. Perfect for nature photography and peaceful walks.",
  tips: "Best visited during monsoon season (June-September) when the waterfall is at its fullest. Wear comfortable shoes for the trek.",
  hours: "6:00 AM - 6:00 PM",
  rating: 4.7,
  reviews: 892,
  address: "Kudlu, Udupi, Karnataka 576101",
  highlights: ["Waterfall", "Nature Photography", "Trekking"],
  bestTime: "Monsoon season",
  lat: 13.2500,
  lng: 74.8000
}
```

### Step 4: Get Coordinates (Latitude & Longitude)

You can find coordinates using:

1. **Google Maps:**
   - Search for your location
   - Right-click on the location
   - Click on the coordinates at the top
   - Copy the latitude and longitude

2. **Online Tools:**
   - Visit https://www.latlong.net/
   - Search for your location
   - Copy the coordinates

### Step 5: Add Images

See the [Image Guidelines](./IMAGE_GUIDELINES.md) for detailed instructions on adding images.

**Quick Options:**
- **Local Image:** Place image in `public/images/locations/` and use path like `/images/locations/your-image.webp`
- **External URL:** Use Unsplash or other image hosting services

### Step 6: Save and Test

1. Save the file
2. Run your development server: `npm run dev`
3. Check if your new location appears on the website
4. Test clicking on it to see the details

## Method 2: Using Image Optimization Scripts

If you have local images that need optimization:

1. Place raw images in `public/images/images-raw/`
2. Run the optimization script:
   ```bash
   node scripts/optimize-images.js
   ```
3. This will create optimized WebP images in `public/images/locations/`
4. Use the generated image paths in your location data

## Method 3: Future Admin Dashboard (Roadmap)

In the future, we plan to add an admin dashboard where you can:
- Add locations through a web form
- Upload images directly
- Edit existing locations
- Manage categories

This will be available in a future update.

## Common Categories

Use these exact category names:
- `"temples"` - Religious places
- `"food"` - Restaurants and food places
- `"beaches"` - Beach locations
- `"photography"` - Scenic spots
- `"shopping"` - Shopping areas
- `"culture"` - Cultural sites

## Tips for Beginners

1. **Start Simple:** Copy an existing location and modify it
2. **Test Often:** Save and check your changes frequently
3. **Use External Images First:** It's easier to use Unsplash URLs than local images initially
4. **Check Formatting:** Make sure you have commas between locations and proper closing brackets
5. **Unique IDs:** Always use a unique ID number that doesn't exist yet

## Troubleshooting

**Location doesn't appear:**
- Check for syntax errors (missing commas, brackets)
- Verify the category matches exactly
- Make sure the file saved correctly

**Image not showing:**
- Check the image path is correct
- For local images, ensure the file exists in the `public/images/locations/` folder
- For external URLs, verify the URL is accessible

**TypeScript errors:**
- Make sure all required fields are present
- Check that types match (numbers for id, rating, reviews, lat, lng)
- Verify arrays use square brackets `[]`

## Need Help?

If you get stuck:
1. Check existing locations for examples
2. Review the Location type definition in `types/Location.ts`
3. Look at the Image Guidelines for image-related issues

