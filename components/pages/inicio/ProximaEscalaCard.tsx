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
  const dia = format(dataEvento, 'dd', { locale: ptBR });
  const mes = format(dataEvento, 'MMM', { locale: ptBR }).toUpperCase();
  const hora = format(dataEvento, 'HH:mm', { locale: ptBR });
  const diaSemana = format(dataEvento, 'EEEE', { locale: ptBR });
  const diaSemanaCapitalized = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  // Resolver horário de ensaio usando a mesma lógica de "Minhas Escalas"
  const ensaioInfo = resolveEventoEnsaioInfo({
    horarioEnsaio: escala.horarioEnsaio,
    horarioEnsaioPadrao: escala.evento?.horarioEnsaioPadrao,
  });

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {/* Topo: Data + Status */}
      <View style={styles.topRow}>
        <View style={styles.dateSection}>
          <View style={styles.dateLineRow}>
            <FancyText size="large" type="bold" color={palette.fonts.dark}>
              {dia}
            </FancyText>
            <FancyText size="large" type="bold" color={palette.primary}>
              {mes}
            </FancyText>
          </View>
          <FancyText size="extraSmall" type="semiBold" color={palette.fonts.inactive}>
            {diaSemanaCapitalized} {hora}
          </FancyText>
        </View>

        <View style={[styles.statusDot, { backgroundColor: escala.isConfirmado ? palette.confirm : palette.warning }]} />
      </View>

      {/* Meio: Evento + Função + Ensaio */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <DefaultIcons.Custom library="MaterialCommunityIcons" name="calendar-text" size={12} color={palette.primary} />
          </View>
          <FancyText size="extraSmall" type="semiBold" color={palette.fonts.inactive} numberOfLines={1} style={{ flex: 1 }}>
            {escala.eventoNome}
          </FancyText>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <DefaultIcons.Custom library="MaterialCommunityIcons" name="briefcase-outline" size={12} color={palette.primary} />
          </View>
          <FancyText size="extraSmall" type="semiBold" color={palette.fonts.inactive} numberOfLines={1}>
            {escala.funcaoNome}
          </FancyText>
        </View>
        {ensaioInfo.shouldShow && (
          <>
            <View style={styles.separator} />
            <View style={[styles.infoRow, rehearsalBadgeStyle(palette)]}>
              <DefaultIcons.Custom library="MaterialCommunityIcons" name="music-box-outline" size={14} color={palette.primary} />
              <FancyText size="small" type="semiBold" color={palette.primary} numberOfLines={1} style={{ flex: 1 }}>
                {ensaioInfo.label}
              </FancyText>
            </View>
          </>
        )}
      </View>

      {/* Separador + Rodapé: Ministério */}
      <View style={styles.separator} />
      <View style={styles.infoRow}>
        <View style={styles.infoIconContainer}>
          {escala.ministerioLogoUrl ? (
            <Image source={{ uri: escala.ministerioLogoUrl }} style={styles.ministerioLogo} contentFit="cover" />
          ) : (
            <View style={styles.ministerioLogoCircle}>
              <FancyText size={7} type="bold" color={palette.fonts.light}>
                {escala.ministerioNome.charAt(0).toUpperCase()}
              </FancyText>
            </View>
          )}
        </View>
        <FancyText size="extraSmall" type="medium" color={palette.fonts.inactive} numberOfLines={1} style={{ flex: 1 }}>
          {escala.ministerioNome}
        </FancyText>
      </View>
    </Pressable>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: 200,
      backgroundColor: palette.backgroundColor4,
      borderRadius: 16,
      padding: 10,
      paddingBottom: 8,
      gap: 6,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
      ...palette.shadows[100],
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    dateSection: {
      gap: 2,
    },
    dateLineRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 4,
    },
    infoSection: {
      gap: 4,
      marginBottom: 3,
      marginLeft: -1,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    infoIconContainer: {
      width: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.22),
      marginTop: -2,
      marginBottom: 2,
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
