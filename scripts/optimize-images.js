const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'public/images/images-raw';
const outputDir = 'public/images/locations';

async function optimizeImages() {
  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const image = sharp(path.join(inputDir, file));
    
    // Generate different sizes
    await image
      .resize(800, 600)
      .webp({ quality: 75 })
      .toFile(path.join(outputDir, `${path.parse(file).name}.webp`));
      
    // Generate blur placeholder
    const blurPlaceholder = await image
      .resize(20)
      .blur()
      .toBuffer();
      
    // Save blur data URL
    const blurDataURL = `data:image/jpeg;base64,${blurPlaceholder.toString('base64')}`;
    console.log(`${file}: ${blurDataURL}`);
  }
}

optimizeImages();