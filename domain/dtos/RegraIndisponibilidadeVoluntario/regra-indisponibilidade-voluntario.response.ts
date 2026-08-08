export type RegraIndisponibilidadeTipo = 'DIAS_SEMANA' | 'PERIODO' | 'LIMITE_MENSAL';

export type ResponseRegraIndisponibilidadeVoluntarioDto = {
  id: string;
  tipo: RegraIndisponibilidadeTipo;
  diasSemana: number[] | null;
  dataInicio: string | null;
  dataFim: string | null;
  recorrente: boolean;
  limiteMensal: number | null;
  motivo: string | null;
  voluntarioId: string;
  igrejaId: string;
  ministerioId: string | null;
  createdAt: string;
  updatedAt: string;
};
