import { PoliticaPrivacidadeApi } from '../api/PoliticaPrivacidadeApi';
import { ResponsePoliticaPrivacidadeDto } from '../dtos/PoliticaPrivacidade/politica-privacidade.response';

class PoliticaPrivacidadeRepositoryClass {
  obter(): Promise<ResponsePoliticaPrivacidadeDto> {
    return PoliticaPrivacidadeApi.obter();
  }
}

export const PoliticaPrivacidadeRepository = new PoliticaPrivacidadeRepositoryClass();
