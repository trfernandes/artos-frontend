import z from 'zod';

/**
 * Valida se é um número de celular válido no Brasil
 * Formato esperado: 11 dígitos (apenas números) - DDD (2) + 9 + número (8)
 * Aceita entrada formatada (XX) 9XXXX-XXXX ou apenas números
 */
const celularBrasilRegex = /^[1-9][1-9]9\d{8}$/;

function validarCelularBrasil(value: string): boolean {
  // Remove tudo que não é número
  const apenasNumeros = value.replace(/\D/g, '');

  // Deve ter 11 dígitos
  if (apenasNumeros.length !== 11) {
    return false;
  }

  // Valida formato: DDD válido + começa com 9
  return celularBrasilRegex.test(apenasNumeros);
}

export const LoginCreateIgrejaSchema = z
  .object({
    nome: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .max(120, 'Nome deve ter no máximo 120 caracteres'),
    cidade: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .max(80, 'Cidade deve ter no máximo 80 caracteres'),
    uf: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .length(2, 'UF deve ter 2 caracteres'),
    codigo: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .max(32, 'Código deve ter no máximo 32 caracteres'),
    responsavelNome: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .max(255, 'Nome deve ter no máximo 255 caracteres'),
    responsavelEmail: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .email('E-mail inválido'),
    responsavelSenha: z.string('Campo obrigatório').min(6, 'Senha deve ter no mínimo 6 caracteres'),
    responsavelConfirmarSenha: z
      .string('Campo obrigatório')
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    responsavelWhatsapp: z
      .string('Campo obrigatório')
      .min(1, 'Campo obrigatório')
      .refine(validarCelularBrasil, {
        message: 'Número de celular inválido. Use o formato (XX) 9XXXX-XXXX',
      }),
    plano: z.enum(['starter', 'essencial', 'crescimento'], {
      message: 'Selecione um plano',
    }),
    ciclo: z.enum(['MONTHLY', 'YEARLY'], {
      message: 'Selecione a cobrança',
    }),
    modoCadastroPlano: z.enum(['avaliacao', 'plano'], {
      message: 'Selecione como deseja começar',
    }),
  })
  .refine((data) => data.responsavelSenha === data.responsavelConfirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['responsavelConfirmarSenha'],
  });

// Campos por etapa para validação parcial
export const LoginCreateIgrejaStepFields = {
  0: ['nome', 'cidade', 'uf', 'codigo'] as const,
  1: [
    'responsavelNome',
    'responsavelEmail',
    'responsavelSenha',
    'responsavelConfirmarSenha',
    'responsavelWhatsapp',
  ] as const,
  2: ['plano', 'ciclo', 'modoCadastroPlano'] as const,
  3: [] as const,
};

export type LoginCreateIgrejaFormData = z.infer<typeof LoginCreateIgrejaSchema>;
