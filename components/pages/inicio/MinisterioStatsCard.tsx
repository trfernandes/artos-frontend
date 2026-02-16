import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';
import { DashboardMinisterioStatsDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { Image } from 'expo-image';

type MinisterioStatsCardProps = {
  ministerio: DashboardMinisterioStatsDto;
  variant?: 'compact' | 'full';
  onPress?: () => void;
};

export default function MinisterioStatsCard({ ministerio, variant = 'full', onPress }: MinisterioStatsCardProps) {
  if (variant === 'compact') {
    return <CompactCard ministerio={ministerio} onPress={onPress} />;
  }

  return <FullCard ministerio={ministerio} onPress={onPress} />;
}

function MinisterioLogo({ url, size = 36 }: { url?: string; size?: number }) {
  if (url) {
    return <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
  }

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${Pallete.primary}15`, justifyContent: 'center', alignItems: 'center' }}>
      <DefaultIcons.Custom library="MaterialCommunityIcons" name="account-group" size={size * 0.5} color={Pallete.primary} />
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const barColor = clampedPercent >= 80 ? Pallete.confirm : clampedPercent >= 50 ? Pallete.warning : Pallete.error;

  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.barBackground}>
        <View style={[progressStyles.barFill, { width: `${clampedPercent}%`, backgroundColor: barColor }]} />
      </View>
      <FancyText size="extraSmall" type="bold" color={barColor}>
        {Math.round(clampedPercent)}%
      </FancyText>
    </View>
  );
}

function StatItem({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <View style={statStyles.item}>
      <DefaultIcons.Custom library="MaterialCommunityIcons" name={icon} size={14} color={color} />
      <FancyText size="medium" type="bold" color={Pallete.fonts.dark}>
        {value}
      </FancyText>
      <FancyText size="extraSmall" type="normal" color={Pallete.fonts.inactive}>
        {label}
      </FancyText>
    </View>
  );
}

// ---- Variante FULL (para líder) ----
function FullCard({ ministerio, onPress }: { ministerio: DashboardMinisterioStatsDto; onPress?: () => void }) {
  const percentual = ministerio.percentualPreenchimento;
  const funcoesDescobertas = ministerio.funcoesDescobertas ?? 0;

  return (
    <Pressable onPress={onPress} style={fullStyles.container}>
      <View style={fullStyles.header}>
        <MinisterioLogo url={ministerio.ministerioLogoUrl} size={40} />
        <View style={fullStyles.headerText}>
          <FancyText size="largeMedium" type="bold" color={Pallete.fonts.dark} numberOfLines={1}>
            {ministerio.ministerioNome}
          </FancyText>
        </View>
      </View>

      {percentual !== undefined && <ProgressBar percent={percentual} />}

      <View style={fullStyles.statsRow}>
        <StatItem icon="account-group" value={ministerio.totalVoluntarios} label="Voluntários" color={Pallete.primary} />
        <StatItem icon="briefcase-outline" value={ministerio.totalFuncoes} label="Funções" color={Pallete.confirm} />
        <StatItem icon="calendar-check" value={ministerio.totalEscalasAtivas} label="Escalas" color={Pallete.warning} />
      </View>

      {funcoesDescobertas > 0 && (
        <View style={fullStyles.alertRow}>
          <DefaultIcons.Custom library="MaterialCommunityIcons" name="alert-circle-outline" size={14} color={Pallete.warning} />
          <FancyText size="small" type="medium" color={Pallete.warning}>
            {funcoesDescobertas} {funcoesDescobertas === 1 ? 'função sem escala' : 'funções sem escala'}
          </FancyText>
        </View>
      )}
    </Pressable>
  );
}

// ---- Variante COMPACT (para admin scroll horizontal) ----
function CompactCard({ ministerio, onPress }: { ministerio: DashboardMinisterioStatsDto; onPress?: () => void }) {
  const percentual = ministerio.percentualPreenchimento;

  return (
    <Pressable onPress={onPress} style={compactStyles.container}>
      <View style={compactStyles.header}>
        <MinisterioLogo url={ministerio.ministerioLogoUrl} size={32} />
        <FancyText size="medium" type="bold" color={Pallete.fonts.dark} numberOfLines={1} style={{ flex: 1 }}>
          {ministerio.ministerioNome}
        </FancyText>
      </View>

      {percentual !== undefined && <ProgressBar percent={percentual} />}

      <View style={compactStyles.statsRow}>
        <View style={compactStyles.statItem}>
          <DefaultIcons.Custom library="MaterialCommunityIcons" name="account-group" size={12} color={Pallete.primary} />
          <FancyText size="small" type="bold" color={Pallete.fonts.dark}>{ministerio.totalVoluntarios}</FancyText>
        </View>
        <View style={compactStyles.statItem}>
          <DefaultIcons.Custom library="MaterialCommunityIcons" name="briefcase-outline" size={12} color={Pallete.confirm} />
          <FancyText size="small" type="bold" color={Pallete.fonts.dark}>{ministerio.totalFuncoes}</FancyText>
        </View>
        <View style={compactStyles.statItem}>
          <DefaultIcons.Custom library="MaterialCommunityIcons" name="calendar-check" size={12} color={Pallete.warning} />
          <FancyText size="small" type="bold" color={Pallete.fonts.dark}>{ministerio.totalEscalasAtivas}</FancyText>
        </View>
      </View>
    </Pressable>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Pallete.disabled,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});

const statStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    padding: 8,
    backgroundColor: Pallete.backgroundColor3,
    borderRadius: 10,
  },
});

const fullStyles = StyleSheet.create({
  container: {
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    ...Pallete.shadows[100],
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
    borderTopColor: Pallete.border,
  },
});

const compactStyles = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    ...Pallete.shadows[100],
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
