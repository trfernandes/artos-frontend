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
  telefone: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
  email: z
    .string()
    .min(1, 'Campo obrigatório')
    .email('Email inválido'),
  logoUrl: z.string().optional().nullable(),
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
  antecedenciaHoras: z.number().min(1, 'Antecedência deve ser maior que 0'),
  canaisPush: z.boolean(),
  canaisWhatsapp: z.boolean(),
});

// Tipos TypeScript inferidos dos schemas
export type DadosFormData = z.infer<typeof dadosSchema>;
export type ModoEntradaFormData = z.infer<typeof modoEntradaSchema>;
export type NotificacoesFormData = z.infer<typeof notificacoesSchema>;
