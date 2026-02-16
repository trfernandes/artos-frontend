# Dashboard API - Especificacao para o Backend

## Endpoint

```
GET /dashboard/igreja/:igrejaId
```

**Auth**: Bearer Token (voluntario autenticado)

O backend deve identificar o **role** do voluntario na igreja (ADMIN, LIDER, VOLUNTARIO) e retornar os campos correspondentes.

---

## Response Type

```typescript
{
  // === SEMPRE retornar (para todos os roles) ===
  proximasEscalas?: DashboardEscalaItemDto[];   // Proximas 5 escalas PESSOAIS do voluntario logado
  totalEscalasMes?: number;                      // Total de escalas do voluntario no mes atual
  escalasConfirmadas?: number;                   // Escalas confirmadas no mes atual
  escalasPendentes?: number;                     // Escalas pendentes no mes atual

  // === Retornar se role = LIDER ===
  ministerioStats?: DashboardMinisterioStatsDto;           // Stats do ministerio que lidera
  proximosEventosMinisterio?: DashboardEventoProximoDto[]; // Proximos 5 eventos do ministerio
  solicitacoesPendentes?: DashboardSolicitacaoDto[];       // Solicitacoes pendentes no ministerio

  // === Retornar se role = ADMIN ===
  totalMinisterios?: number;                               // Total de ministerios da igreja
  totalVoluntarios?: number;                               // Total de voluntarios da igreja
  totalEventosMes?: number;                                // Total de eventos no mes atual
  ministeriosStats?: DashboardMinisterioStatsDto[];        // Stats de TODOS os ministerios
  proximosEventosIgreja?: DashboardEventoProximoDto[];     // Proximos 5 eventos da igreja inteira
  solicitacoesGerais?: DashboardSolicitacaoDto[];          // Todas as solicitacoes pendentes
}
```

---

## DTOs Detalhados

### DashboardEscalaItemDto
Cada escala proxima do voluntario logado.

```typescript
{
  id: string;              // ID do escala_item
  eventoNome: string;      // Nome do evento (ex: "Culto de Domingo")
  eventoData: string;      // Data ISO do evento (ex: "2026-02-15T19:00:00.000Z")
  funcaoNome: string;      // Nome da funcao (ex: "Tecladista")
  ministerioNome: string;  // Nome do ministerio (ex: "Louvor")
  ministerioLogoUrl?: string; // URL da logo do ministerio (opcional)
  eventoLocal?: string;    // Local do evento (opcional)
  isConfirmado: boolean;   // true se status = CONFIRMADO, false se PENDENTE
}
```

**Query**: Buscar `escala_itens` onde:
- `voluntario.voluntario.id` = usuario logado
- `voluntario.ministerio.igrejaId` = igrejaId
- `dataOcorrencia` >= hoje
- Ordenar por `dataOcorrencia` ASC
- Limit 5

---

### DashboardMinisterioStatsDto
Stats resumidos de um ministerio.

```typescript
{
  ministerioId: string;        // ID do ministerio
  ministerioNome: string;      // Nome do ministerio
  ministerioLogoUrl?: string;  // URL da logo
  totalVoluntarios: number;    // COUNT de voluntarios ativos no ministerio
  totalFuncoes: number;        // COUNT de funcoes cadastradas
  totalEscalasAtivas: number;  // COUNT de escalas com dataFim >= hoje
}
```

---

### DashboardEventoProximoDto
Proximo evento com info de preenchimento de escala.

```typescript
{
  id: string;                  // ID do evento
  nome: string;                // Nome do evento
  dataInicio: string;          // Data ISO de inicio
  local?: string;              // Local do evento
  cor: string;                 // Cor do evento (hex, ex: "#3498db")
  totalEscalados: number;      // Quantos voluntarios ja foram escalados
  totalFuncoes: number;        // Total de vagas/funcoes a preencher
  percentualPreenchido: number; // (totalEscalados / totalFuncoes) * 100
}
```

**Query**: Buscar eventos onde:
- `dataInicio` >= hoje
- Para LIDER: filtrar pelo ministerio que lidera
- Para ADMIN: todos os eventos da igreja
- Ordenar por `dataInicio` ASC
- Limit 5

---

### DashboardSolicitacaoDto
Solicitacao pendente (entrada ou substituicao).

```typescript
{
  id: string;                  // ID da solicitacao
  voluntarioNome: string;      // Nome do voluntario que fez a solicitacao
  voluntarioFoto?: string;     // URL da foto (opcional)
  ministerioNome?: string;     // Nome do ministerio relacionado
  dataSolicitacao: string;     // Data ISO da solicitacao
  tipo: 'entrada' | 'substituicao'; // Tipo da solicitacao
}
```

---

## Logica por Role

### VOLUNTARIO
Retornar apenas:
- `proximasEscalas` (proximas 5)
- `totalEscalasMes`, `escalasConfirmadas`, `escalasPendentes`

### LIDER
Retornar tudo do VOLUNTARIO + :
- `ministerioStats` (stats do ministerio que lidera - se lidera mais de um, retornar o primeiro)
- `proximosEventosMinisterio` (proximos 5 eventos do ministerio)
- `solicitacoesPendentes` (solicitacoes de entrada + substituicao pendentes)

### ADMIN
Retornar tudo do VOLUNTARIO + :
- `totalMinisterios`, `totalVoluntarios`, `totalEventosMes`
- `ministeriosStats` (stats de TODOS os ministerios da igreja)
- `proximosEventosIgreja` (proximos 5 eventos de toda a igreja)
- `solicitacoesGerais` (todas as solicitacoes pendentes de todos os ministerios)

---

## Exemplo de Response (ADMIN)

```json
{
  "data": {
    "proximasEscalas": [
      {
        "id": "abc123",
        "eventoNome": "Culto de Domingo",
        "eventoData": "2026-02-15T19:00:00.000Z",
        "funcaoNome": "Tecladista",
        "ministerioNome": "Louvor",
        "ministerioLogoUrl": "https://...",
        "eventoLocal": "Templo Principal",
        "isConfirmado": false
      }
    ],
    "totalEscalasMes": 4,
    "escalasConfirmadas": 2,
    "escalasPendentes": 2,
    "totalMinisterios": 5,
    "totalVoluntarios": 48,
    "totalEventosMes": 12,
    "ministeriosStats": [
      {
        "ministerioId": "min1",
        "ministerioNome": "Louvor",
        "totalVoluntarios": 15,
        "totalFuncoes": 8,
        "totalEscalasAtivas": 3
      }
    ],
    "proximosEventosIgreja": [
      {
        "id": "evt1",
        "nome": "Culto de Domingo",
        "dataInicio": "2026-02-15T19:00:00.000Z",
        "local": "Templo Principal",
        "cor": "#3498db",
        "totalEscalados": 12,
        "totalFuncoes": 15,
        "percentualPreenchido": 80
      }
    ],
    "solicitacoesGerais": [
      {
        "id": "sol1",
        "voluntarioNome": "Maria Silva",
        "ministerioNome": "Louvor",
        "dataSolicitacao": "2026-02-10T14:30:00.000Z",
        "tipo": "entrada"
      }
    ]
  }
}
```
