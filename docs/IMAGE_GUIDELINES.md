# Image Guidelines for Discover Udupi

This guide explains how to add and optimize images for locations in Discover Udupi.

## Image Requirements

### Recommended Specifications

- **Format:** WebP (preferred) or JPEG
- **Aspect Ratio:** 4:3 or 16:9 (landscape)
- **Dimensions:** 800x600 pixels (minimum)
- **File Size:** Under 200KB (optimized)
- **Quality:** 75-85% for WebP

### Why These Specs?

- **WebP:** Better compression, faster loading
- **Landscape:** Works best with the card layout
- **800x600:** Good balance between quality and file size
- **Under 200KB:** Ensures fast page loading

## Method 1: Using External Image URLs (Easiest)

### Using Unsplash

1. Visit [Unsplash.com](https://unsplash.com)
2. Search for your location (e.g., "Udupi temple")
3. Click on an image you like
4. Click "Download" or copy the image URL
5. Use the URL directly in your location data:

```typescript
image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
```

**Pro Tip:** Add `?w=800&h=600&fit=crop` to Unsplash URLs to get the right size.

### Using Other Image Hosting Services

- **Pexels:** Similar to Unsplash, free stock photos
- **Pixabay:** Free images with good quality
- **Your own hosting:** Upload to any image hosting service

## Method 2: Using Local Images (More Control)

### Step 1: Prepare Your Image

1. Take or download a high-quality image
2. Resize it to 800x600 pixels (or similar aspect ratio)
3. Save it as JPEG or PNG

### Step 2: Optimize the Image

#### Option A: Using the Optimization Script (Recommended)

1. Place your raw image in `public/images/images-raw/`
2. Run the optimization script:
   ```bash
   node scripts/optimize-images.js
   ```
3. The script will:
   - Convert to WebP format
   - Resize to 800x600
   - Optimize quality
   - Save to `public/images/locations/`
4. Use the generated path in your location data:
   ```typescript
   image: "/images/locations/your-image-name.webp"
   ```

#### Option B: Manual Optimization

1. Use an online tool like [Squoosh](https://squoosh.app/)
2. Upload your image
3. Select WebP format
4. Adjust quality to 75-85%
5. Download the optimized image
6. Place it in `public/images/locations/`
7. Use the path in your location data

### Step 3: Generate Blur Placeholder (Optional but Recommended)

Blur placeholders improve the loading experience by showing a blurred version while the full image loads.

#### Using the Blur Generation Script

1. Make sure your image is in `public/images/locations/`
2. Run the blur generation script:
   ```bash
   node scripts/generate-blur.js
   ```
3. The script will:
   - Generate a tiny blurred version
   - Create a base64 data URL
   - Update your `locations.ts` file automatically

#### Manual Blur Generation

If you prefer to do it manually:

1. Use an online tool to create a tiny (8x8 or 20x20) blurred version
2. Convert to base64
3. Add to your location:
   ```typescript
   blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
   ```

## Image Paths Explained

### Local Images

```typescript
image: "/images/locations/temple.webp"
```

- Path starts with `/` (root of public folder)
- File must be in `public/images/locations/`
- Use relative paths from the public folder

### External URLs

```typescript
image: "https://images.unsplash.com/photo-123456"
```

- Full URL including `https://`
- No need to store locally
- Faster to set up but less control

## Best Practices

### 1. Image Selection

- **Choose high-quality images:** Clear, well-lit, professional-looking
- **Match the location:** Image should accurately represent the place
- **Avoid watermarks:** Use free stock photos or your own images
- **Consider composition:** Landscape orientation works best

### 2. Optimization

- **Always optimize:** Large images slow down the website
- **Use WebP when possible:** Better compression than JPEG
- **Test loading speed:** Check how fast images load on slower connections

### 3. Multiple Images

For locations with multiple images (gallery):

1. Primary image goes in the `image` field
2. Additional images can be added to the gallery system
3. Use the same optimization process for all images

## Troubleshooting

### Image Not Showing

**Check:**
1. File path is correct (case-sensitive on some systems)
2. File exists in the correct folder
3. File extension matches (`.webp`, `.jpg`, etc.)
4. No typos in the path

**For local images:**
- Verify file is in `public/images/locations/`
- Check the path starts with `/images/locations/`

**For external URLs:**
- Test the URL in a browser
- Make sure the URL is accessible
- Check for CORS issues (some sites block external use)

### Image Too Large/Slow Loading

**Solutions:**
1. Run the optimization script
2. Reduce image dimensions
3. Lower quality setting (75% is usually fine)
4. Use WebP format instead of JPEG

### Blur Placeholder Not Working

**Check:**
1. `blurDataURL` is properly formatted
2. Base64 string is complete (not truncated)
3. Starts with `data:image/jpeg;base64,`

## Quick Reference

### Adding a New Image (Quick Method)

1. Find image on Unsplash
2. Copy URL and add `?w=800&h=600&fit=crop`
3. Paste in location data:
   ```typescript
   image: "https://images.unsplash.com/photo-123?w=800&h=600&fit=crop"
   ```

### Adding a Local Image (Full Method)

1. Place image in `public/images/images-raw/your-image.jpg`
2. Run: `node scripts/optimize-images.js`
3. Use path: `image: "/images/locations/your-image.webp"`
4. (Optional) Run: `node scripts/generate-blur.js` for blur placeholder

## Scripts Reference

### optimize-images.js

**Location:** `scripts/optimize-images.js`

**What it does:**
- Converts images to WebP
- Resizes to 800x600
- Optimizes quality
- Saves to `public/images/locations/`

**Usage:**
```bash
node scripts/optimize-images.js
```

### generate-blur.js

**Location:** `scripts/generate-blur.js`

**What it does:**
- Generates blur placeholders
- Creates base64 data URLs
- Updates `locations.ts` automatically

**Usage:**
```bash
node scripts/generate-blur.js
```

## Need Help?

- Check existing locations for examples
- Review the [Adding Locations Guide](./ADDING_LOCATIONS.md)
- Test with a simple external URL first before using local images

