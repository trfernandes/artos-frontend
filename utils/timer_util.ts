export const TimeUtils = {
  formatMillis(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    if (totalHours >= 1) {
      const restMinutes = totalMinutes % 60;
      if (restMinutes === 0) {
        return `${totalHours}h`;
      }
      return `${totalHours}h ${restMinutes}min`;
    }

    if (totalMinutes >= 1) {
      const restSeconds = totalSeconds % 60;
      if (restSeconds === 0) {
        return `${totalMinutes}min`;
      }
      return `${totalMinutes}min ${restSeconds}s`;
    }

    // se quiser mostrar segundos quando for menos de 1 min
    return `${totalSeconds}s`;
  },
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
