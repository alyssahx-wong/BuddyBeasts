import { SogniClient } from '@sogni-ai/sogni-client';
import dotenv from 'dotenv';
import fs from 'fs';

const envPath = '../.env.local';
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function run() {
  const sogni = await SogniClient.createInstance({
    appId: process.env.SOGNI_APP_ID,
    network: 'fast',
  });

  await sogni.account.login(process.env.SOGNI_USER, process.env.SOGNI_PASS);
  const models = await sogni.projects.waitForModels();

  console.log('\n=== Available Image Models ===\n');
  for (const m of models) {
    console.log(`  ID: ${m.id}`);
    console.log(`  Name: ${m.name || '(no name)'}`);
    console.log(`  Workers: ${m.workerCount || 0}`);
    console.log('');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
