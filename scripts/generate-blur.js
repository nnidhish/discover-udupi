const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateBlurDataURL(imagePath) {
  const imageBuffer = await sharp(imagePath)
    .resize(8, 8, { fit: 'inside' })
    .toBuffer();
  
  return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
}

async function updateLocationsWithBlur() {
  try {
    const locationsPath = path.join(process.cwd(), 'data', 'locations.ts');
    console.log('Reading file:', locationsPath);
    
    let content = await fs.readFile(locationsPath, 'utf8');
    console.log('File content length:', content.length);

    // Updated regex to match the export after imports
    const locationsMatch = content.match(/export\s+const\s+locations:\s*Location\[\]\s*=\s*(\[[\s\S]*?\n\];)/m);
    
    if (!locationsMatch) {
      console.error('Could not match locations array. Content preview:');
      console.error(content.substring(0, 500));
      throw new Error('Could not find locations array in locations.ts');
    }

    const arrayContent = locationsMatch[1];
    console.log('Found locations array, processing...');

    // Evaluate the array content (be careful with this in production)
    const locations = eval(arrayContent);

    // Process each location
    for (const location of locations) {
      if (typeof location.image === 'string' && location.image.startsWith('/images/')) {
        try {
          const imagePath = path.join(process.cwd(), 'public', location.image);
          console.log(`Processing image: ${imagePath}`);
          
          // Check if file exists
          if (!await fs.access(imagePath).then(() => true).catch(() => false)) {
            console.warn(`Warning: Image not found: ${imagePath}`);
            continue;
          }
          
          const blurDataURL = await generateBlurDataURL(imagePath);
          console.log(`Generated blur data for: ${location.name}`);
          
          // Update content with blur data
          const locationRegex = new RegExp(`{[^}]*"${location.name}"[^}]*}`, 'g');
          const locationMatch = content.match(locationRegex);
          
          if (locationMatch) {
            const oldLocation = locationMatch[0];
            const newLocation = oldLocation.replace(
              /(}\s*$)/,
              `,\n    blurDataURL: "${blurDataURL}"\n  }`
            );
            content = content.replace(oldLocation, newLocation);
          }
        } catch (error) {
          console.error(`Error processing ${location.name}:`, error);
        }
      }
    }

    // Write updated content back to file
    await fs.writeFile(locationsPath, content, 'utf8');
    console.log('Successfully updated locations.ts with blur data URLs');
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

updateLocationsWithBlur().catch(console.error);