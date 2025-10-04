export function strfyObj(
  obj: Record<string, any>, // Tipo genérico para objetos
  maxLength: number = 30,
  space: number = 2
): string {
  function processValue(value: any): any {
    if (typeof value === 'string' && value.length > maxLength) {
      const half = Math.floor(maxLength / 2);
      return `${value.slice(0, half)}...${value.slice(-half)}`;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursivamente processa objetos
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, processValue(val)])
      );
    } else if (Array.isArray(value)) {
      // Recursivamente processa arrays
      return value.map(item => processValue(item));
    }
    return value; // Retorna o valor original caso não precise ser encurtado
  }

  const processedObj = processValue(obj);
  return JSON.stringify(processedObj, null, space);
}

export function shortenString(str: string, length: number = 10): string {
  if (!str) return '';
  if (str.length <= length * 2) return str; // Se for curta, retorna toda

  const start = str.slice(0, length);
  const end = str.slice(-length);
  return `${start}...${end}`;
}
