export function strfyObj(
  obj: Record<string, any>, // Tipo genérico para objetos
  maxLength: number = 100,
  space: number = 2,
): string {
  function processValue(value: any): any {
    if (typeof value === 'string' && value.length > maxLength) {
      const half = Math.floor(maxLength / 2);
      return `${value.slice(0, half)}...${value.slice(-half)}`;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursivamente processa objetos
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, processValue(val)]),
      );
    } else if (Array.isArray(value)) {
      // Recursivamente processa arrays
      return value.map((item) => processValue(item));
    }
    return value; // Retorna o valor original caso não precise ser encurtado
  }

  const processedObj = processValue(obj);
  return JSON.stringify(processedObj, null, space);
}

export function capitalizeFirst(text: string) {
  const s = text.trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function shortenString(str: string, length: number = 10): string {
  if (!str) return '';
  if (str.length <= length * 2) return str; // Se for curta, retorna toda

  const start = str.slice(0, length);
  const end = str.slice(-length);
  return `${start}...${end}`;
}

export function Log(title: string, data: any, options?: { indent?: number; width?: number }): void {
  const indent = options?.indent ?? 2;
  const width = options?.width ?? 100;
  const line = '─'.repeat(width);

  let formattedData: string;

  if (typeof data === 'string') {
    formattedData = data;
  } else if (Array.isArray(data)) {
    formattedData = data
      .map((item, i) => ` ${' '.repeat(indent)}${i + 1}. ${strfyObj(item)}`)
      .join('\n');
  } else if (typeof data === 'object' && data !== null) {
    formattedData = strfyObj(data);
  } else {
    formattedData = String(data);
  }

  console.log(
    [
      `\n${'═'.repeat(width)}`,
      `🧩 ${title.toUpperCase()}`,
      `${line}`,
      formattedData,
      `${'═'.repeat(width)}\n`,
    ].join('\n'),
  );
}

type ShortNameOptions = {
  /** Se true, inclui partículas comuns junto do último sobrenome (ex: "João da Silva") */
  includeSurnameParticles?: boolean;
  /** Lista de partículas consideradas (pode customizar) */
  surnameParticles?: string[];
};

const DEFAULT_PARTICLES = [
  'da',
  'das',
  'de',
  'do',
  'dos',
  'del',
  'della',
  'di',
  'van',
  'von',
  'la',
  'las',
  'le',
  'los',
];

export function getFirstAndLastName(
  fullName: string | null | undefined,
  options: ShortNameOptions = {},
): string {
  const { includeSurnameParticles = true, surnameParticles = DEFAULT_PARTICLES } = options;

  const clean = (fullName ?? '').trim().replace(/\s+/g, ' ');

  if (!clean) return '';

  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0];

  const first = parts[0];

  // Última palavra sempre entra
  let lastIndex = parts.length - 1;

  if (includeSurnameParticles) {
    // Ex: "João da Silva" -> pega "da Silva"
    const particles = new Set(surnameParticles.map((p) => p.toLowerCase()));

    // Vai voltando enquanto tiver partículas antes do último sobrenome
    let start = lastIndex - 1;
    while (start >= 1 && particles.has(parts[start].toLowerCase())) {
      start -= 1;
    }

    // Se encontrou partículas imediatamente antes do sobrenome, junta
    // Ex: parts = [João, da, Silva] => start para em 0, então partículas começam em 1
    const particleStart = start + 1;
    if (particleStart < lastIndex) {
      const last = parts.slice(particleStart, lastIndex + 1).join(' ');
      return `${first} ${last}`;
    }
  }

  const last = parts[lastIndex];
  return `${first} ${last}`;
}
