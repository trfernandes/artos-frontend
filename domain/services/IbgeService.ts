import axios from 'axios';

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';
const REQUEST_TIMEOUT = 10000; // 10 segundos

interface IbgeMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

/**
 * Busca todos os municípios de um estado na API do IBGE
 * @param uf Sigla do estado (ex: 'SP', 'RJ')
 * @returns Array com os nomes das cidades
 */
export async function fetchMunicipiosPorEstado(uf: string): Promise<string[]> {
  try {
    const response = await axios.get<IbgeMunicipio[]>(
      `${IBGE_BASE_URL}/estados/${uf}/municipios`,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Accept': 'application/json',
        },
      },
    );

    // Extrai apenas os nomes das cidades e ordena alfabeticamente
    const cidades = response.data
      .map((municipio) => municipio.nome)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return cidades;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout ao buscar cidades do IBGE');
      }
      if (error.response) {
        throw new Error(
          `Erro na API do IBGE: ${error.response.status} - ${error.response.statusText}`,
        );
      }
      if (error.request) {
        throw new Error('Sem conexão com a API do IBGE');
      }
    }
    throw new Error('Erro desconhecido ao buscar cidades');
  }
}

/**
 * Busca todos os estados brasileiros da API do IBGE
 * @returns Array com informações dos estados
 */
export async function fetchEstados(): Promise<
  Array<{ id: number; sigla: string; nome: string }>
> {
  try {
    const response = await axios.get(`${IBGE_BASE_URL}/estados`, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.data.sort((a: any, b: any) =>
      a.nome.localeCompare(b.nome, 'pt-BR'),
    );
  } catch (error) {
    throw new Error('Erro ao buscar estados do IBGE');
  }
}
