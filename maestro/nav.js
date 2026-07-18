#!/usr/bin/env node
/**
 * nav.js — Navega para uma tela do app via Maestro flow.
 *
 * Uso:
 *   node artos_frontend/maestro/nav.js <flowName>
 *
 * Exemplos:
 *   node artos_frontend/maestro/nav.js indisponibilidades-regras
 *   node artos_frontend/maestro/nav.js voluntarios
 *
 * Flows disponíveis (em maestro/flows/):
 *   inicio, indisponibilidades, indisponibilidades-regras,
 *   escalas, voluntarios, ministerios, eventos, configuracoes
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const DEVICE = process.env.MAESTRO_DEVICE || 'RQCWC04P4VX';
const FLOWS_DIR = path.join(__dirname, 'flows');

const flowName = process.argv[2];

if (!flowName) {
  console.error('Uso: node nav.js <flowName>');
  console.error(
    'Flows disponíveis:',
    fs
      .readdirSync(FLOWS_DIR)
      .map((f) => f.replace('.yaml', ''))
      .join(', '),
  );
  process.exit(1);
}

const flowPath = path.join(FLOWS_DIR, `${flowName}.yaml`);

if (!fs.existsSync(flowPath)) {
  console.error(`Flow não encontrado: ${flowPath}`);
  console.error(
    'Flows disponíveis:',
    fs
      .readdirSync(FLOWS_DIR)
      .map((f) => f.replace('.yaml', ''))
      .join(', '),
  );
  process.exit(1);
}

const maestroBin =
  process.env.MAESTRO_BIN || `${process.env.USERPROFILE}\\.maestro\\maestro\\bin\\maestro.bat`;

const result = spawnSync(maestroBin, ['--device', DEVICE, 'test', flowPath], {
  encoding: 'utf8',
  shell: true,
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(1);
}

console.log(`Navegação para "${flowName}" concluída.`);
