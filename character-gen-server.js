import express from 'express';
import { SogniClient } from '@sogni-ai/sogni-client';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

// Serve generated character images
app.use('/generated', express.static(path.join(__dirname, 'public', 'monsters', 'generated')));

// Ensure output directory exists
const outputDir = path.join(__dirname, 'public', 'monsters', 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
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

    // Remove white/near-white background
    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0;
    }
  }

  return await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  // Check if Sogni credentials exist
  const hasSogni =
    process.env.SOGNI_APP_ID && process.env.SOGNI_USER && process.env.SOGNI_PASS;

  if (!hasSogni) {
    // Fallback: return a random pre-existing monster image
    const fallbackId = Math.floor(Math.random() * 18) + 1;
    return res.json({
      imageUrl: `/src/monster_imgs/${fallbackId}.png`,
      fallback: true,
      message: 'Sogni AI credentials not configured. Using pre-made character.',
    });
  }

  try {
    console.log('Connecting to Sogni AI...');
    const sogni = await SogniClient.createInstance({
      appId: process.env.SOGNI_APP_ID,
      network: 'fast',
    });

    await sogni.account.login(process.env.SOGNI_USER, process.env.SOGNI_PASS);
    await sogni.projects.waitForModels();

    console.log('Generating character with prompt:', prompt);

    const project = await sogni.projects.create({
      type: 'image',
      modelId: 'flux1-schnell-fp8',
      positivePrompt: prompt,
      negativePrompt:
        'blurry, gradient, shadow, 3d, digital painting, anti-aliasing, realistic, photographic',
      steps: 8,
      guidance: 3.5,
      numberOfMedia: 1,
      sizePreset: 'square',
      tokenType: 'spark',
    });

    const imageUrls = await project.waitForCompletion();
    const imageUrl = imageUrls[0];

    // Download the image
    const response = await fetch(imageUrl);
    const originalBuffer = Buffer.from(await response.arrayBuffer());

    // Remove background
    console.log('Removing background...');
    const processedBuffer = await removeBackground(originalBuffer);

    // Save to public/monsters/generated/
    const filename = `char_${Date.now()}.png`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, processedBuffer);

    console.log(`Character saved: ${filepath}`);

    res.json({
      imageUrl: `/generated/${filename}`,
      fallback: false,
      message: 'Character generated successfully!',
    });
  } catch (error) {
    console.error('Generation error:', error.message);

    // Fallback on error
    const fallbackId = Math.floor(Math.random() * 18) + 1;
    res.json({
      imageUrl: `/src/monster_imgs/${fallbackId}.png`,
      fallback: true,
      message: `AI generation failed: ${error.message}. Using pre-made character.`,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.CHARACTER_GEN_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Character generation service running on http://localhost:${PORT}`);
});
