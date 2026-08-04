// Gera as 2 ilustrações landscape do admin-discovery via fal.ai Flux Pro.
// Reusa mesma ref de estilo do quiz (flat vector, fills sólidos, personagens elongados).
//
// Uso:
//   node scripts/generate-admin-discovery-illustrations.js
//   node scripts/generate-admin-discovery-illustrations.js --voluntario
//   node scripts/generate-admin-discovery-illustrations.js --igreja
//   node scripts/generate-admin-discovery-illustrations.js --publish
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('FAL_KEY não encontrada em .env');
  process.exit(1);
}

const OUT_DIR   = path.join(__dirname, '..', 'assets', 'images', 'admin-discovery-v1');
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const STYLE_REF_PATH = 'D:/Downloads/Diakonia/pergunta 5.jpeg';

const STYLE_PREFIX =
  'Flat vector illustration, solid color fills only, zero shading zero gradient, clean SVG style. ' +
  'Adult characters with full body, elongated proportions, simple flat faces. ' +
  'Wide cinematic landscape composition, characters spread across full width. ';

const NEGATIVE_PROMPT =
  'gradient, shading, shadow, lighting effect, glow, 3d render, depth, volume, cell shading, ' +
  'photorealistic, photography, text, letters, words, numbers, watermark, label, sign, ' +
  'blurry, noise, grain, extra limbs, deformed anatomy, bad anatomy, cropped, cut off, logo, ' +
  'portrait orientation, vertical composition, square composition';

const ILLUSTRATIONS = [
  {
    key: 'voluntario',
    publishAs: 'admin-discovery-voluntario.jpeg',
    outputExt: 'jpeg',
    width: 1024,
    height: 512,
    prompt:
      'Five joyful Brazilian church volunteers standing together in a wide group, ' +
      'two adults with arms raised up in praise and worship, others smiling with open arms, ' +
      'warm community gathering, church background with gothic arched windows and cross on wall, ' +
      'blue peach cream palette, vibrant and welcoming atmosphere. ' +
      'Characters spread horizontally across full frame width.',
  },
  {
    key: 'igreja',
    publishAs: 'admin-discovery-igreja.jpeg',
    outputExt: 'jpeg',
    width: 1024,
    height: 512,
    prompt:
      'Confident Brazilian church pastor leader standing at center, ' +
      'two organized team members flanking them on each side, ' +
      'church building exterior silhouette behind them with cross at top, ' +
      'rays of light emanating from cross, purple and warm cream palette, ' +
      'leadership and vision theme, ministry coordination scene. ' +
      'Characters spread horizontally across full frame width.',
  },
];

// ---------------------------------------------------------------------------

async function uploadStyleRef() {
  const bytes = fs.readFileSync(STYLE_REF_PATH);
  const initRes = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: 'ref.jpeg', content_type: 'image/jpeg' }),
  });
  const { upload_url, file_url } = await initRes.json();
  await fetch(upload_url, { method: 'PUT', body: bytes, headers: { 'Content-Type': 'image/jpeg' } });
  console.log('✓ Style ref uploaded:', file_url);
  return file_url;
}

async function generateOne(item, styleRefUrl) {
  const outPath = path.join(OUT_DIR, `${item.key}.${item.outputExt}`);
  console.log(`\n→ Gerando: ${item.key} (${item.width}×${item.height})…`);

  const body = {
    prompt: STYLE_PREFIX + item.prompt,
    negative_prompt: NEGATIVE_PROMPT,
    image_url: styleRefUrl,
    image_prompt_strength: 0.55,
    image_size: { width: item.width, height: item.height },
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    output_format: item.outputExt,
    enable_safety_checker: false,
  };

  const res = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.images?.[0]?.url) {
    console.error('Erro fal.ai:', JSON.stringify(data, null, 2));
    return;
  }

  const imgRes = await fetch(data.images[0].url);
  const imgBytes = Buffer.from(await imgRes.arrayBuffer());
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, imgBytes);
  console.log(`✓ Salvo: ${outPath}`);
  return outPath;
}

async function main() {
  const args = process.argv.slice(2);
  const doPublish = args.includes('--publish');
  const doAll = !args.filter(a => a.startsWith('--') && a !== '--publish').length;

  const targets = ILLUSTRATIONS.filter(item => {
    if (doAll) return true;
    return args.includes(`--${item.key}`);
  });

  if (!targets.length) {
    console.log('Nenhum target. Use --voluntario, --igreja, ou omita para gerar tudo.');
    return;
  }

  const styleRefUrl = await uploadStyleRef();

  for (const item of targets) {
    await generateOne(item, styleRefUrl);
  }

  if (doPublish) {
    for (const item of targets) {
      const src = path.join(OUT_DIR, `${item.key}.${item.outputExt}`);
      const dst = path.join(ASSETS_DIR, item.publishAs);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`✓ Publicado: ${item.publishAs}`);
      }
    }
  }

  console.log('\nConcluído.');
}

main().catch(err => { console.error(err); process.exit(1); });
