import type { CreateMinisterioVoluntarioFuncaoDto } from './ministerio-voluntario-funcao.create';

export type UpdateMinisterioVoluntarioFuncaoLoteDto = {
  funcoes?: Partial<Omit<CreateMinisterioVoluntarioFuncaoDto, 'ministerioVoluntarioId'>>[];
};
