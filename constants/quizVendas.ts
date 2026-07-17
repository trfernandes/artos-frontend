export type QuizVendasBucket = 'SO_FALTA_ORGANIZAR' | 'NO_LIMITE' | 'SOBRECARREGADO';

export interface QuizVendasOption {
  label: string;
  pontos: number;
}

export interface QuizVendasQuestion {
  id: string;
  label: string;
  title: string;
  options: QuizVendasOption[];
}

export const QUIZ_VENDAS_QUESTIONS: QuizVendasQuestion[] = [
  {
    id: 'papel',
    label: '1 · Papel na igreja',
    title: 'Qual seu papel na igreja/ministério?',
    options: [
      { label: 'Pastor / líder principal', pontos: 1 },
      { label: 'Líder de ministério', pontos: 2 },
      { label: 'Coordenador de voluntários', pontos: 3 },
    ],
  },
  {
    id: 'voluntarios',
    label: '2 · Voluntários',
    title: 'Quantos voluntários você coordena?',
    options: [
      { label: 'Até 5', pontos: 1 },
      { label: '6 a 15', pontos: 2 },
      { label: '16 a 30', pontos: 3 },
      { label: 'Mais de 30', pontos: 4 },
    ],
  },
  {
    id: 'horas',
    label: '3 · Horas por mês',
    title: 'Quantas horas por mês você gasta montando escala?',
    options: [
      { label: 'Menos de 4h', pontos: 1 },
      { label: '4 a 12h', pontos: 2 },
      { label: '12 a 24h', pontos: 3 },
      { label: 'Mais de 24h', pontos: 4 },
    ],
  },
  {
    id: 'falta',
    label: '4 · Falta / lembrete',
    title: 'Com que frequência um voluntário falta ou esquece o compromisso?',
    options: [
      { label: 'Quase nunca', pontos: 1 },
      { label: 'Às vezes', pontos: 2 },
      { label: 'Frequentemente', pontos: 3 },
      { label: 'Toda semana', pontos: 4 },
    ],
  },
  {
    id: 'ferramenta',
    label: '5 · Ferramenta atual',
    title: 'Como você organiza escala e comunicação hoje?',
    options: [
      { label: 'Planilha', pontos: 1 },
      { label: 'Grupo de WhatsApp', pontos: 2 },
      { label: 'Caderno / papel', pontos: 3 },
      { label: 'Nenhuma ferramenta', pontos: 4 },
    ],
  },
  {
    id: 'custo',
    label: '6 · Custo real',
    title: 'Se recuperasse esse tempo, no que investiria?',
    options: [
      { label: 'Visitas pastorais', pontos: 1 },
      { label: 'Preparo de mensagem/estudo', pontos: 2 },
      { label: 'Família', pontos: 3 },
      { label: 'Descanso', pontos: 4 },
    ],
  },
];

export const QUIZ_VENDAS_BUCKET_COPY: Record<QuizVendasBucket, { tag: string; copy: string }> = {
  SO_FALTA_ORGANIZAR: {
    tag: 'Só falta organizar',
    copy: 'Sua rotina já está no controle — o Diakonia tira o que ainda é manual.',
  },
  NO_LIMITE: {
    tag: 'No limite',
    copy: 'Você está segurando a operação na base do esforço pessoal — dá pra automatizar boa parte disso.',
  },
  SOBRECARREGADO: {
    tag: 'Sobrecarregado',
    copy: 'Boa parte do seu tempo está indo para tarefas que o Diakonia faz por você.',
  },
};
