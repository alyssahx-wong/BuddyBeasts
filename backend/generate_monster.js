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

  // Flood-fill from edges to remove only the background white,
  // preserving white pixels inside the character (e.g. belly, eyes)
  const isNearWhite = (idx) =>
    data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240;

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed the queue with all near-white edge pixels
  for (let x = 0; x < width; x++) {
    if (isNearWhite(x * 4)) queue.push(x);
    const bottom = (height - 1) * width + x;
    if (isNearWhite(bottom * 4)) queue.push(bottom);
  }
  for (let y = 1; y < height - 1; y++) {
    const left = y * width;
    if (isNearWhite(left * 4)) queue.push(left);
    const right = y * width + (width - 1);
    if (isNearWhite(right * 4)) queue.push(right);
  }

  // BFS flood fill — only spreads through connected near-white pixels
  for (const seed of queue) visited[seed] = 1;
  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const x = pos % width;
    const y = (pos - x) / width;
    data[pos * 4 + 3] = 0; // make transparent

    const neighbors = [
      y > 0 ? pos - width : -1,
      y < height - 1 ? pos + width : -1,
      x > 0 ? pos - 1 : -1,
      x < width - 1 ? pos + 1 : -1,
    ];
    for (const n of neighbors) {
      if (n >= 0 && !visited[n] && isNearWhite(n * 4)) {
        visited[n] = 1;
        queue.push(n);
      }
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
    modelId: 'flux1-schnell-fp8', // flux1-schnell-fp8
    positivePrompt: `full body standing character, full body from head to feet, pixel art, 8-bit retro game sprite, standing on ground, visible legs and feet, centered in frame, front view, ${prompt}, flat colors, clean edges, solid white background, single character, small character in large frame, wide margin around character, fully visible character, wide shot, full figure with legs and feet on ground`,
    negativePrompt: '',
    steps: 8,
    guidance: 3.5,
    numberOfMedia: 1,
    sizePreset: 'square',
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
