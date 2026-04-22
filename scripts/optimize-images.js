const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'public/images/images-raw';
const outputDir = 'public/images/locations';

async function optimizeImages() {
  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputName = path.parse(file).name;
    const outputPath = path.join(outputDir, `${outputName}.webp`);
    
    // Skip if already converted
    if (fs.existsSync(outputPath)) {
      console.log(`⊘ ${file}: already converted, skipping`);
      continue;
    }
    
    // Convert to WebP with higher quality for better clarity
    await sharp(inputPath)
      .resize(1200, 800, { fit: 'cover' })
      .webp({ quality: 100 })
      .toFile(outputPath);
    
    console.log(`✓ ${file}: converted to WebP`);
  }
}

optimizeImages();