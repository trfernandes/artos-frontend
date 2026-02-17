import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardEventoProximoDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import ScaleFillIndicator from '../../indicators/ScaleFillIndicator';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

type EventoProximoCardProps = {
  evento: DashboardEventoProximoDto;
  variant?: 'vertical' | 'horizontal';
  onPress?: () => void;
};

export default function EventoProximoCard({ evento, variant = 'vertical', onPress }: EventoProximoCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const dataEvento = parseISO(evento.dataInicio);
  const dataFormatada = format(dataEvento, "dd 'de' MMMM", { locale: ptBR });
  const horaFormatada = format(dataEvento, 'HH:mm', { locale: ptBR });

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, variant === 'horizontal' && styles.horizontalContainer]}
    >
      <View style={[styles.leftColorLine, { backgroundColor: evento.cor || palette.primary }]} />

      <View style={styles.content}>
        <FancyText
          size="small"
          type="semiBold"
          color={palette.fonts.dark}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {evento.nome}
        </FancyText>

        <View style={styles.infoRow}>
          <DefaultIcons.Custom library="MaterialCommunityIcons" name="calendar" size={12} color={palette.primary} />
          <FancyText size="extraSmall" type="medium" color={palette.fonts.inactive}>
            {dataFormatada} às {horaFormatada}
          </FancyText>
        </View>

        {evento.local && (
          <View style={styles.infoRow}>
            <DefaultIcons.Custom library="MaterialCommunityIcons" name="map-marker-outline" size={12} color={palette.primary} />
            <FancyText size="extraSmall" type="medium" color={palette.fonts.inactive} numberOfLines={1}>
              {evento.local}
            </FancyText>
          </View>
        )}

        <View style={styles.progressSection}>
          <ScaleFillIndicator
            filledCount={evento.totalConfirmados}
            totalCount={evento.totalFuncoes}
            label='confirmados'
            showContainer={false}
            size='compact'
            centerColor={palette.backgroundColor4}
            textColor={palette.fonts.inactive}
            percentColor={palette.fonts.inactive}
            textType='medium'
            textSize='extraSmall'
            donutSize={9}
            donutStrokeWidth={1.6}
          />
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.backgroundColor4,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
      borderRadius: 18,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    horizontalContainer: {
      width: 248,
    },
    leftColorLine: {
      width: 4,
      borderRadius: 3,
      alignSelf: 'stretch',
      marginVertical: 15,
      marginLeft: 10,
      marginRight: 12,
    },
    content: {
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 16,
      gap: 5,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    progressSection: {
      marginTop: 1,
    },
  });
}
