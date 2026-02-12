import { SogniClient } from '@sogni-ai/sogni-client';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config({ path: '../.env.local' });

const prompt = process.argv[2];
if (!prompt) {
  process.stderr.write('Usage: node generate_monster.js "<prompt>"\n');
  process.exit(1);
}

async function removeBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  return await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
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
    positivePrompt: `low-res pixel art, 8-bit style, 32x32px scale, character sprite sheet, front view only, ${prompt}, flat colors, clean edges, solid white background`,
    negativePrompt: 'blurry, gradient, shadow, 3d, digital painting, anti-aliasing',
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

  const processedBuffer = await removeBackground(originalBuffer);

  // Output base64 PNG to stdout for the Python caller
  process.stdout.write(processedBuffer.toString('base64'));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  });
