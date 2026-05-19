/**
 * Script untuk generate Android App Icons dari gambar sumber.
 * 
 * Cara pakai:
 *   1. npm install sharp (jika belum)
 *   2. node scripts/generate_icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Path ke gambar sumber (icon yang sudah di-generate)
const SOURCE_ICON = path.join(__dirname, '..', 'app_icon_source.png');
const RES_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Ukuran ikon Android standar
const ICON_SIZES = {
  'mipmap-mdpi': { launcher: 48, foreground: 108 },
  'mipmap-hdpi': { launcher: 72, foreground: 162 },
  'mipmap-xhdpi': { launcher: 96, foreground: 216 },
  'mipmap-xxhdpi': { launcher: 144, foreground: 324 },
  'mipmap-xxxhdpi': { launcher: 192, foreground: 432 },
};

async function generateIcons() {
  // Cek apakah file sumber ada
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`\n❌ File sumber tidak ditemukan: ${SOURCE_ICON}`);
    console.error(`\n📋 Langkah:`);
    console.error(`   1. Copy/rename gambar ikon Anda menjadi "app_icon_source.png"`);
    console.error(`   2. Letakkan di root project (d:\\zDATA ANDRE\\5 Pelanggan Wifi\\SAFA-NET\\)`);
    console.error(`   3. Jalankan ulang: node scripts/generate_icons.js`);
    process.exit(1);
  }

  console.log('🎨 Generating Android App Icons...\n');

  for (const [folder, sizes] of Object.entries(ICON_SIZES)) {
    const dirPath = path.join(RES_DIR, folder);

    // ic_launcher.png
    await sharp(SOURCE_ICON)
      .resize(sizes.launcher, sizes.launcher, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(dirPath, 'ic_launcher.png'));
    console.log(`  ✅ ${folder}/ic_launcher.png (${sizes.launcher}x${sizes.launcher})`);

    // ic_launcher_round.png
    await sharp(SOURCE_ICON)
      .resize(sizes.launcher, sizes.launcher, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_round.png'));
    console.log(`  ✅ ${folder}/ic_launcher_round.png (${sizes.launcher}x${sizes.launcher})`);

    // ic_launcher_foreground.png (untuk adaptive icon)
    await sharp(SOURCE_ICON)
      .resize(sizes.foreground, sizes.foreground, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(dirPath, 'ic_launcher_foreground.png'));
    console.log(`  ✅ ${folder}/ic_launcher_foreground.png (${sizes.foreground}x${sizes.foreground})`);
  }

  console.log('\n🎉 Semua ikon berhasil di-generate!');
  console.log('\n📋 Langkah selanjutnya:');
  console.log('   1. npm run build');
  console.log('   2. npx cap sync');
  console.log('   3. Buka Android Studio → Build → Build APK');
}

generateIcons().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
