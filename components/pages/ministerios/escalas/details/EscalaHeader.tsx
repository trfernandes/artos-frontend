import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FancyText from '../../../../FancyText';
import { Pallete } from '../../../../../constants/colors';
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

export type EscalaHeaderVariant = 'default' | 'compact' | 'leader';

export type InlineAction = {
  key: string;
  icon: { library: 'MaterialIcons' | 'MaterialCommunityIcons'; name: string };
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'neutral' | 'danger';
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
  return (
    <View style={styles.metaInlineItem}>
      <View style={styles.metaInlineIcon}>
        <DefaultIcons.Custom
          library={icon.library}
          name={icon.name}
          size={13}
          color={Pallete.primary}
        />
      </View>
      <FancyText
        type='medium'
        size='extraSmall'
        color={Pallete.fonts.dark}
        numberOfLines={1}
        style={styles.metaInlineValue}
      >
        {value}
      </FancyText>
    </View>
  );
}

function ActionIconButton({ action }: { action: InlineAction }) {
  const isDanger = action.variant === 'danger';
  const iconColor = isDanger ? Pallete.error : Pallete.icons.inactive;

  return (
    <Pressable
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.iconButton,
        isDanger && styles.iconButtonDanger,
        pressed && styles.iconButtonPressed,
      ]}
      hitSlop={6}
      accessibilityRole='button'
      accessibilityLabel={action.label}
    >
      <DefaultIcons.Custom
        library={action.icon.library}
        name={action.icon.name}
        size={17}
        color={iconColor}
      />
    </Pressable>
  );
}

function PrimaryPillButton({ action }: { action: InlineAction }) {
  return (
    <Pressable
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.primaryPill,
        pressed && styles.primaryPillPressed,
      ]}
      hitSlop={4}
    >
      <DefaultIcons.Custom
        library={action.icon.library}
        name={action.icon.name}
        size={15}
        color={Pallete.icons.light}
      />
      <FancyText type='semiBold' size='extraSmall' color={Pallete.fonts.light}>
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
  const createdLabel = `Criada em ${formatShortDate(createdAt, true)}`;
  const updatedLabel = `Atualizada ${formatRelativeOrDate(updatedAt)}`;
  const periodLabel = formatPeriod(periodStart, periodEnd);
  const hasStaleWarning = isStaleUpdate(updatedAt);
  const hasHealth = confirmedCount !== undefined && totalCount !== undefined;
  const showCompact = variant === 'compact';
  const showLeader = variant === 'leader';
  const inlineActions = actions ?? [];
  const hasInlineActions = inlineActions.length > 0;

  return (
    <View style={[styles.surfaceCard, hasInlineActions && styles.surfaceCardWithActions]}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <FancyText
            type='bold'
            size='largeMedium'
            color={Pallete.fonts.dark}
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
      </View>

      {hasHealth && (
        <View style={styles.healthSection}>
          <EscalaHealthIndicator confirmedCount={confirmedCount} totalCount={totalCount} />
        </View>
      )}

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
              <FancyText type='semiBold' size='extraSmall' color={Pallete.primary}>
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
              size='extraSmall'
              color={Pallete.fonts.inactive}
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
                  color={Pallete.warning}
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
          <FancyText type='semiBold' size='extraSmall' color={Pallete.fonts.light}>
            {primaryActionLabel}
          </FancyText>
        </Pressable>
      ) : null}

      {hasInlineActions && (
        <>
          <View style={styles.actionsDivider} />
          <LinearGradient
            colors={['#EEF4FF', '#F7FAFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionsBackground}
          >
            <View style={styles.actionsRow}>
              {inlineActions.filter((a) => a.variant === 'primary').map((action) => (
                <PrimaryPillButton key={action.key} action={action} />
              ))}
              <View style={styles.actionsSecondaryGroup}>
                {inlineActions.filter((a) => a.variant !== 'primary').map((action) => (
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

const styles = StyleSheet.create({
  surfaceCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3EAF4',
    backgroundColor: Pallete.backgroundColor,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    ...Pallete.shadows[100],
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
  healthSection: {
    marginTop: 10,
  },
  metaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaFooterText: {
    opacity: 0.68,
  },
  staleTag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${Pallete.warning}22`,
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
    backgroundColor: Pallete.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionPressed: {
    opacity: 0.85,
  },
  actionsDivider: {
    height: 1,
    backgroundColor: '#E3EAF4',
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
    paddingVertical: 11,
  },
  actionsSecondaryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Pallete.primary,
  },
  primaryPillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Pallete.backgroundColor2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDanger: {
    backgroundColor: '#FDEEEF',
  },
  iconButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});
