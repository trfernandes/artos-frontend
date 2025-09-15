const DateUtils = {
  getMonthName(monthIndex: number): string {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return monthNames[monthIndex];
  },
  compareOnlyDate(data1: Date, data2: Date): boolean {
    return (
      data1.getFullYear() === data2.getFullYear() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getDate() === data2.getDate()
    );
  },
  formatHour(hour: number, minute: number): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hour)}:${pad(minute)}`;
  },
  formatToBrDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  },
  timeAgoText(dateInput: number | Date): string {
    const date = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Menos de 1 minuto
    if (seconds < 60) {
      return seconds === 0 ? 'agora mesmo' : `${seconds} segundos atrás`;
    }

    const minutes = Math.floor(seconds / 60);
    // Menos de 1 hora
    if (minutes < 60) {
      return `${minutes} minuto${minutes === 1 ? '' : 's'} atrás`;
    }

    const hours = Math.floor(minutes / 60);
    // Menos de 24 horas
    if (hours < 24) {
      return `${hours} hora${hours === 1 ? '' : 's'} atrás`;
    }

    const days = Math.floor(hours / 24);
    // Menos de 30 dias (aproximadamente 1 mês)
    if (days < 30) {
      return `${days} dia${days === 1 ? '' : 's'} atrás`;
    }

    const months = Math.floor(days / 30); // Aproximação para meses
    // Menos de 12 meses (aproximadamente 1 ano)
    if (months < 12) {
      return `${months} mês${months === 1 ? '' : 'es'} atrás`;
    }

    const years = Math.floor(months / 12);
    // Mais de 1 ano
    return `${years} ano${years === 1 ? '' : 's'} atrás`;
  },
};

export default DateUtils;
