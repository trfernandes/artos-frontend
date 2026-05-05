import { DropDownItemProps } from '../../components/fields/FancyDropDownItem';
import { fetchMunicipiosPorEstado } from '../services/IbgeService';
import { getCachedData, setCachedData } from './cache-utils';

const CACHE_KEY_PREFIX = 'cidades_';
const CACHE_EXPIRATION_DAYS = 30;

// Lista de fallback com principais cidades (usada quando API falha)
const CIDADES_POR_UF_FALLBACK: Record<string, DropDownItemProps<string>[]> = {
  AC: [
    { title: 'Rio Branco', value: 'Rio Branco' },
    { title: 'Cruzeiro do Sul', value: 'Cruzeiro do Sul' },
    { title: 'Sena Madureira', value: 'Sena Madureira' },
    { title: 'Tarauacá', value: 'Tarauacá' },
    { title: 'Feijó', value: 'Feijó' },
  ],
  AL: [
    { title: 'Maceió', value: 'Maceió' },
    { title: 'Arapiraca', value: 'Arapiraca' },
    { title: 'Palmeira dos Índios', value: 'Palmeira dos Índios' },
    { title: 'Rio Largo', value: 'Rio Largo' },
    { title: 'Penedo', value: 'Penedo' },
  ],
  AP: [
    { title: 'Macapá', value: 'Macapá' },
    { title: 'Santana', value: 'Santana' },
    { title: 'Laranjal do Jari', value: 'Laranjal do Jari' },
    { title: 'Oiapoque', value: 'Oiapoque' },
  ],
  AM: [
    { title: 'Manaus', value: 'Manaus' },
    { title: 'Parintins', value: 'Parintins' },
    { title: 'Itacoatiara', value: 'Itacoatiara' },
    { title: 'Manacapuru', value: 'Manacapuru' },
    { title: 'Coari', value: 'Coari' },
  ],
  BA: [
    { title: 'Salvador', value: 'Salvador' },
    { title: 'Feira de Santana', value: 'Feira de Santana' },
    { title: 'Vitória da Conquista', value: 'Vitória da Conquista' },
    { title: 'Camaçari', value: 'Camaçari' },
    { title: 'Itabuna', value: 'Itabuna' },
    { title: 'Juazeiro', value: 'Juazeiro' },
    { title: 'Lauro de Freitas', value: 'Lauro de Freitas' },
    { title: 'Ilhéus', value: 'Ilhéus' },
    { title: 'Jequié', value: 'Jequié' },
    { title: 'Teixeira de Freitas', value: 'Teixeira de Freitas' },
  ],
  CE: [
    { title: 'Fortaleza', value: 'Fortaleza' },
    { title: 'Caucaia', value: 'Caucaia' },
    { title: 'Juazeiro do Norte', value: 'Juazeiro do Norte' },
    { title: 'Maracanaú', value: 'Maracanaú' },
    { title: 'Sobral', value: 'Sobral' },
    { title: 'Crato', value: 'Crato' },
    { title: 'Itapipoca', value: 'Itapipoca' },
  ],
  DF: [
    { title: 'Brasília', value: 'Brasília' },
  ],
  ES: [
    { title: 'Vitória', value: 'Vitória' },
    { title: 'Vila Velha', value: 'Vila Velha' },
    { title: 'Serra', value: 'Serra' },
    { title: 'Cariacica', value: 'Cariacica' },
    { title: 'Cachoeiro de Itapemirim', value: 'Cachoeiro de Itapemirim' },
    { title: 'Linhares', value: 'Linhares' },
    { title: 'Colatina', value: 'Colatina' },
  ],
  GO: [
    { title: 'Goiânia', value: 'Goiânia' },
    { title: 'Aparecida de Goiânia', value: 'Aparecida de Goiânia' },
    { title: 'Anápolis', value: 'Anápolis' },
    { title: 'Rio Verde', value: 'Rio Verde' },
    { title: 'Luziânia', value: 'Luziânia' },
    { title: 'Águas Lindas de Goiás', value: 'Águas Lindas de Goiás' },
    { title: 'Valparaíso de Goiás', value: 'Valparaíso de Goiás' },
  ],
  MA: [
    { title: 'São Luís', value: 'São Luís' },
    { title: 'Imperatriz', value: 'Imperatriz' },
    { title: 'São José de Ribamar', value: 'São José de Ribamar' },
    { title: 'Timon', value: 'Timon' },
    { title: 'Caxias', value: 'Caxias' },
    { title: 'Codó', value: 'Codó' },
  ],
  MT: [
    { title: 'Cuiabá', value: 'Cuiabá' },
    { title: 'Várzea Grande', value: 'Várzea Grande' },
    { title: 'Rondonópolis', value: 'Rondonópolis' },
    { title: 'Sinop', value: 'Sinop' },
    { title: 'Tangará da Serra', value: 'Tangará da Serra' },
  ],
  MS: [
    { title: 'Campo Grande', value: 'Campo Grande' },
    { title: 'Dourados', value: 'Dourados' },
    { title: 'Três Lagoas', value: 'Três Lagoas' },
    { title: 'Corumbá', value: 'Corumbá' },
    { title: 'Ponta Porã', value: 'Ponta Porã' },
  ],
  MG: [
    { title: 'Belo Horizonte', value: 'Belo Horizonte' },
    { title: 'Uberlândia', value: 'Uberlândia' },
    { title: 'Contagem', value: 'Contagem' },
    { title: 'Juiz de Fora', value: 'Juiz de Fora' },
    { title: 'Betim', value: 'Betim' },
    { title: 'Montes Claros', value: 'Montes Claros' },
    { title: 'Ribeirão das Neves', value: 'Ribeirão das Neves' },
    { title: 'Uberaba', value: 'Uberaba' },
    { title: 'Governador Valadares', value: 'Governador Valadares' },
    { title: 'Ipatinga', value: 'Ipatinga' },
  ],
  PA: [
    { title: 'Belém', value: 'Belém' },
    { title: 'Ananindeua', value: 'Ananindeua' },
    { title: 'Santarém', value: 'Santarém' },
    { title: 'Marabá', value: 'Marabá' },
    { title: 'Parauapebas', value: 'Parauapebas' },
    { title: 'Castanhal', value: 'Castanhal' },
  ],
  PB: [
    { title: 'João Pessoa', value: 'João Pessoa' },
    { title: 'Campina Grande', value: 'Campina Grande' },
    { title: 'Santa Rita', value: 'Santa Rita' },
    { title: 'Patos', value: 'Patos' },
    { title: 'Bayeux', value: 'Bayeux' },
  ],
  PR: [
    { title: 'Curitiba', value: 'Curitiba' },
    { title: 'Londrina', value: 'Londrina' },
    { title: 'Maringá', value: 'Maringá' },
    { title: 'Ponta Grossa', value: 'Ponta Grossa' },
    { title: 'Cascavel', value: 'Cascavel' },
    { title: 'São José dos Pinhais', value: 'São José dos Pinhais' },
    { title: 'Foz do Iguaçu', value: 'Foz do Iguaçu' },
    { title: 'Colombo', value: 'Colombo' },
  ],
  PE: [
    { title: 'Recife', value: 'Recife' },
    { title: 'Jaboatão dos Guararapes', value: 'Jaboatão dos Guararapes' },
    { title: 'Olinda', value: 'Olinda' },
    { title: 'Caruaru', value: 'Caruaru' },
    { title: 'Petrolina', value: 'Petrolina' },
    { title: 'Paulista', value: 'Paulista' },
    { title: 'Cabo de Santo Agostinho', value: 'Cabo de Santo Agostinho' },
  ],
  PI: [
    { title: 'Teresina', value: 'Teresina' },
    { title: 'Parnaíba', value: 'Parnaíba' },
    { title: 'Picos', value: 'Picos' },
    { title: 'Floriano', value: 'Floriano' },
  ],
  RJ: [
    { title: 'Rio de Janeiro', value: 'Rio de Janeiro' },
    { title: 'São Gonçalo', value: 'São Gonçalo' },
    { title: 'Duque de Caxias', value: 'Duque de Caxias' },
    { title: 'Nova Iguaçu', value: 'Nova Iguaçu' },
    { title: 'Niterói', value: 'Niterói' },
    { title: 'Belford Roxo', value: 'Belford Roxo' },
    { title: 'Campos dos Goytacazes', value: 'Campos dos Goytacazes' },
    { title: 'São João de Meriti', value: 'São João de Meriti' },
    { title: 'Petrópolis', value: 'Petrópolis' },
    { title: 'Volta Redonda', value: 'Volta Redonda' },
  ],
  RN: [
    { title: 'Natal', value: 'Natal' },
    { title: 'Mossoró', value: 'Mossoró' },
    { title: 'Parnamirim', value: 'Parnamirim' },
    { title: 'São Gonçalo do Amarante', value: 'São Gonçalo do Amarante' },
    { title: 'Macaíba', value: 'Macaíba' },
  ],
  RS: [
    { title: 'Porto Alegre', value: 'Porto Alegre' },
    { title: 'Caxias do Sul', value: 'Caxias do Sul' },
    { title: 'Pelotas', value: 'Pelotas' },
    { title: 'Canoas', value: 'Canoas' },
    { title: 'Santa Maria', value: 'Santa Maria' },
    { title: 'Gravataí', value: 'Gravataí' },
    { title: 'Viamão', value: 'Viamão' },
    { title: 'Novo Hamburgo', value: 'Novo Hamburgo' },
    { title: 'São Leopoldo', value: 'São Leopoldo' },
  ],
  RO: [
    { title: 'Porto Velho', value: 'Porto Velho' },
    { title: 'Ji-Paraná', value: 'Ji-Paraná' },
    { title: 'Ariquemes', value: 'Ariquemes' },
    { title: 'Vilhena', value: 'Vilhena' },
    { title: 'Cacoal', value: 'Cacoal' },
  ],
  RR: [
    { title: 'Boa Vista', value: 'Boa Vista' },
    { title: 'Rorainópolis', value: 'Rorainópolis' },
    { title: 'Caracaraí', value: 'Caracaraí' },
  ],
  SC: [
    { title: 'Florianópolis', value: 'Florianópolis' },
    { title: 'Joinville', value: 'Joinville' },
    { title: 'Blumenau', value: 'Blumenau' },
    { title: 'São José', value: 'São José' },
    { title: 'Criciúma', value: 'Criciúma' },
    { title: 'Chapecó', value: 'Chapecó' },
    { title: 'Itajaí', value: 'Itajaí' },
    { title: 'Jaraguá do Sul', value: 'Jaraguá do Sul' },
  ],
  SP: [
    { title: 'São Paulo', value: 'São Paulo' },
    { title: 'Guarulhos', value: 'Guarulhos' },
    { title: 'Campinas', value: 'Campinas' },
    { title: 'São Bernardo do Campo', value: 'São Bernardo do Campo' },
    { title: 'Santo André', value: 'Santo André' },
    { title: 'Osasco', value: 'Osasco' },
    { title: 'São José dos Campos', value: 'São José dos Campos' },
    { title: 'Ribeirão Preto', value: 'Ribeirão Preto' },
    { title: 'Sorocaba', value: 'Sorocaba' },
    { title: 'Mauá', value: 'Mauá' },
    { title: 'São José do Rio Preto', value: 'São José do Rio Preto' },
    { title: 'Santos', value: 'Santos' },
    { title: 'Diadema', value: 'Diadema' },
    { title: 'Carapicuíba', value: 'Carapicuíba' },
    { title: 'Piracicaba', value: 'Piracicaba' },
  ],
  SE: [
    { title: 'Aracaju', value: 'Aracaju' },
    { title: 'Nossa Senhora do Socorro', value: 'Nossa Senhora do Socorro' },
    { title: 'Lagarto', value: 'Lagarto' },
    { title: 'Itabaiana', value: 'Itabaiana' },
  ],
  TO: [
    { title: 'Palmas', value: 'Palmas' },
    { title: 'Araguaína', value: 'Araguaína' },
    { title: 'Gurupi', value: 'Gurupi' },
    { title: 'Porto Nacional', value: 'Porto Nacional' },
  ],
};

/**
 * Converte array de nomes de cidades para DropDownItemProps
 */
function cidadesToDropDownItems(cidades: string[]): DropDownItemProps<string>[] {
  return cidades.map((cidade) => ({
    title: cidade,
    value: cidade,
  }));
}

/**
 * Busca cidades de um estado com cache e fallback
 * @param uf Sigla do estado
 * @returns Promise com lista de cidades
 */
export async function getCidadesPorUf(
  uf: string,
): Promise<DropDownItemProps<string>[]> {
  if (!uf) return [];

  const cacheKey = `${CACHE_KEY_PREFIX}${uf}`;

  try {
    // 1. Tenta buscar do cache
    const cached = await getCachedData<string[]>(cacheKey, CACHE_EXPIRATION_DAYS);
    if (cached) {
      console.log(`Cidades carregadas do cache para ${uf}`);
      return cidadesToDropDownItems(cached);
    }

    // 2. Busca da API do IBGE
    console.log(`Buscando cidades da API do IBGE para ${uf}`);
    const cidades = await fetchMunicipiosPorEstado(uf);

    // 3. Salva no cache
    await setCachedData(cacheKey, cidades);

    return cidadesToDropDownItems(cidades);
  } catch (error) {
    console.warn(`Erro ao buscar cidades do IBGE para ${uf}:`, error);

    // 4. Fallback para lista local
    console.log(`Usando lista fallback para ${uf}`);
    const fallbackCidades = CIDADES_POR_UF_FALLBACK[uf] || [];
    return fallbackCidades.sort((a, b) =>
      a.title.localeCompare(b.title, 'pt-BR'),
    );
  }
}

/**
 * Versão síncrona para compatibilidade (retorna apenas fallback)
 * @deprecated Use getCidadesPorUf() async
 */
export function getCidadesPorUfSync(uf: string): DropDownItemProps<string>[] {
  const cidades = CIDADES_POR_UF_FALLBACK[uf] || [];
  return [...cidades].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
}
