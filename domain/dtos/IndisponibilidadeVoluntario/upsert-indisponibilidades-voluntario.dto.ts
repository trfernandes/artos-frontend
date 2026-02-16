import type { UpsertIndisponibilidadeVoluntarioItemDto } from './upsert-indisponibilidade-voluntario-item.dto';

export type UpsertIndisponibilidadesVoluntarioDto = {
  voluntarioId: string;
  igrejaId: string;
  indisponibilidades: UpsertIndisponibilidadeVoluntarioItemDto[];
};
