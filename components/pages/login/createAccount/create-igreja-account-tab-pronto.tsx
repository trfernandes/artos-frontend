import { View, StyleSheet } from 'react-native';
import { useFormContext, useWatch } from 'react-hook-form';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import { ThemePalette } from '../../../../constants/colors';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../utils/color_utils';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';
import { BILLING_TRIAL_DAYS } from '../../../../domain/utils/billing-plan-catalog';

export default function CreateIgrejaAccountTabPronto() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { control } = useFormContext<LoginCreateIgrejaFormData>();

  const [nome, cidade, uf, responsavelNome, responsavelEmail, responsavelWhatsapp] = useWatch({
    control,
    name: ['nome', 'cidade', 'uf', 'responsavelNome', 'responsavelEmail', 'responsavelWhatsapp'],
  });

  const linhas: { label: string; valor: string }[] = [
    { label: 'Igreja', valor: nome || '—' },
    { label: 'Cidade/UF', valor: cidade ? `${cidade} / ${(uf || '').toUpperCase()}` : '—' },
    { label: 'Responsável', valor: responsavelNome || '—' },
    { label: 'E-mail', valor: responsavelEmail || '—' },
    { label: 'WhatsApp', valor: responsavelWhatsapp || '—' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='check'
          size={20}
          color={palette.fonts.light}
        />
      </View>
      <FancyText type='bold' size='medium' color={palette.fonts.dark} style={styles.title}>
        Tudo pronto
      </FancyText>
      <FancyText size='small' color={palette.fonts.inactive} style={styles.subtitle}>
        Confira os dados antes de finalizar.
      </FancyText>

      <View style={styles.card}>
        <View style={styles.resumo}>
          {linhas.map((linha) => (
            <View key={linha.label} style={styles.linha}>
              <FancyText size='extraSmall' color={palette.fonts.inactive} style={styles.linhaLabel}>
                {linha.label}
              </FancyText>
              <FancyText
                size='small'
                color={palette.fonts.dark}
                style={styles.linhaValor}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {linha.valor}
              </FancyText>
            </View>
          ))}
        </View>

        <View style={styles.trialFaixa}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='gift-outline'
            size={18}
            color={palette.primary}
          />
          <FancyText size='small' color={palette.fonts.dark} style={styles.trialTexto}>
            <FancyText size='small' type='bold' color={palette.fonts.dark}>
              {BILLING_TRIAL_DAYS} dias grátis
            </FancyText>
          </FancyText>
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.confirm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 20,
      opacity: 0.85,
    },
    card: {
      width: '100%',
      marginTop: 8,
      borderRadius: 12,
      backgroundColor: palette.backgroundColor2,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    resumo: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    linhaLabel: {
      flexShrink: 0,
    },
    linhaValor: {
      flexShrink: 1,
      textAlign: 'right',
    },
    trialFaixa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: ColorUtils.withAlpha(palette.fonts.dark, 0.08),
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1),
    },
    trialTexto: {
      flexShrink: 1,
    },
  });
}
