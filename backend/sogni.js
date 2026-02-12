import { SogniClient } from '@sogni-ai/sogni-client';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';
import sharp from 'sharp'; // 1. Import sharp

dotenv.config({ path: '../.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function removeBackground(inputBuffer) {
  // 1. Get the raw pixel data (RGBA) from sharp
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 2. Loop through the pixels (every 4 bytes is [R, G, B, A])
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if the pixel is "White" (or very close to it)
    // We use > 240 to catch slight off-whites created by the AI
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Set Alpha to 0 (Transparent)
    }
  }

  // 3. Convert the modified raw data back into a PNG
  return await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toBuffer();
}
async function run() {
  try {
    const sogni = await SogniClient.createInstance({
      appId: process.env.SOGNI_APP_ID,
      network: 'fast'
    });

    await sogni.account.login(process.env.SOGNI_USER, process.env.SOGNI_PASS);
    await sogni.projects.waitForModels();

    const description = await ask("Enter a description for your pixel character: ");
    console.log("Generating...");

    const project = await sogni.projects.create({
      type: 'image',
      modelId: 'flux1-schnell-fp8',
      // Note: Flux usually defaults to white backgrounds regardless of "transparent" keyword
      positivePrompt: `low-res pixel art, 8-bit style, 32x32px scale, character sprite sheet, front view only, ${description}, flat colors, clean edges, solid white background`,
      negativePrompt: 'blurry, gradient, shadow, 3d, digital painting, anti-aliasing',
      steps: 8, // Schnell is optimized for 4-8 steps
      guidance: 3.5,
      numberOfMedia: 1,
      sizePreset: 'square',
      tokenType: 'spark'
    });

    const imageUrls = await project.waitForCompletion();
    const imageUrl = imageUrls[0];

    // 6. Download
    const response = await fetch(imageUrl);
    const originalBuffer = Buffer.from(await response.arrayBuffer());

    // 7. Post-Process: Remove Background
    console.log("Removing background...");
    const processedBuffer = await removeBackground(originalBuffer);

    const filename = `character_${Date.now()}.png`;
    fs.writeFileSync(filename, processedBuffer);
    console.log(`\nSuccess! Clean character saved as: ${filename}`);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

run();