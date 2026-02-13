import { SogniClient } from '@sogni-ai/sogni-client';
import dotenv from 'dotenv';
import fs from 'fs';
import sharp from 'sharp';

// Only load .env.local if it exists (not needed inside Docker where env vars are injected)
const envPath = '../.env.local';
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prompt = process.argv[2];
if (!prompt) {
  process.stderr.write('Usage: node generate_monster.js "<prompt>"\n');
  process.exit(1);
}

async function removeBackgroundAndCrop(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Only remove pixels that are very close to pure white (>250 all channels)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 250 && g > 250 && b > 250) {
      data[i + 3] = 0;
    }
  }

  // Find bounding box of non-transparent pixels to auto-crop
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Add small padding around the crop
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  return await sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();
}

async function run() {
  const sogni = await SogniClient.createInstance({
    appId: process.env.SOGNI_APP_ID,
    network: 'fast',
  });

  await sogni.account.login(process.env.SOGNI_USER, process.env.SOGNI_PASS);
  await sogni.projects.waitForModels();

  const project = await sogni.projects.create({
    type: 'image',
    modelId: 'flux1-schnell-fp8',
    positivePrompt: `pixel art, 8-bit retro game sprite, full body from head to feet, standing on ground, visible legs and feet, centered in frame, front view, ${prompt}, flat colors, clean edges, solid white background, single character, small character in large frame, wide margin around character`,
    negativePrompt: 'blurry, gradient, shadow, 3d, digital painting, anti-aliasing, cropped, cut off, partial, half body, portrait only, close-up, headshot, bust, zoomed in, no legs, no feet, floating',
    steps: 8,
    guidance: 3.5,
    numberOfMedia: 1,
    sizePreset: 'portrait_7_9',
    tokenType: 'spark',
  });

  const imageUrls = await project.waitForCompletion();
  const imageUrl = imageUrls[0];

  const response = await fetch(imageUrl);
  const originalBuffer = Buffer.from(await response.arrayBuffer());

  const processedBuffer = await removeBackgroundAndCrop(originalBuffer);

  // Output base64 PNG to stdout for the Python caller
  process.stdout.write(processedBuffer.toString('base64'));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  });
