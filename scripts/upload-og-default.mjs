// scripts/upload-og-default.mjs
// Run once: node scripts/upload-og-default.mjs
// This uploads public/og-default.png to Cloudinary and prints the permanent URL.

import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'public', 'og-default.png');

const result = await cloudinary.uploader.upload(filePath, {
    public_id: 'bucketurl-og-default',
    overwrite: true,
    resource_type: 'image',
});

console.log('\n✅ Uploaded successfully!');
console.log('Cloudinary URL:', result.secure_url);
console.log('\nNow open lib/og-default-url.js and replace the placeholder with:');
console.log(`\nexport const OG_DEFAULT_IMAGE = '${result.secure_url}';\n`);
