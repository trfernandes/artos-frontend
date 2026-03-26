import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FancyText from '../../../../FancyText';
import { ThemePalette } from '../../../../../constants/colors';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import DefaultIcons from '../../../../FancyIcons';
import EscalaStatusBadge from './EscalaStatusBadge';
import EscalaHealthIndicator from './EscalaHealthIndicator';
import {
  formatPeriod,
  formatRelativeOrDate,
  formatShortDate,
  isStaleUpdate,
  StatusDistribution,
} from './escalaHeader.utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../../utils/color_utils';

export type EscalaHeaderVariant = 'default' | 'compact' | 'leader';

export type InlineAction = {
  key: string;
  icon: { library: 'MaterialIcons' | 'MaterialCommunityIcons'; name: string };
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'neutral' | 'danger';
  disabled?: boolean;
  isLoading?: boolean;
};

export type EscalaHeaderProps = {
  title: string;
  status: EscalaStatusEnum;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
  confirmedCount?: number;
  totalCount?: number;
  statusDistribution?: StatusDistribution;
  variant?: EscalaHeaderVariant;
  onPrimaryActionPress?: () => void;
  primaryActionLabel?: string;
  onOpenDetails?: () => void;
  actions?: InlineAction[];
};

function MetaInlineItem({
  icon,
  value,
}: {
  icon: { library: 'MaterialIcons' | 'MaterialCommunityIcons'; name: string };
  value: string;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.metaInlineItem}>
      <View style={styles.metaInlineIcon}>
        <DefaultIcons.Custom
          library={icon.library}
          name={icon.name}
          size={13}
          color={palette.primary}
        />
      </View>
      <FancyText
        type='medium'
        size='extraSmall'
        color={palette.fonts.dark}
        numberOfLines={1}
        style={styles.metaInlineValue}
      >
        {value}
      </FancyText>
    </View>
  );
}

function ActionIconButton({ action }: { action: InlineAction }) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isDanger = action.variant === 'danger';
  const isPublishAction = action.key === 'publish';
  const isInsightsAction = action.key === 'insights';
  const isParametrizacaoAction = action.key === 'parametrizacao';
  const isDisabled = !!action.disabled || !!action.isLoading;
  const iconColor = isPublishAction || isInsightsAction || isDanger || isParametrizacaoAction
    ? isDisabled
      ? ColorUtils.withAlpha('#FFFFFF', 0.7)
      : '#FFFFFF'
    : isDisabled
      ? palette.icons.inactive
      : palette.icons.dark;
  const iconButtonBackground = isPublishAction
    ? isDisabled
      ? ColorUtils.withAlpha(palette.confirm, 0.55)
      : palette.confirm
    : isInsightsAction
      ? isDisabled
        ? ColorUtils.withAlpha(palette.warning, 0.55)
        : palette.warning
      : isParametrizacaoAction
        ? isDisabled
          ? ColorUtils.withAlpha(palette.secondary, 0.55)
          : palette.secondary
        : isDanger
          ? isDisabled
            ? ColorUtils.withAlpha(palette.error, 0.55)
            : palette.error
          : '#FFFFFF';

  return (
    <Pressable
      onPress={action.onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: iconButtonBackground },
        isPublishAction && { borderWidth: 0 },
        isInsightsAction && { borderWidth: 0 },
        isParametrizacaoAction && { borderWidth: 0 },
        isDanger && { borderWidth: 0 },
        isDisabled && styles.iconButtonDisabled,
        pressed && styles.iconButtonPressed,
      ]}
      hitSlop={6}
      accessibilityRole='button'
      accessibilityLabel={action.label}
      accessibilityState={{ disabled: isDisabled, busy: !!action.isLoading }}
    >
      {action.isLoading ? (
        <ActivityIndicator size='small' color={iconColor} />
      ) : (
        <DefaultIcons.Custom
          library={action.icon.library}
          name={action.icon.name}
          size={17}
          color={iconColor}
        />
      )}
    </Pressable>
  );
}

function PrimaryPillButton({ action }: { action: InlineAction }) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isDisabled = !!action.disabled || !!action.isLoading;

  return (
    <Pressable
      onPress={action.onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.primaryPill,
        isDisabled && styles.primaryPillDisabled,
        pressed && styles.primaryPillPressed,
      ]}
      hitSlop={4}
      accessibilityRole='button'
      accessibilityLabel={action.label}
      accessibilityState={{ disabled: isDisabled, busy: !!action.isLoading }}
    >
      {action.isLoading ? (
        <ActivityIndicator size='small' color={palette.icons.light} />
      ) : (
        <DefaultIcons.Custom
          library={action.icon.library}
          name={action.icon.name}
          size={15}
          color={palette.icons.light}
        />
      )}
      <FancyText type='semiBold' size='extraSmall' color={palette.fonts.light}>
        {action.label}
      </FancyText>
    </Pressable>
  );
}

export default function EscalaHeader({
  title,
  status,
  periodStart,
  periodEnd,
  createdAt,
  updatedAt,
  confirmedCount,
  totalCount,
  statusDistribution,
  variant = 'default',
  onPrimaryActionPress,
  primaryActionLabel,
  onOpenDetails,
  actions,
}: EscalaHeaderProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const createdLabel = `Criada em ${formatShortDate(createdAt, true)}`;
  const updatedLabel = `Atualizada ${formatRelativeOrDate(updatedAt)}`;
  const periodLabel = formatPeriod(periodStart, periodEnd);
  const hasStaleWarning = isStaleUpdate(updatedAt);
  const hasHealth = confirmedCount !== undefined && totalCount !== undefined;
  const showCompact = variant === 'compact';
  const showLeader = variant === 'leader';
  const inlineActions = actions ?? [];
  const hasInlineActions = inlineActions.length > 0;
  const actionsGradientColors: [string, string] = [
    ColorUtils.withAlpha(palette.primary, 0.2),
    ColorUtils.withAlpha(palette.primary, 0.1),
  ];

  return (
    <View style={[styles.surfaceCard, hasInlineActions && styles.surfaceCardWithActions]}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <FancyText
            type='bold'
            size='largeMedium'
            color={palette.fonts.dark}
            numberOfLines={1}
            style={styles.titleText}
          >
            {title}
          </FancyText>
        </View>

        <View style={styles.topActions}>
          <EscalaStatusBadge status={status} />
        </View>
      </View>

      <View style={styles.metaInlineRow}>
        <MetaInlineItem
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-range' }}
          value={periodLabel}
        />
        {hasHealth && (
          <EscalaHealthIndicator
            confirmedCount={confirmedCount}
            totalCount={totalCount}
            compact
            displayMode='percent-only'
          />
        )}
      </View>

      {showCompact ? (
        <>
          {onOpenDetails && (
            <Pressable
              onPress={onOpenDetails}
              style={({ pressed }) => [styles.detailsLink, pressed && styles.infoButtonPressed]}
              hitSlop={6}
              accessibilityRole='button'
              accessibilityLabel='Abrir detalhes da escala'
            >
              <FancyText type='semiBold' size='extraSmall' color={palette.primary}>
                Ver detalhes
              </FancyText>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <View style={styles.metaFooter}>
            <FancyText
              type='medium'
              size={9}
              color={palette.fonts.inactive}
              numberOfLines={1}
              style={styles.metaFooterText}
            >
              {`${createdLabel} • ${updatedLabel}`}
            </FancyText>

            {hasStaleWarning && (
              <View style={styles.staleTag}>
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='warning-amber'
                  size={12}
                  color={palette.warning}
                />
              </View>
            )}
          </View>
        </>
      )}

      {primaryActionLabel && onPrimaryActionPress ? (
        <Pressable
          onPress={onPrimaryActionPress}
          style={({ pressed }) => [
            styles.primaryActionButton,
            pressed && styles.primaryActionPressed,
          ]}
        >
          <FancyText type='semiBold' size='extraSmall' color={palette.fonts.light}>
            {primaryActionLabel}
          </FancyText>
        </Pressable>
      ) : null}

      {hasInlineActions && (
        <>
          <View style={styles.actionsDivider} />
          <LinearGradient
            colors={actionsGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionsBackground}
          >
            <View style={styles.actionsRow}>
              {inlineActions
                .filter((a) => a.variant === 'primary')
                .map((action) => (
                  <PrimaryPillButton key={action.key} action={action} />
                ))}
              <View style={styles.actionsSecondaryGroup}>
                {inlineActions
                  .filter((a) => a.variant !== 'primary')
                  .map((action) => (
                    <ActionIconButton key={action.key} action={action} />
                  ))}
              </View>
            </View>
          </LinearGradient>
        </>
      )}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    surfaceCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor2,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      ...palette.shadows[100],
    },
    surfaceCardWithActions: {
      paddingBottom: 0,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    titleBlock: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    titleText: {
      lineHeight: 20,
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoButtonPressed: {
      opacity: 0.75,
    },
    metaInlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginTop: 7,
    },
    metaInlineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaInlineIcon: {
      width: 14,
      height: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metaInlineValue: {
      flexShrink: 1,
    },
    metaFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      justifyContent: 'space-between',
      marginTop: 6,
    },
    metaFooterText: {
      opacity: 0.68,
    },
    staleTag: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: ColorUtils.withAlpha(palette.warning, 0.22),
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailsLink: {
      alignSelf: 'flex-start',
    },
    primaryActionButton: {
      marginTop: 2,
      height: 36,
      borderRadius: 10,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryActionPressed: {
      opacity: 0.85,
    },
    actionsDivider: {
      height: 1,
      backgroundColor: palette.borderCard,
      marginHorizontal: -14,
      marginTop: 10,
    },
    actionsBackground: {
      marginHorizontal: -14,
      paddingHorizontal: 14,
      borderBottomLeftRadius: 17,
      borderBottomRightRadius: 17,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      paddingVertical: 10,
    },
    actionsSecondaryGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    primaryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      height: 30,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: palette.primary,
      minWidth: 100,
      justifyContent: 'center',
    },
    primaryPillPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.97 }],
    },
    primaryPillDisabled: {
      opacity: 0.7,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.backgroundColor3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonDisabled: {
      opacity: 0.65,
    },
    iconButtonPressed: {
      opacity: 0.6,
      transform: [{ scale: 0.92 }],
    },
  });
}
