import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { DashboardMinisterioStatsDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { Image } from 'expo-image';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

type MinisterioStatsCardProps = {
  ministerio: DashboardMinisterioStatsDto;
  variant?: 'compact' | 'full';
  onPress?: () => void;
};

type ProgressStyles = ReturnType<typeof createProgressStyles>;
type StatStyles = ReturnType<typeof createStatStyles>;
type FullStyles = ReturnType<typeof createFullStyles>;
type CompactStyles = ReturnType<typeof createCompactStyles>;

export default function MinisterioStatsCard({
  ministerio,
  variant = 'full',
  onPress,
}: MinisterioStatsCardProps) {
  const palette = usePallete();
  const progressStyles = useThemedStyles(createProgressStyles);
  const statStyles = useThemedStyles(createStatStyles);
  const fullStyles = useThemedStyles(createFullStyles);
  const compactStyles = useThemedStyles(createCompactStyles);

  if (variant === 'compact') {
    return (
      <CompactCard
        ministerio={ministerio}
        onPress={onPress}
        palette={palette}
        progressStyles={progressStyles}
        compactStyles={compactStyles}
      />
    );
  }

  return (
    <FullCard
      ministerio={ministerio}
      onPress={onPress}
      palette={palette}
      progressStyles={progressStyles}
      statStyles={statStyles}
      fullStyles={fullStyles}
    />
  );
}

function MinisterioLogo({
  url,
  size = 36,
  palette,
}: {
  url?: string;
  size?: number;
  palette: ThemePalette;
}) {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit='cover'
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: ColorUtils.withAlpha(palette.primary, 0.15),
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='account-group'
        size={size * 0.5}
        color={palette.primary}
      />
    </View>
  );
}

function ProgressBar({
  percent,
  palette,
  styles,
}: {
  percent: number;
  palette: ThemePalette;
  styles: ProgressStyles;
}) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const barColor =
    clampedPercent >= 80 ? palette.confirm : clampedPercent >= 50 ? palette.warning : palette.error;

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View
          style={[styles.barFill, { width: `${clampedPercent}%`, backgroundColor: barColor }]}
        />
      </View>
      <FancyText size='extraSmall' type='bold' color={barColor}>
        {Math.round(clampedPercent)}%
      </FancyText>
    </View>
  );
}

function StatItem({
  icon,
  value,
  label,
  color,
  palette,
  styles,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
  palette: ThemePalette;
  styles: StatStyles;
}) {
  return (
    <View style={styles.item}>
      <DefaultIcons.Custom library='MaterialCommunityIcons' name={icon} size={14} color={color} />
      <FancyText size='medium' type='bold' color={palette.fonts.dark}>
        {value}
      </FancyText>
      <FancyText size='extraSmall' type='normal' color={palette.fonts.inactive}>
        {label}
      </FancyText>
    </View>
  );
}

function FullCard({
  ministerio,
  onPress,
  palette,
  progressStyles,
  statStyles,
  fullStyles,
}: {
  ministerio: DashboardMinisterioStatsDto;
  onPress?: () => void;
  palette: ThemePalette;
  progressStyles: ProgressStyles;
  statStyles: StatStyles;
  fullStyles: FullStyles;
}) {
  const percentual = ministerio.percentualPreenchimento;
  const funcoesDescobertas = ministerio.funcoesDescobertas ?? 0;

  return (
    <Pressable onPress={onPress} style={fullStyles.container}>
      <View style={fullStyles.header}>
        <MinisterioLogo url={ministerio.ministerioLogoUrl} size={40} palette={palette} />
        <View style={fullStyles.headerText}>
          <FancyText size='medium' type='bold' color={palette.fonts.dark} numberOfLines={1}>
            {ministerio.ministerioNome}
          </FancyText>
        </View>
      </View>

      {percentual !== undefined && (
        <ProgressBar percent={percentual} palette={palette} styles={progressStyles} />
      )}

      <View style={fullStyles.statsRow}>
        <StatItem
          icon='account-group'
          value={ministerio.totalVoluntarios}
          label='Voluntários'
          color={palette.primary}
          palette={palette}
          styles={statStyles}
        />
        <StatItem
          icon='briefcase-outline'
          value={ministerio.totalFuncoes}
          label='Funções'
          color={palette.confirm}
          palette={palette}
          styles={statStyles}
        />
        <StatItem
          icon='calendar-check'
          value={ministerio.totalEscalasAtivas}
          label='Escalas'
          color={palette.warning}
          palette={palette}
          styles={statStyles}
        />
      </View>

      {funcoesDescobertas > 0 && (
        <View style={fullStyles.alertRow}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='alert-circle-outline'
            size={14}
            color={palette.warning}
          />
          <FancyText size='small' type='medium' color={palette.warning}>
            {funcoesDescobertas}{' '}
            {funcoesDescobertas === 1 ? 'função sem escala' : 'funções sem escala'}
          </FancyText>
        </View>
      )}
    </Pressable>
  );
}

function CompactCard({
  ministerio,
  onPress,
  palette,
  progressStyles,
  compactStyles,
}: {
  ministerio: DashboardMinisterioStatsDto;
  onPress?: () => void;
  palette: ThemePalette;
  progressStyles: ProgressStyles;
  compactStyles: CompactStyles;
}) {
  const percentual = ministerio.percentualPreenchimento;

  return (
    <Pressable onPress={onPress} style={compactStyles.container}>
      <View style={compactStyles.header}>
        <MinisterioLogo url={ministerio.ministerioLogoUrl} size={32} palette={palette} />
        <FancyText
          size='medium'
          type='bold'
          color={palette.fonts.dark}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {ministerio.ministerioNome}
        </FancyText>
      </View>

      {percentual !== undefined && (
        <ProgressBar percent={percentual} palette={palette} styles={progressStyles} />
      )}

      <View style={compactStyles.statsRow}>
        <View style={compactStyles.statItem}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='account-group'
            size={12}
            color={palette.primary}
          />
          <FancyText size='small' type='bold' color={palette.fonts.dark}>
            {ministerio.totalVoluntarios}
          </FancyText>
        </View>
        <View style={compactStyles.statItem}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='briefcase-outline'
            size={12}
            color={palette.confirm}
          />
          <FancyText size='small' type='bold' color={palette.fonts.dark}>
            {ministerio.totalFuncoes}
          </FancyText>
        </View>
        <View style={compactStyles.statItem}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='calendar-check'
            size={12}
            color={palette.warning}
          />
          <FancyText size='small' type='bold' color={palette.fonts.dark}>
            {ministerio.totalEscalasAtivas}
          </FancyText>
        </View>
      </View>
    </Pressable>
  );
}

function createProgressStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    barBackground: {
      flex: 1,
      height: 6,
      backgroundColor: palette.disabled,
      borderRadius: 3,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 3,
    },
  });
}

function createStatStyles(palette: ThemePalette) {
  return StyleSheet.create({
    item: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
      padding: 8,
      backgroundColor: palette.backgroundColor3,
      borderRadius: 10,
    },
  });
}

function createFullStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor2,
      borderRadius: 16,
      padding: 14,
      gap: 12,
      ...palette.shadows[100],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerText: {
      flex: 1,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    alertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.border,
    },
  });
}

function createCompactStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: 220,
      backgroundColor: palette.backgroundColor2,
      borderRadius: 16,
      padding: 12,
      gap: 10,
      ...palette.shadows[100],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });
}
