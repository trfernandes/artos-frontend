import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardEscalaItemDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { Image } from 'expo-image';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';
import { resolveEventoEnsaioInfo } from '../../../utils/evento-ensaio';

type ProximaEscalaCardProps = {
  escala: DashboardEscalaItemDto;
  onPress?: () => void;
};

export default function ProximaEscalaCard({ escala, onPress }: ProximaEscalaCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const dataEvento = parseISO(escala.eventoData);
  const dataFormatada = format(dataEvento, "dd 'de' MMMM", { locale: ptBR });
  const hora = format(dataEvento, 'HH:mm', { locale: ptBR });
  const diaSemana = format(dataEvento, 'EEEE', { locale: ptBR });
  const diaSemanaCapitalized = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  const ensaioInfo = resolveEventoEnsaioInfo({
    horarioEnsaio: escala.horarioEnsaio,
    horarioEnsaioPadrao: escala.evento?.horarioEnsaioPadrao,
  });

  const accentColor = escala.eventoCor || palette.primary;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {/* Inner view handles overflow:hidden so the accent strip respects border-radius
          without clipping the shadow on the outer Pressable (Android limitation) */}
      <View style={styles.inner}>
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
        <View style={styles.content}>
          {/* Chip de data + status dot */}
          <View style={styles.topRow}>
            <View
              style={[styles.dateChip, { backgroundColor: ColorUtils.withAlpha(accentColor, 0.1) }]}
            >
              <FancyText size='extraSmall' type='semiBold' color={accentColor}>
                {dataFormatada}
              </FancyText>
            </View>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: escala.isConfirmado ? palette.confirm : palette.warning },
              ]}
            />
          </View>

          {/* Nome do evento */}
          <FancyText
            size='small'
            type='semiBold'
            color={palette.fonts.dark}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {escala.eventoNome}
          </FancyText>

          {/* Dia da semana + hora */}
          <FancyText
            size='extraSmall'
            type='medium'
            color={palette.fonts.inactive}
            numberOfLines={1}
          >
            {diaSemanaCapitalized} · {hora}
          </FancyText>

          {/* Função */}
          <View style={styles.infoRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='briefcase-outline'
              size={12}
              color={palette.fonts.inactive2}
            />
            <FancyText
              size='extraSmall'
              type='medium'
              color={palette.fonts.inactive}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {escala.funcaoNome}
            </FancyText>
          </View>

          {/* Ensaio (opcional) */}
          {ensaioInfo.shouldShow && (
            <View style={[styles.infoRow, rehearsalBadgeStyle(palette)]}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='music-box-outline'
                size={12}
                color={palette.primary}
              />
              <FancyText
                size='extraSmall'
                type='semiBold'
                color={palette.primary}
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {ensaioInfo.label}
              </FancyText>
            </View>
          )}

          {/* Separador + Ministério */}
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            {escala.ministerioLogoUrl ? (
              <Image
                source={{ uri: escala.ministerioLogoUrl }}
                style={styles.ministerioLogo}
                contentFit='cover'
              />
            ) : (
              <View style={styles.ministerioLogoCircle}>
                <FancyText size='extraSmall' type='bold' color={palette.fonts.light}>
                  {escala.ministerioNome.charAt(0).toUpperCase()}
                </FancyText>
              </View>
            )}
            <FancyText
              size='extraSmall'
              type='medium'
              color={palette.fonts.inactive}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {escala.ministerioNome}
            </FancyText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: 220,
      backgroundColor: palette.backgroundColor,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
      ...palette.shadows[200],
    },
    inner: {
      flex: 1,
      borderRadius: 17,
      overflow: 'hidden',
    },
    accentStrip: {
      height: 3,
      width: '100%',
    },
    content: {
      padding: 12,
      gap: 5,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    dateChip: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    separator: {
      height: 1,
      backgroundColor: ColorUtils.withAlpha(palette.borderCard, 0.35),
      marginVertical: 2,
    },
    ministerioLogo: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    ministerioLogoCircle: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

function rehearsalBadgeStyle(palette: ThemePalette): any {
  return {
    backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: palette.primary,
    marginTop: 2,
  };
}
