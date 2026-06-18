import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { DashboardEventoProximoDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import ScaleFillIndicator from '../../indicators/ScaleFillIndicator';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';
import { resolveEventoEnsaioInfo } from '../../../utils/evento-ensaio';
import { formatAppDateTime } from '../../../utils/date_utils';

type EventoProximoCardProps = {
  evento: DashboardEventoProximoDto;
  variant?: 'vertical' | 'horizontal';
  onPress?: () => void;
};

export default function EventoProximoCard({
  evento,
  variant = 'vertical',
  onPress,
}: EventoProximoCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const dataFormatada = formatAppDateTime(evento.dataInicio, "dd 'de' MMMM") ?? '';
  const horaFormatada = formatAppDateTime(evento.dataInicio, 'HH:mm') ?? '';
  const ensaioInfo = resolveEventoEnsaioInfo({
    horarioEnsaio: evento.horarioEnsaio,
    horarioEnsaioPadrao: evento.evento?.horarioEnsaioPadrao,
  });

  const accentColor = evento.cor || palette.primary;

  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.container, styles.horizontalContainer]}
      >
        {/* Inner view handles overflow:hidden so the accent strip respects border-radius
            without clipping the shadow on the outer Pressable (Android limitation) */}
        <View style={styles.horizontalInner}>
          <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
          <View style={styles.content}>
            <View style={styles.dateChip}>
              <FancyText size='extraSmall' type='semiBold' color={accentColor}>
                {dataFormatada}
              </FancyText>
            </View>
            <FancyText
              size='small'
              type='semiBold'
              color={palette.fonts.dark}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {evento.nome}
            </FancyText>
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive} numberOfLines={1}>
              {horaFormatada}
              {evento.local ? `  ·  ${evento.local}` : ''}
            </FancyText>
            <View style={styles.progressSection}>
              <ScaleFillIndicator
                filledCount={evento.totalConfirmados}
                totalCount={evento.totalFuncoes}
                label='confirmados'
                showContainer={false}
                size='compact'
                centerColor={palette.backgroundColor}
                textColor={palette.fonts.inactive}
                percentColor={accentColor}
                textType='medium'
                textSize='extraSmall'
                donutSize={9}
                donutStrokeWidth={1.6}
              />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.leftColorLine, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <FancyText size='small' type='semiBold' color={palette.fonts.dark} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
          {evento.nome}
        </FancyText>
        <View style={styles.infoRow}>
          <DefaultIcons.Custom library='MaterialCommunityIcons' name='calendar' size={12} color={palette.primary} />
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            {dataFormatada} às {horaFormatada}
          </FancyText>
        </View>
        {ensaioInfo.shouldShow && (
          <View style={styles.infoRow}>
            <DefaultIcons.Custom library='MaterialCommunityIcons' name='music-box-outline' size={12} color={palette.primary} />
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive} numberOfLines={1}>
              {ensaioInfo.label}
            </FancyText>
          </View>
        )}
        {evento.local && (
          <View style={styles.infoRow}>
            <DefaultIcons.Custom library='MaterialCommunityIcons' name='map-marker-outline' size={12} color={palette.primary} />
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive} numberOfLines={1}>
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
      backgroundColor: palette.backgroundColor,
      borderWidth: 0.5,
      borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
      borderRadius: 18,
      ...palette.shadows[200],
    },
    horizontalContainer: {
      width: 220,
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    horizontalInner: {
      flex: 1,
      borderRadius: 17,
      overflow: 'hidden',
    },
    accentStrip: {
      height: 3,
      width: '100%',
    },
    dateChip: {
      alignSelf: 'flex-start',
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1),
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
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
      padding: 12,
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
