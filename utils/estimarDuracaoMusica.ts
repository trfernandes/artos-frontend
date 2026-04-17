type EstimarDuracaoParams = {
  bpm?: number | null;
  totalSecoes?: number | null;
  repeticoes?: number | null;
};

export function estimarDuracaoMusica({
  bpm,
  totalSecoes,
  repeticoes,
}: EstimarDuracaoParams) {
  const safeBpm = bpm && bpm > 0 ? bpm : 72;
  const safeSecoes = totalSecoes && totalSecoes > 0 ? totalSecoes : 1;
  const safeRepeticoes = repeticoes && repeticoes > 0 ? repeticoes : safeSecoes;
  const segundosPorCompasso = (60 / safeBpm) * 4;
  const segundosEstimados = Math.max(45, Math.round(segundosPorCompasso * safeRepeticoes * 4));

  if (segundosEstimados < 60) {
    return `${segundosEstimados}s`;
  }

  const minutos = Math.floor(segundosEstimados / 60);
  const segundos = segundosEstimados % 60;
  return segundos > 0 ? `${minutos}min ${segundos}s` : `${minutos}min`;
}
