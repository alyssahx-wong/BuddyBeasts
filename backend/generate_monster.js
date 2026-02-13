import { SogniClient } from '@sogni-ai/sogni-client';
import dotenv from 'dotenv';
import fs from 'fs';

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

async function run() {
  const sogni = await SogniClient.createInstance({
    appId: process.env.SOGNI_APP_ID,
    network: 'fast',
  });

  await sogni.account.login(process.env.SOGNI_USER, process.env.SOGNI_PASS);
  await sogni.projects.waitForModels();

  const project = await sogni.projects.create({
    type: 'image',
    modelId: 'flux1-schnell-fp8', // flux1-schnell-fp8 coreml-albedobaseXL_v31Large
    positivePrompt: `(full body standing character:1.5), wide shot, head to feet visible, character standing on a flat horizontal white floor, ${prompt}, pixel art, 8-bit style, centered, small character with wide margins`,    negativePrompt: '',
    steps: 30,
    guidance: 3.5,
    numberOfMedia: 1,
    sizePreset: 'square',
    tokenType: 'spark',
  });

  const imageUrls = await project.waitForCompletion();
  const imageUrl = imageUrls[0];

  const response = await fetch(imageUrl);
  const originalBuffer = Buffer.from(await response.arrayBuffer());

  // Output raw image as base64 — background removal handled by Python (rembg)
  process.stdout.write(originalBuffer.toString('base64'));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  });
