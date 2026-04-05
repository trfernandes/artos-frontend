import { z } from 'zod';
import { ModoEntradaEnum } from '../enums/modo-entrada.enum';

// Schema para validação de dados cadastrais
export const dadosSchema = z.object({
  nome: z.string().min(1, 'Campo obrigatório'),
  endereco: z.object({
    cep: z
      .string()
      .min(1, 'Campo obrigatório')
      .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    rua: z.string().min(1, 'Campo obrigatório'),
    numero: z.string().min(1, 'Campo obrigatório'),
    complemento: z.string().optional(),
    cidade: z.string().min(1, 'Campo obrigatório'),
    uf: z
      .string()
      .min(1, 'Campo obrigatório')
      .max(2, 'UF inválida')
      .regex(/^[A-Z]{2}$/, 'UF inválida'),
  }),
  telefone: z.string().refine(
    (value) => value === '' || /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(value),
    'Telefone inválido',
  ),
  email: z.string().refine(
    (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Email inválido',
  ),
  logoUrl: z.string().optional().nullable(),
});

export const faturamentoSchema = z.object({
  cnpj: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^\d{14}$/, 'CNPJ inválido'),
  telefoneCobranca: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^\d{10,11}$/, 'Telefone inválido'),
  emailCobranca: z.string().refine(
    (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Email inválido',
  ),
  cep: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^\d{8}$/, 'CEP inválido'),
  rua: z.string().min(1, 'Campo obrigatório'),
  numero: z.string().min(1, 'Campo obrigatório'),
  bairro: z.string().min(1, 'Campo obrigatório'),
  cidade: z.string().min(1, 'Campo obrigatório'),
  cidadeIbge: z
    .string()
    .min(1, 'Selecione uma cidade válida')
    .regex(/^\d+$/, 'Cidade inválida'),
  uf: z
    .string()
    .min(1, 'Campo obrigatório')
    .max(2, 'UF inválida')
    .regex(/^[A-Z]{2}$/, 'UF inválida'),
  complemento: z.string(),
});

// Schema para validação de modo de entrada
export const modoEntradaSchema = z.object({
  modoEntrada: z.nativeEnum(ModoEntradaEnum, {
    message: 'Modo de entrada inválido',
  }),
});

// Schema para validação de notificações
export const notificacoesSchema = z.object({
  notificacoesHabilitadas: z.boolean(),
  lembretesHoras: z
    .array(z.number().int().min(1).max(168))
    .min(1, 'Selecione ao menos um lembrete'),
  canaisPush: z.boolean(),
  canaisWhatsapp: z.boolean(),
});

// Tipos TypeScript inferidos dos schemas
export type DadosFormData = z.infer<typeof dadosSchema>;
export type FaturamentoFormData = z.infer<typeof faturamentoSchema>;
export type ModoEntradaFormData = z.infer<typeof modoEntradaSchema>;
export type NotificacoesFormData = z.infer<typeof notificacoesSchema>;
