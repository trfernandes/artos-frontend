// `motivo` é opcional no DTO do backend (CreateSubstituicaoPedidoDto), mas
// obrigatório aqui por decisão de design — validado via zod no formulário.
export type CreateSubstituicaoPedidoDto = {
  escalaItemId: string;
  motivo: string;
};
