import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';
import FancyText from '../../../../FancyText';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { ThemePalette } from '../../../../../constants/colors';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../../utils/color_utils';

export default function AssistenteResultadoStep() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { resultado } = useAssistenteEscala();

  const periodoResumo = useMemo(
    () =>
      `${format(DateUtilsApi.dateOnlyFromApi(resultado.dataInicio), 'dd MMM', { locale: ptBR })} – ${format(
        DateUtilsApi.dateOnlyFromApi(resultado.dataTermino),
        'dd MMM yyyy',
        { locale: ptBR },
      )}`,
    [resultado.dataInicio, resultado.dataTermino],
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.14) },
            ]}
          >
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='clock-fast'
              size={40}
              color={palette.secondary}
            />
          </View>
          <FancyText size='large' type='bold' color={palette.fonts.dark} style={styles.title}>
            Geração iniciada!
          </FancyText>
          <FancyText
            size='small'
            type='medium'
            color={palette.fonts.inactive}
            style={styles.subtitle}
          >
            A escala está sendo processada em segundo plano. Você receberá uma notificação ao
            concluir.
          </FancyText>
        </View>

        <View
          style={[styles.infoCard, { borderColor: ColorUtils.withAlpha(palette.secondary, 0.18) }]}
        >
          <View style={styles.infoRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='table-edit'
              size={14}
              color={palette.secondary}
            />
            <FancyText size='small' type='semiBold' color={palette.fonts.dark} numberOfLines={1}>
              {resultado.nome}
            </FancyText>
          </View>
          <View style={styles.infoRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='calendar-range'
              size={14}
              color={palette.fonts.inactive}
            />
            <FancyText size='small' type='medium' color={palette.fonts.inactive}>
              {periodoResumo}
            </FancyText>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 10,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 620,
      alignSelf: 'center',
      paddingHorizontal: 14,
      gap: 24,
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      gap: 10,
    },
    iconBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 280,
    },
    infoCard: {
      width: '100%',
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: palette.backgroundColor,
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 8,
      ...palette.shadows[100],
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
}
