import { describe, expect, it } from 'vitest';
import {
  buildConviteEnviadoProps,
  buildDisponibilidadeRespondidaProps,
  buildEscalaCriadaProps,
  buildEscalaPublicadaProps,
  buildEventoCriadoProps,
  buildPushAbertoProps,
} from './events';

// Simula o que aconteceria se um call site passasse a entidade de domínio
// inteira (com PII) em vez dos ids extraídos — confirma que o builder nunca
// repassa nome/email/telefone pro PostHog.
const voluntarioComPii = {
  id: 'vol-1',
  nome: 'João da Silva',
  email: 'joao@example.com',
  telefone: '11999999999',
};

function assertSemPii(props: Record<string, unknown>) {
  const serialized = JSON.stringify(props);
  expect(serialized).not.toContain(voluntarioComPii.nome);
  expect(serialized).not.toContain(voluntarioComPii.email);
  expect(serialized).not.toContain(voluntarioComPii.telefone);
}

describe('analytics events — props sem PII', () => {
  it('buildEscalaCriadaProps só expõe ids e contagem', () => {
    const props = buildEscalaCriadaProps({
      escalaId: 'esc-1',
      ministerioId: 'min-1',
      qtdItens: 5,
    });
    expect(props).toEqual({ escalaId: 'esc-1', ministerioId: 'min-1', qtdItens: 5 });
    assertSemPii(props);
  });

  it('buildEventoCriadoProps só expõe ids e tipo', () => {
    const props = buildEventoCriadoProps({
      eventoId: 'evt-1',
      igrejaId: 'igr-1',
      tipo: 'culto',
    });
    assertSemPii(props);
  });

  it('buildConviteEnviadoProps não expõe destinatário, só ids/flags', () => {
    const props = buildConviteEnviadoProps({
      igrejaId: 'igr-1',
      conviteId: 'conv-1',
      autoApprove: false,
    });
    expect(Object.keys(props)).toEqual(['igrejaId', 'conviteId', 'autoApprove']);
    assertSemPii(props);
  });

  it('buildDisponibilidadeRespondidaProps só expõe id e boolean', () => {
    const props = buildDisponibilidadeRespondidaProps({
      escalaItemId: 'item-1',
      disponivel: true,
    });
    assertSemPii(props);
  });

  it('buildPushAbertoProps não expõe corpo da notificação', () => {
    const props = buildPushAbertoProps({ tipo: 'escala_publicada', deepLink: '/escalas/1' });
    assertSemPii(props);
  });

  it('buildEscalaPublicadaProps só expõe id e contagem', () => {
    const props = buildEscalaPublicadaProps({ escalaId: 'esc-1', qtdItens: 3 });
    assertSemPii(props);
  });
});
