export enum RecursoPermissaoEnum {
  AgendaEventos = 'AGENDA_EVENTOS',
  Escalas = 'ESCALAS',
  Integrantes = 'INTEGRANTES',
  FuncoesTemplates = 'FUNCOES_TEMPLATES',
  RepertorioSetlist = 'REPERTORIO_SETLIST',
}

export const RecursoPermissaoEnumMap: Record<string, RecursoPermissaoEnum> = {
  [RecursoPermissaoEnum.AgendaEventos]: RecursoPermissaoEnum.AgendaEventos,
  [RecursoPermissaoEnum.Escalas]: RecursoPermissaoEnum.Escalas,
  [RecursoPermissaoEnum.Integrantes]: RecursoPermissaoEnum.Integrantes,
  [RecursoPermissaoEnum.FuncoesTemplates]: RecursoPermissaoEnum.FuncoesTemplates,
  [RecursoPermissaoEnum.RepertorioSetlist]: RecursoPermissaoEnum.RepertorioSetlist,
};

export const RecursoPermissaoEnumLabel: Record<RecursoPermissaoEnum, string> = {
  [RecursoPermissaoEnum.AgendaEventos]: 'Agenda e eventos',
  [RecursoPermissaoEnum.Escalas]: 'Escalas',
  [RecursoPermissaoEnum.Integrantes]: 'Integrantes',
  [RecursoPermissaoEnum.FuncoesTemplates]: 'Funções e templates',
  [RecursoPermissaoEnum.RepertorioSetlist]: 'Repertório e setlist',
};

export enum TipoPermissaoEnum {
  Visualizar = 'VISUALIZAR',
  AlterarOcorrencia = 'ALTERAR_OCORRENCIA',
  Gerar = 'GERAR',
  Alterar = 'ALTERAR',
  Publicar = 'PUBLICAR',
  Gerenciar = 'GERENCIAR',
}

export const TipoPermissaoEnumMap: Record<string, TipoPermissaoEnum> = {
  [TipoPermissaoEnum.Visualizar]: TipoPermissaoEnum.Visualizar,
  [TipoPermissaoEnum.AlterarOcorrencia]: TipoPermissaoEnum.AlterarOcorrencia,
  [TipoPermissaoEnum.Gerar]: TipoPermissaoEnum.Gerar,
  [TipoPermissaoEnum.Alterar]: TipoPermissaoEnum.Alterar,
  [TipoPermissaoEnum.Publicar]: TipoPermissaoEnum.Publicar,
  [TipoPermissaoEnum.Gerenciar]: TipoPermissaoEnum.Gerenciar,
};

export const TipoPermissaoEnumLabel: Record<TipoPermissaoEnum, string> = {
  [TipoPermissaoEnum.Visualizar]: 'Visualizar',
  [TipoPermissaoEnum.AlterarOcorrencia]: 'Alterar ocorrência',
  [TipoPermissaoEnum.Gerar]: 'Gerar',
  [TipoPermissaoEnum.Alterar]: 'Alterar',
  [TipoPermissaoEnum.Publicar]: 'Publicar',
  [TipoPermissaoEnum.Gerenciar]: 'Gerenciar',
};

export const RecursosPermissoesTable: Record<RecursoPermissaoEnum, TipoPermissaoEnum[]> = {
  [RecursoPermissaoEnum.AgendaEventos]: [
    TipoPermissaoEnum.Visualizar,
    TipoPermissaoEnum.AlterarOcorrencia,
  ],
  [RecursoPermissaoEnum.Escalas]: [
    TipoPermissaoEnum.Visualizar,
    TipoPermissaoEnum.Gerar,
    TipoPermissaoEnum.Alterar,
    TipoPermissaoEnum.Publicar,
  ],
  [RecursoPermissaoEnum.Integrantes]: [
    TipoPermissaoEnum.Visualizar,
    TipoPermissaoEnum.Gerenciar,
  ],
  [RecursoPermissaoEnum.FuncoesTemplates]: [
    TipoPermissaoEnum.Visualizar,
    TipoPermissaoEnum.Gerenciar,
  ],
  [RecursoPermissaoEnum.RepertorioSetlist]: [
    TipoPermissaoEnum.Visualizar,
    TipoPermissaoEnum.Gerenciar,
  ],
};

export const DefaultAuxiliarPermissionRows = [
  {
    recurso: RecursoPermissaoEnum.AgendaEventos,
    permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.AlterarOcorrencia],
  },
  {
    recurso: RecursoPermissaoEnum.Escalas,
    permissoes: [
      TipoPermissaoEnum.Visualizar,
      TipoPermissaoEnum.Gerar,
      TipoPermissaoEnum.Alterar,
      TipoPermissaoEnum.Publicar,
    ],
  },
  {
    recurso: RecursoPermissaoEnum.Integrantes,
    permissoes: [TipoPermissaoEnum.Visualizar],
  },
  {
    recurso: RecursoPermissaoEnum.RepertorioSetlist,
    permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Gerenciar],
  },
];
