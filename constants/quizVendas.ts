export type QuizVendasBucket = 'SO_FALTA_ORGANIZAR' | 'NO_LIMITE' | 'SOBRECARREGADO';

export interface QuizVendasOption {
  label: string;
  pontos: number;
  icon: string;
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
      { label: 'Pastor / líder principal', pontos: 1, icon: 'account-star' },
      { label: 'Líder de ministério', pontos: 2, icon: 'account-group' },
      { label: 'Coordenador de voluntários', pontos: 3, icon: 'account-check' },
    ],
  },
  {
    id: 'voluntarios',
    label: '2 · Voluntários',
    title: 'Quantos voluntários você coordena?',
    options: [
      { label: 'Até 5', pontos: 1, icon: 'account' },
      { label: '6 a 15', pontos: 2, icon: 'account-multiple' },
      { label: '16 a 30', pontos: 3, icon: 'account-group' },
      { label: 'Mais de 30', pontos: 4, icon: 'account-supervisor' },
    ],
  },
  {
    id: 'horas',
    label: '3 · Horas por mês',
    title: 'Quantas horas por mês você gasta montando escala?',
    options: [
      { label: 'Menos de 4h', pontos: 1, icon: 'clock-fast' },
      { label: '4 a 12h', pontos: 2, icon: 'clock-outline' },
      { label: '12 a 24h', pontos: 3, icon: 'clock-alert-outline' },
      { label: 'Mais de 24h', pontos: 4, icon: 'clock-alert' },
    ],
  },
  {
    id: 'falta',
    label: '4 · Falta / lembrete',
    title: 'Com que frequência um voluntário falta ou esquece o compromisso?',
    options: [
      { label: 'Quase nunca', pontos: 1, icon: 'check-circle-outline' },
      { label: 'Às vezes', pontos: 2, icon: 'alert-circle-outline' },
      { label: 'Frequentemente', pontos: 3, icon: 'alert-circle' },
      { label: 'Toda semana', pontos: 4, icon: 'close-circle-outline' },
    ],
  },
  {
    id: 'ferramenta',
    label: '5 · Ferramenta atual',
    title: 'Como você organiza escala e comunicação hoje?',
    options: [
      { label: 'Planilha', pontos: 1, icon: 'table' },
      { label: 'Grupo de WhatsApp', pontos: 2, icon: 'whatsapp' },
      { label: 'Caderno / papel', pontos: 3, icon: 'notebook-outline' },
      { label: 'Nenhuma ferramenta', pontos: 4, icon: 'checkbox-blank-outline' },
    ],
  },
  {
    id: 'custo',
    label: '6 · Custo real',
    title: 'Se recuperasse esse tempo, no que investiria?',
    options: [
      { label: 'Visitas pastorais', pontos: 1, icon: 'home-heart' },
      { label: 'Preparo de mensagem/estudo', pontos: 2, icon: 'book-open-page-variant' },
      { label: 'Família', pontos: 3, icon: 'human-male-female-child' },
      { label: 'Descanso', pontos: 4, icon: 'weather-night' },
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
