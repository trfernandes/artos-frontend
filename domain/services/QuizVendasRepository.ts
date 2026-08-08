import apiClient from '../api/api-client';
import { SubmitQuizVendasDto, QuizVendasResponseDto } from '../dtos/QuizVendas/quiz-vendas.dto';

const API_BASE_PATH = '/public/quiz-vendas';

type ApiEnvelope<T> = {
  data: T;
};

class QuizVendasRepositoryClass {
  /**
   * Envia as respostas do quiz de vendas (anônimo, pré-cadastro)
   * POST /public/quiz-vendas
   */
  async submeter(dto: SubmitQuizVendasDto): Promise<QuizVendasResponseDto> {
    const response = await apiClient.post<ApiEnvelope<QuizVendasResponseDto>>(API_BASE_PATH, dto);
    return response.data.data;
  }
}

export const QuizVendasRepository = new QuizVendasRepositoryClass();
