const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceIcon = path.join(__dirname, '../public/branding/master-logo.jpg');
const androidResPath = path.join(__dirname, '../../nexus-xenon-android/app/src/main/res');
const rootAndroidPath = path.join(__dirname, '../../nexus-xenon-android');

const sizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

async function updateIcons() {
  try {
    for (const [density, size] of Object.entries(sizes)) {
      const mipmapFolder = path.join(androidResPath, `mipmap-${density}`);
      if (fs.existsSync(mipmapFolder)) {
        console.log(`Updating icons in ${mipmapFolder} (${size}x${size})...`);
        
        // ic_launcher.png
        await sharp(sourceIcon)
          .resize(size, size, { fit: 'cover' })
          .toFormat('png')
          .toFile(path.join(mipmapFolder, 'ic_launcher.png'));
          
        // ic_maskable.png
        await sharp(sourceIcon)
          .resize(size, size, { fit: 'cover' })
          .toFormat('png')
          .toFile(path.join(mipmapFolder, 'ic_maskable.png'));
      }
    }

    // Update store_icon.png (512x512)
    console.log(`Updating store_icon.png (512x512)...`);
    await sharp(sourceIcon)
      .resize(512, 512, { fit: 'cover' })
      .toFormat('png')
      .toFile(path.join(rootAndroidPath, 'store_icon.png'));

    console.log('✅ Successfully updated all Android APK launcher icons with Picture 1 (NX Nexus Xenon master logo).');
  } catch (error) {
    console.error('Error updating icons:', error);
    process.exit(1);
  }
}

updateIcons();
