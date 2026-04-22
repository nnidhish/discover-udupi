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
    
    // Convert to WebP
    await sharp(inputPath)
      .resize(800, 600)
      .webp({ quality: 75 })
      .toFile(outputPath);
    
    // Generate blur placeholder
    const blurPlaceholder = await sharp(inputPath)
      .resize(20)
      .blur()
      .toBuffer();
    
    const blurDataURL = `data:image/jpeg;base64,${blurPlaceholder.toString('base64')}`;
    console.log(`✓ ${file}: ${blurDataURL}`);
  }
}

optimizeImages();