import z from 'zod';

export const RepertorioMusicaSchema = z.object({
  nome: z.string('Campo obrigatório').trim().min(1, 'Campo obrigatório'),
  etiquetaIds: z.array(z.string()),
  interprete: z.string().optional(),
  versaoUrl: z.string().optional(),
  tomOriginal: z.string().optional(),
  bpmOriginal: z.coerce.number<number>().min(0).max(300).optional(),
  observacoes: z.string().optional(),
  letraMarkdown: z.string().optional(),
  cifraMarkdown: z.string().optional(),
});

export type RepertorioMusicaFormData = z.infer<typeof RepertorioMusicaSchema>;
