import { QuizVendasBucket } from '../../../constants/quizVendas';

export interface QuizVendasRespostaDto {
  questionId: string;
  pontos: number;
}

export interface SubmitQuizVendasDto {
  respostas: QuizVendasRespostaDto[];
}

export interface QuizVendasResponseDto {
  sessaoId: string;
  pontuacaoTotal: number;
  bucket: QuizVendasBucket;
}
