// Gera as 17 ilustrações do quiz-vendas via fal.ai (Flux Pro).
// Requer FAL_KEY no .env (obter em fal.ai/dashboard/keys).
//
// Uso:
//   node scripts/generate-quiz-illustrations.js --all                      → gera todas as 17
//   node scripts/generate-quiz-illustrations.js --perguntas                → gera as 6 perguntas
//   node scripts/generate-quiz-illustrations.js --perguntas pergunta-1     → gera só uma pergunta
//   node scripts/generate-quiz-illustrations.js --resultados               → gera os 3 resultados
//   node scripts/generate-quiz-illustrations.js --capas                    → gera as 3 capas
//   node scripts/generate-quiz-illustrations.js --capas sobrecarregado     → gera só uma capa
//   node scripts/generate-quiz-illustrations.js --funcionalidades          → gera as 5 funcionalidades
//   node scripts/generate-quiz-illustrations.js --publish                  → copia v2/ → assets/images/
//   node scripts/generate-quiz-illustrations.js --all --publish            → gera + publica tudo
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('FAL_KEY não encontrada em .env — obter em fal.ai/dashboard/keys');
  process.exit(1);
}

let OUT_DIR = path.join(__dirname, '..', 'assets', 'images', 'quiz-v2');
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const STYLE_REF_PATH = 'D:/Downloads/Diakonia/pergunta 5.jpeg';

// Estilo unificado: flat vector puro, fills sólidos, paleta peach+azul+laranja, zero shading.
let STYLE_PREFIX =
  'Flat vector illustration, solid color fills only, zero shading zero gradient, clean SVG style. ' +
  'Warm peach cream background, blue and orange accent colors, ' +
  'church interior with gothic arched windows, pendant blue lamp, cross on wall, blue potted plants. ' +
  'Adult characters with full body, elongated proportions, simple flat faces. ';

let NEGATIVE_PROMPT =
  'gradient, shading, shadow, lighting effect, glow, 3d render, depth, volume, cell shading, ' +
  'photorealistic, photography, text, letters, words, numbers, watermark, label, sign, ' +
  'blurry, noise, grain, extra limbs, deformed anatomy, bad anatomy, cropped, cut off, logo';

const STYLE_PREFIX_WASHED =
  'Flat vector illustration, solid color fills only, zero shading zero gradient, clean SVG style. ' +
  'Soft muted desaturated pastel palette — washed out low-saturation tones, dusty blush cream, muted dusty blue, pale sage, soft terracotta — no vivid or saturated colors. ' +
  'Church interior with gothic arched windows, pendant lamp, potted plants. ' +
  'Adult characters with full body, elongated proportions, simple flat faces. ';

const NEGATIVE_PROMPT_WASHED =
  'gradient, shading, shadow, lighting effect, glow, 3d render, depth, volume, cell shading, ' +
  'photorealistic, photography, text, letters, words, numbers, watermark, label, sign, ' +
  'blurry, noise, grain, extra limbs, deformed anatomy, bad anatomy, cropped, cut off, logo, ' +
  'saturated colors, vivid colors, bold colors, high contrast colors, neon, bright orange, bright blue';

// ---------------------------------------------------------------------------
// PERGUNTAS — 6 imagens, landscape 1024×768, salvas como .jpeg
// ---------------------------------------------------------------------------
const PERGUNTAS = [
  {
    key: 'pergunta-1',
    publishAs: 'quiz-pergunta-1.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church hall interior: a smiling cartoon leader standing at the front of the room, ' +
      'gesturing toward a large bulletin board on the wall that has pinned paper cards ' +
      'with small flat icons (heart, group of people, open book, hands in prayer), ' +
      'two or three attentive cartoon people seated in chairs facing the leader, ' +
      'one person holds a clipboard, ' +
      'gothic pointed arch window center background with warm light, white cross on side wall, ' +
      'pendant blue lights hanging from ceiling, blue potted plant in corner, warm peach interior.',
  },
  {
    key: 'pergunta-2',
    publishAs: 'quiz-pergunta-2.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church interior: a cheerful group of four cartoon volunteers standing close together, ' +
      'simple rounded cartoon faces with soft shading, all smiling warmly, wearing blue and neutral clothing, ' +
      'each person has a small white rectangular name-badge sticker on their shirt, varied hairstyles, ' +
      'soft warm gradient shading on the peach salmon walls giving depth and volume to the scene, ' +
      'gothic pointed arch window center background with white cross inside it, white cross symbol on side wall, ' +
      'two pendant blue ceiling lights, blue potted plants in corners, ' +
      'warm peach salmon interior with characteristic cartoon illustration depth and shading.',
  },
  {
    key: 'pergunta-3',
    publishAs: 'quiz-pergunta-3.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church office interior: two cartoon people collaborating at a large whiteboard schedule, ' +
      'one person pointing at the calendar grid while the other holds a pen and a clipboard, ' +
      'the whiteboard shows a monthly grid with colored sticky-note squares in blue and orange, ' +
      'a wooden desk with a stack of papers and a small clock in the foreground, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'pergunta-4',
    publishAs: 'quiz-pergunta-4.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Casual everyday scene: a surprised adult cartoon woman sitting on a couch at home, ' +
      'simple rounded cartoon face, wide surprised eyes looking at her smartphone, ' +
      'blue casual top and jeans, ' +
      'a large floating chat message speech bubble beside the phone showing a WhatsApp-style notification with a small bell icon and three short horizontal lines representing message text, ' +
      'warm cozy home interior background, a window with soft light, a small plant, ' +
      'flat vector illustration style, warm peach and blue tones.',
  },
  {
    key: 'pergunta-5',
    publishAs: 'quiz-pergunta-5.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church office interior: a frustrated cartoon person sitting at a desk covered in loose papers and open notebooks, ' +
      'one hand typing on a smartphone, small floating speech bubble icons with dots around the phone, ' +
      'a messy stack of documents and a pencil cup on the desk, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'pergunta-6',
    publishAs: 'quiz-pergunta-6.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Peaceful church interior: a relaxed cartoon person sitting comfortably in a chair, ' +
      'eyes gently closed with a serene content smile, hands resting calmly in their lap, ' +
      'a small cartoon child playing on the floor nearby, an open bible beside them, ' +
      'warm golden light streaming through a gothic pointed arch window, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
];

// ---------------------------------------------------------------------------
// RESULTADOS — 3 imagens, landscape 1024×768, salvas como .jpeg
// ---------------------------------------------------------------------------
const RESULTADOS = [
  {
    key: 'resultado-so-falta-organizar',
    publishAs: 'quiz-resultado-so-falta-organizar.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church office interior: a stressed cartoon woman sitting at a desk, ' +
      'both hands covering her face in exhaustion, slumped tired posture, ' +
      'desk surface covered with scattered papers, open notebooks, and a messy stack of folders, ' +
      'two small notification speech bubble icons floating near her, ' +
      'a cup of pens tipped over on the desk, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'resultado-no-limite',
    publishAs: 'quiz-resultado-no-limite.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church office interior: a frustrated cartoon woman sitting at a desk, ' +
      'one hand pressing a buzzing smartphone to her ear while the other frantically scribbles on a paper schedule covered in crossed-out corrections and rewrites, ' +
      'the paper schedule is a mess of erased lines and new entries, barely legible, ' +
      'tense overwhelmed expression of someone barely keeping up — at their limit but still desperately trying, ' +
      'phone screen showing dozens of notification badges, a few notification bubbles floating near her head, ' +
      'gothic pointed arch window in background, pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'resultado-sobrecarregado',
    publishAs: 'quiz-resultado-sobrecarregado.jpeg',
    outputExt: 'jpeg',
    portrait: false,
    prompt:
      'Church interior: a cartoon man standing frozen at the center of a spinning vortex, ' +
      'both hands gripping his hair in disbelief, wide shocked desperate eyes, mouth open, ' +
      'a circular tornado-like swirl of floating smartphones, paper schedules, calendar pages, and notification screens ' +
      'spinning all around him in a dramatic spiral vortex — the chaos orbits him like a whirlwind, ' +
      'he is paralyzed with overwhelm at the eye of the digital tornado, ' +
      'gothic pointed arch window barely visible through the chaos, pendant blue lights, blue potted plant, warm peach interior.',
  },
];

// ---------------------------------------------------------------------------
// CAPAS — 3 imagens, portrait 768×1024, salvas como .png
// ---------------------------------------------------------------------------
const CAPAS = [
  {
    key: 'capa-so-falta-organizar',
    publishAs: 'quiz-capa-so-falta-organizar.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Church interior: a calm smiling cartoon woman sitting in a comfortable armchair, ' +
      'right hand placed gently over her heart, warm serene smile, posture relaxed, ' +
      'papers and open notebooks scattered on the armrests and floor immediately around her, ' +
      'two small chat notification speech bubbles drifting very close to her — almost touching her shoulders — surrounding her immediate personal space, ' +
      'she is at peace inside the small chaos that encircles her, ' +
      'gothic pointed arch windows in the soft background, pendant blue lights hanging from ceiling, blue potted plant, warm peach interior.',
  },
  {
    key: 'capa-no-limite',
    publishAs: 'quiz-capa-no-limite.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Church interior: a calm smiling cartoon woman standing in the foreground center, ' +
      'right hand placed flat on her chest over her heart, warm relieved smile, eyes gently closed, ' +
      'posture open and relaxed, ' +
      'background shows several floating notification alert cards drifting in the air around her, ' +
      'each card has red or orange-yellow warning colors — red exclamation mark icons, orange alert badges, yellow warning triangles — conveying urgency and problems, ' +
      'medium visual intensity, cards at different heights and angles, ' +
      'gothic pointed arch windows in the background, pendant blue lights hanging from ceiling, blue potted plant, warm peach interior.',
  },
  {
    key: 'capa-sobrecarregado',
    publishAs: 'quiz-capa-sobrecarregado.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Church interior: a calm cartoon woman standing at the very center with eyes closed and both hands pressed to her chest, deep serene peaceful smile, ' +
      'she is the eye of a storm: dense swirling notification alert cards and message screens completely envelop her body from all sides — floor to ceiling — ' +
      'the cards are vivid red and orange-yellow alert colors — red exclamation icons, orange warning badges, yellow danger triangles — filling every corner of the frame with urgency and alarm, ' +
      'the chaos is very close to her and intense, she alone is still and peaceful within the colorful danger storm, ' +
      'church arched window barely visible through the intense alarm-colored storm surrounding her, pendant blue lights, blue potted plant, warm peach interior.',
  },
];

// ---------------------------------------------------------------------------
// FUNCIONALIDADES — 5 imagens, landscape 1024×768, salvas como .png
// ---------------------------------------------------------------------------
const FUNCIONALIDADES = [
  {
    key: 'funcionalidade-escala-automatica',
    publishAs: 'quiz-funcionalidade-escala-automatica.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Peaceful resolved scene, church interior: a calm smiling cartoon woman holding a large tablet, ' +
      'tablet screen clearly showing a weekly schedule grid with rows of names and time columns, ' +
      'blue checkmark icons auto-filling each row of the schedule grid as if being generated automatically, ' +
      'a floating gear icon and sparkle stars above the tablet indicating automatic generation, ' +
      'serene relieved expression showing the schedule created itself without effort, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'funcionalidade-substituicao-facil',
    publishAs: 'quiz-funcionalidade-substituicao-facil.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Peaceful resolved scene, church interior: two calm smiling cartoon adults facing each other, ' +
      'each holding their own clipboard with schedule, ' +
      'a large prominent double-headed horizontal swap arrow icon between them showing the volunteer exchange, ' +
      'both with relieved happy expressions showing the substitution is seamlessly resolved, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'funcionalidade-lembrete-automatico',
    publishAs: 'quiz-funcionalidade-lembrete-automatico.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Peaceful resolved scene, cozy living room at home, no church elements: a calm smiling cartoon person relaxing on a sofa, ' +
      'casually looking at their smartphone, ' +
      'phone screen showing a large clear notification banner with a bell icon and a reminder message about an upcoming event, ' +
      'a subtle glowing outline around the notification banner to make it obviously the focal point, ' +
      'posture relaxed and at ease as if being reminded automatically without any effort, ' +
      'warm peach interior, potted plant, soft cushions, big window with daylight.',
  },
  {
    key: 'funcionalidade-disponibilidade',
    publishAs: 'quiz-funcionalidade-disponibilidade.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Peaceful resolved scene, church interior: a relaxed smiling cartoon person tapping their smartphone screen effortlessly, ' +
      'phone showing a clean calendar grid with blue dots for available days and gray for unavailable, ' +
      'calm confident expression showing how simple and quick it is, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'funcionalidade-repertorio',
    publishAs: 'quiz-funcionalidade-repertorio.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Peaceful resolved scene, church interior: a calm smiling cartoon musician holding a smartphone, ' +
      'phone screen showing an organized music playlist with song rows and musical note icons, ' +
      'relaxed confident expression as everything is organized and ready, ' +
      'a small floating musical note icon near the phone, ' +
      'gothic pointed arch window in background, white cross on wall, ' +
      'pendant blue lights, blue potted plant, warm peach interior.',
  },
  {
    key: 'funcionalidade-conclusao',
    publishAs: 'quiz-funcionalidade-conclusao.png',
    outputExt: 'png',
    portrait: true,
    prompt:
      'Peaceful resolved scene, church interior: a calm smiling cartoon leader standing confidently at center frame, ' +
      'holding a smartphone in one hand with the screen facing outward, ' +
      'screen clearly showing a completed weekly schedule grid with a blue checkmark in every cell — fully booked, zero gaps, ' +
      'the other hand open at their side in a relaxed open gesture, ' +
      'expression of deep quiet relief and satisfaction — everything is handled, nothing left to worry about, ' +
      'three small sparkle star icons floating gently around the phone suggesting automatic generation, ' +
      'desk in background with neatly stacked papers and a closed laptop — organized, not chaotic, ' +
      'gothic pointed arch windows in the soft background, pendant lamp, blue potted plant, warm muted interior.',
  },
];

// ---------------------------------------------------------------------------
// Infraestrutura
// ---------------------------------------------------------------------------
let styleRefUrl = null;

async function uploadStyleRef() {
  if (styleRefUrl) return styleRefUrl;
  console.log('  Subindo referência de estilo para fal.ai storage...');
  const fileBytes = fs.readFileSync(STYLE_REF_PATH);

  const initRes = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: 'ref-flat.jpeg', content_type: 'image/jpeg' }),
  });
  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`fal.ai upload initiate ${initRes.status}: ${errText}`);
  }
  const { upload_url, file_url } = await initRes.json();

  const putRes = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(fileBytes.length) },
    body: fileBytes,
  });
  if (!putRes.ok) throw new Error(`fal.ai upload PUT ${putRes.status}`);

  styleRefUrl = file_url;
  console.log(`  Referência: ${styleRefUrl}`);
  return styleRefUrl;
}

async function generateOne(item) {
  const refUrl = await uploadStyleRef();
  const outputFormat = item.outputExt === 'jpeg' ? 'jpeg' : 'png';
  const width = item.portrait ? 768 : 1024;
  const height = item.portrait ? 1024 : 768;

  const body = {
    prompt: STYLE_PREFIX + item.prompt,
    negative_prompt: NEGATIVE_PROMPT,
    image_url: refUrl,
    image_prompt_strength: 0.55,
    image_size: { width, height },
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    output_format: outputFormat,
    enable_safety_checker: false,
  };

  const res = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`fal.ai API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const imageUrl = data.images[0].url;
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const ext = item.outputExt ?? 'png';
  const outPath = path.join(OUT_DIR, `${item.key}.${ext}`);
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ ${outPath}`);
}

function publish(collection) {
  let published = 0;
  for (const item of collection) {
    const ext = item.outputExt ?? 'png';
    const src = path.join(OUT_DIR, `${item.key}.${ext}`);
    if (!fs.existsSync(src)) {
      console.warn(`  Pulando ${item.key} — não encontrado em quiz-v2/`);
      continue;
    }
    const dest = path.join(ASSETS_DIR, item.publishAs);
    fs.copyFileSync(src, dest);
    console.log(`✓ publicado: ${item.publishAs}`);
    published++;
  }
  if (published === 0) {
    console.error('Nenhuma imagem v2 encontrada. Rode a geração primeiro.');
    process.exit(1);
  }
  console.log(`\n${published} imagem(ns) publicada(s). Reinicie o Metro para carregar.`);
}

const COLLECTIONS = {
  '--perguntas': PERGUNTAS,
  '--resultados': RESULTADOS,
  '--capas': CAPAS,
  '--funcionalidades': FUNCIONALIDADES,
};

const ALL_ITEMS = [...PERGUNTAS, ...RESULTADOS, ...CAPAS, ...FUNCIONALIDADES];

async function main() {
  const args = process.argv.slice(2);
  const isPublish = args.includes('--publish');
  const isAll = args.includes('--all');
  const isWashed = args.includes('--washed');

  if (isWashed) {
    OUT_DIR = path.join(__dirname, '..', 'assets', 'images', 'quiz-v2-lavado');
    STYLE_PREFIX = STYLE_PREFIX_WASHED;
    NEGATIVE_PROMPT = NEGATIVE_PROMPT_WASHED;
    console.log('🎨 Modo lavado: paleta dessaturada → quiz-v2-lavado/\n');
  }

  // Determina qual coleção usar
  let collection;
  if (isAll) {
    collection = ALL_ITEMS;
  } else {
    const collectionFlag = Object.keys(COLLECTIONS).find((flag) => args.includes(flag));
    if (!collectionFlag) {
      console.error(
        'Especifique uma coleção: --perguntas | --resultados | --capas | --funcionalidades | --all',
      );
      console.error('Exemplo: node scripts/generate-quiz-illustrations.js --all');
      process.exit(1);
    }
    collection = COLLECTIONS[collectionFlag];

    // Filtro opcional por key (args sem flags)
    const nonFlagArgs = args.filter((a) => !a.startsWith('--'));
    if (nonFlagArgs.length) {
      collection = collection.filter((item) => nonFlagArgs.includes(item.key));
      if (!collection.length) {
        console.error(
          `Nenhum item encontrado. Keys válidos:`,
          COLLECTIONS[collectionFlag].map((i) => i.key).join(', '),
        );
        process.exit(1);
      }
    }
  }

  if (isPublish) {
    publish(collection);
    return;
  }

  console.log(`Gerando ${collection.length} imagem(ns)...\n`);
  for (const item of collection) {
    console.log(`Gerando ${item.key}...`);
    try {
      await generateOne(item);
    } catch (err) {
      console.error(`  ✗ Erro em ${item.key}: ${err.message}`);
    }
  }
  console.log('\nGeração concluída. Use --publish para copiar para assets/images/.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
