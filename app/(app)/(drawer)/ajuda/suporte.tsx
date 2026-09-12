import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import FancyPageView from '../../../../components/containers/FancyPageView';
import FancyScrollView from '../../../../components/FancyScrollView';
import FancyText from '../../../../components/FancyText';
import FancyVerticalSpacer from '../../../../components/FancyVerticalSpacer';
import FancyListItemCard from '../../../../components/cards/FancyListItemCard';
import { usePallete } from '../../../../hooks/usePallete';
import { ColorUtils } from '../../../../utils/color_utils';
import {
  SuporteTipoEnum,
  SuporteTipoEnumDescricao,
  SuporteTipoEnumLabel,
} from '../../../../domain/enums/Suporte/suporte-tipo.enum';

type Faq = { pergunta: string; resposta: string };

const FAQ_ITEMS: Faq[] = [
  {
    pergunta: 'Como crio minha primeira escala?',
    resposta:
      'No ministério, abra a aba Escalas e toque em "+". O assistente guia você por evento, funções e voluntários passo a passo.',
  },
  {
    pergunta: 'Como convido um voluntário pra igreja?',
    resposta:
      'Em Configurações > Voluntários (ou dentro do ministério), toque em "Convidar" e envie o link — o voluntário aceita e já entra vinculado à igreja.',
  },
  {
    pergunta: 'Como funciona o período de teste de 14 dias?',
    resposta:
      'Toda igreja nova começa com 14 dias de teste grátis, com acesso completo. Perto do fim, o app avisa pra você escolher um plano em Configurações > Assinatura.',
  },
  {
    pergunta: 'Como troco de plano ou cancelo?',
    resposta:
      'Vá em Configurações > Assinatura e toque em "Gerenciar assinatura" — lá dá pra trocar de plano ou cancelar diretamente.',
  },
  {
    pergunta: 'Meus dados estão seguros?',
    resposta:
      'Sim. Os dados da sua igreja ficam isolados dos de outras igrejas e seguem a LGPD. Você pode pedir exportação ou exclusão a qualquer momento falando com a gente.',
  },
];

const TIPO_CONFIG: Record<
  SuporteTipoEnum,
  { icon: string; colorKey: 'warning' | 'error' | 'secondary' | 'confirm' }
> = {
  [SuporteTipoEnum.Sugestao]: { icon: 'lightbulb-outline', colorKey: 'warning' },
  [SuporteTipoEnum.Reclamacao]: { icon: 'alert-circle-outline', colorKey: 'error' },
  [SuporteTipoEnum.Bug]: { icon: 'bug-outline', colorKey: 'secondary' },
  [SuporteTipoEnum.ComercialAjuda]: { icon: 'handshake-outline', colorKey: 'confirm' },
};

export default function AjudaSuportePage() {
  const palette = usePallete();
  const [faqAberta, setFaqAberta] = useState<number | null>(null);

  const handleAbrirForm = (tipo: SuporteTipoEnum) => {
    router.push({ pathname: '/ajuda/suporte-form', params: { tipo } });
  };

  return (
    <FancyPageView style={styles.container}>
      <FancyScrollView contentContainerStyle={styles.scrollContent}>
        <FancyText size='small' type='semiBold'>
          Perguntas frequentes
        </FancyText>
        <FancyVerticalSpacer height={4} />

        {FAQ_ITEMS.map((faq, index) => {
          const aberta = faqAberta === index;
          return (
            <FancyListItemCard
              key={faq.pergunta}
              title={faq.pergunta}
              subtitle={aberta ? faq.resposta : undefined}
              onPress={() => setFaqAberta(aberta ? null : index)}
              trailing={{ type: 'chevron', onPress: () => setFaqAberta(aberta ? null : index) }}
              containerStyle={styles.faqCard}
            />
          );
        })}

        <FancyVerticalSpacer height={20} />

        <FancyText size='small' type='semiBold'>
          Não achou? Fala com a gente
        </FancyText>
        <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
          Escolha o assunto — a gente responde por e-mail em até 2 dias úteis.
        </FancyText>
        <FancyVerticalSpacer height={8} />

        {(Object.values(SuporteTipoEnum) as SuporteTipoEnum[]).map((tipo) => {
          const config = TIPO_CONFIG[tipo];
          const color = palette[config.colorKey];
          return (
            <FancyListItemCard
              key={tipo}
              title={SuporteTipoEnumLabel[tipo]}
              subtitle={SuporteTipoEnumDescricao[tipo]}
              onPress={() => handleAbrirForm(tipo)}
              leading={{
                type: 'icon',
                icon: { library: 'MaterialCommunityIcons', name: config.icon, size: 20 },
                color,
                backgroundColor: ColorUtils.withAlpha(color, 0.12),
              }}
              trailing={{ type: 'chevron', onPress: () => handleAbrirForm(tipo) }}
              containerStyle={styles.tipoCard}
            />
          );
        })}
      </FancyScrollView>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, paddingTop: 5 },
  scrollContent: { gap: 8, paddingBottom: 24 },
  faqCard: { marginBottom: 0 },
  tipoCard: { marginBottom: 0 },
});
