import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import { ThemePalette } from '../../../../../constants/colors';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import { EscalaOrigemEnum } from '../../../../../domain/enums/Escala/escala-origem.enum';
import DefaultIcons from '../../../../FancyIcons';
import { useEscalaStatusVisual } from './EscalaStatusBadge';
import EscalaHealthIndicator from './EscalaHealthIndicator';
import FancyChips from '../../../../FancyChips';
import { formatShortDate, StatusDistribution } from './escalaHeader.utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyButton from '../../../../buttons/FancyButton';

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
  origem?: EscalaOrigemEnum;
  periodStart: Date;
  periodEnd: Date;
  confirmedCount?: number;
  totalCount?: number;
  statusDistribution?: StatusDistribution;
  actions?: InlineAction[];
};

function useActionIconColor(key: string, palette: ThemePalette) {
  const map: Record<string, string> = {
    publish: palette.primary,
    recalculate: palette.confirm,
    insights: palette.secondary,
    parametrizacao: palette.warning,
    delete: palette.error,
  };
  return map[key] ?? palette.fonts.dark;
}

const ORIGEM_LABEL: Record<EscalaOrigemEnum, string> = {
  [EscalaOrigemEnum.Automatica]: 'Automática',
  [EscalaOrigemEnum.Manual]: 'Manual',
};

export default function EscalaHeader({
  title,
  status,
  origem,
  periodStart,
  periodEnd,
  confirmedCount,
  totalCount,
  actions,
}: EscalaHeaderProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const statusVisual = useEscalaStatusVisual(status);
  const hasHealth = confirmedCount !== undefined && totalCount !== undefined;
  const inlineActions = actions ?? [];
  const primaryActions = inlineActions.filter((a) => a.variant === 'primary');
  const secondaryActions = inlineActions.filter((a) => a.variant !== 'primary');
  const hasVisibleActions = primaryActions.length > 0 || secondaryActions.length > 0;

  return (
    <View style={[styles.surfaceCard, { borderTopColor: statusVisual.color }]}>
      <View style={styles.headlineRow}>
        <View
          style={[
            styles.leadingIcon,
            { backgroundColor: ColorUtils.withAlpha(statusVisual.color, 0.12) },
          ]}
        >
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='calendar-range'
            size={15}
            color={statusVisual.color}
          />
        </View>
        <FancyText
          type='bold'
          size='medium'
          color={palette.fonts.dark}
          numberOfLines={1}
          style={styles.titleText}
        >
          {title}
        </FancyText>
        <FancyChips
          label={statusVisual.label}
          color={statusVisual.color}
          backgroundColor={statusVisual.backgroundColor}
          dot
          size='small'
          style={styles.statusChip}
        />
      </View>

      <View style={styles.metaRow}>
        {origem && (
          <View style={styles.metaItem}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name={origem === EscalaOrigemEnum.Automatica ? 'lightning-bolt' : 'pencil-outline'}
              size={12}
              color={palette.fonts.inactive}
            />
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              {ORIGEM_LABEL[origem]}
            </FancyText>
          </View>
        )}
        {origem && <View style={styles.metaDot} />}
        <View style={styles.metaItem}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='calendar-range'
            size={12}
            color={palette.fonts.inactive}
          />
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            {`${formatShortDate(periodStart)} – ${formatShortDate(periodEnd)}`}
          </FancyText>
        </View>
        {hasHealth && (
          <View style={styles.metaHealth}>
            <EscalaHealthIndicator
              confirmedCount={confirmedCount}
              totalCount={totalCount}
              compact
              displayMode='percent-only'
            />
          </View>
        )}
      </View>

      {hasVisibleActions && (
        <View style={styles.actionsRow}>
          {primaryActions.map((action) => (
            <FancyButton
              key={action.key}
              type='contained'
              label={action.label}
              labelProps={{ size: 'small' }}
              icon={{ ...action.icon, size: 16, color: palette.icons.light }}
              iconPosition='left'
              isLoading={action.isLoading}
              disabled={action.disabled}
              onPress={action.onPress}
              accessibilityLabel={action.label}
              containerStyle={styles.primaryPill}
            />
          ))}

          {secondaryActions.length > 0 && (
            <View style={styles.actionsSecondaryGroup}>
              {secondaryActions.map((action) => (
                <SecondaryActionButton key={action.key} action={action} palette={palette} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function SecondaryActionButton({
  action,
  palette,
}: {
  action: InlineAction;
  palette: ThemePalette;
}) {
  const isDisabled = !!action.disabled || !!action.isLoading;
  const actionColor = useActionIconColor(action.key, palette);
  const iconColor = action.variant === 'danger' ? palette.error : actionColor;

  return (
    <FancyButton
      type='light'
      mode='icon'
      size={{ w: 34, h: 34 }}
      icon={{
        library: action.icon.library,
        name: action.icon.name,
        size: 17,
        color: isDisabled ? ColorUtils.withAlpha(iconColor, 0.6) : iconColor,
      }}
      isLoading={action.isLoading}
      disabled={isDisabled}
      onPress={action.onPress}
      accessibilityLabel={action.label}
      containerStyle={{
        backgroundColor: ColorUtils.withAlpha(iconColor, isDisabled ? 0.06 : 0.12),
        borderRadius: 10,
        borderWidth: 0,
      }}
    />
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    surfaceCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: 3,
      ...palette.shadows[200],
    },
    headlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    titleText: {
      flex: 1,
    },
    leadingIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    statusChip: {
      alignSelf: 'center',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 6,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: palette.fonts.inactive2,
    },
    metaHealth: {
      marginLeft: 'auto',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: palette.backgroundColor2,
    },
    actionsSecondaryGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    primaryPill: {
      height: 38,
      paddingHorizontal: 16,
      borderRadius: 999,
      minWidth: 120,
    },
  });
}
