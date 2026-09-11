export enum PublicarEscalaAcaoEnum {
  Detectar = 'detectar',
  Publicar = 'publicar',
  TrocarVoluntario = 'trocar_voluntario',
  DeixarVago = 'deixar_vago',
  PerguntarVoluntario = 'perguntar_voluntario',
}

export type PublicarEscalaDto = {
  igrejaId: string;
  acao: PublicarEscalaAcaoEnum;
  voluntarioIdResolucao?: string;
  escalaItemIdConflito?: string;
};

export type ConflitoMultiMinisteriosType = {
  escalaItemId: string;
  voluntarioId: string;
  voluntarioNome: string;
  dataOcorrencia: string;
  outrosMinisterios: {
    ministerioId: string;
    ministerioNome: string;
    funcoes: string[];
  }[];
};

export type ResponseConflitosMultiMinisteriosDto = {
  temConflito: boolean;
  conflitos: ConflitoMultiMinisteriosType[];
};

// Resposta de /publicar: quando há conflito, devolve o pacote de conflitos (não publica);
// quando não há conflito, publica e devolve a escala atualizada.
export type PublicarEscalaResponse =
  ResponseConflitosMultiMinisteriosDto | { id: string; [key: string]: any };

export enum ResolverConflitoAcaoEnum {
  TrocarVoluntario = 'trocar_voluntario',
  DeixarVago = 'deixar_vago',
  PerguntarVoluntario = 'perguntar_voluntario',
}

export type ResolverConflitoEscalaDto = {
  acao: ResolverConflitoAcaoEnum;
  escalaItemIdConflito?: string;
  voluntarioSubstitutoId?: string;
  ministerioBId?: string;
};
