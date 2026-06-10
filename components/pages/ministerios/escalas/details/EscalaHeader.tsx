import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import { ThemePalette } from '../../../../../constants/colors';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import DefaultIcons from '../../../../FancyIcons';
import EscalaStatusBadge from './EscalaStatusBadge';
import EscalaHealthIndicator from './EscalaHealthIndicator';
import {
  formatShortDate,
  StatusDistribution,
} from './escalaHeader.utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyButton from '../../../../buttons/FancyButton';

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
  confirmedCount?: number;
  totalCount?: number;
  statusDistribution?: StatusDistribution;
  variant?: EscalaHeaderVariant;
  onPrimaryActionPress?: () => void;
  primaryActionLabel?: string;
  onOpenDetails?: () => void;
  actions?: InlineAction[];
};

/**
 * Mapeia a chave da ação para uma cor de fundo semântica do palette.
 * Ações sem mapeamento usam o fundo neutro padrão do app.
 */
function useActionColors(key: string, palette: ThemePalette) {
  const coloredKeys: Record<string, string> = {
    delete: palette.error,
  };
  const bg = coloredKeys[key];
  return {
    backgroundColor: bg ?? ColorUtils.withAlpha(palette.primary, 0.08),
    iconColor: bg ? palette.icons.light : palette.primary,
    isColored: Boolean(bg),
  };
}

export default function EscalaHeader({
  title,
  status,
  periodStart,
  periodEnd,
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
  const hasHealth = confirmedCount !== undefined && totalCount !== undefined;
  const showCompact = variant === 'compact';
  const inlineActions = actions ?? [];
  const hasInlineActions = inlineActions.length > 0;
  const primaryActions = inlineActions.filter((a) => a.variant === 'primary');
  const secondaryActions = inlineActions.filter((a) => a.variant !== 'primary');

  return (
    <View style={[styles.surfaceCard, hasInlineActions && styles.surfaceCardWithActions]}>
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrow}>
          <View style={[styles.eyebrowTick, { backgroundColor: palette.primary }]} />
          <FancyText type='semiBold' size={10} color={palette.primary} style={styles.eyebrowText}>
            ESCALA
          </FancyText>
        </View>
        {primaryActionLabel && onPrimaryActionPress ? (
          <FancyButton
            type='contained'
            label={primaryActionLabel}
            labelProps={{ size: 'extraSmall', type: 'semiBold' }}
            onPress={onPrimaryActionPress}
            containerStyle={styles.primaryPill}
          />
        ) : null}
      </View>

      <View style={styles.topRow}>
        <FancyText
          type='bold'
          size='largeMedium'
          color={palette.fonts.dark}
          numberOfLines={1}
          style={styles.titleText}
        >
          {title}
        </FancyText>
        <View style={styles.topActions}>
          <EscalaStatusBadge status={status} />
        </View>
      </View>

      <View style={styles.metaInlineRow}>
        <View
          style={[
            styles.periodPill,
            {
              backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
              borderColor: ColorUtils.withAlpha(palette.primary, 0.18),
            },
          ]}
        >
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='calendar-range'
            size={12}
            color={palette.primary}
          />
          <FancyText size={11} type='semiBold' color={palette.primary}>
            {`${formatShortDate(periodStart)} – ${formatShortDate(periodEnd)}`}
          </FancyText>
        </View>
        {hasHealth && (
          <EscalaHealthIndicator
            confirmedCount={confirmedCount}
            totalCount={totalCount}
            compact
            displayMode='percent-only'
          />
        )}
      </View>

      {showCompact && onOpenDetails && (
        <FancyButton
          type='text'
          label='Ver detalhes'
          onPress={onOpenDetails}
          containerStyle={styles.detailsLink}
          labelStyle={{ color: palette.primary }}
        />
      )}

      {hasInlineActions && (
        <>
          <View style={styles.actionsRow}>
            {/* Ações primárias: pill com label + ícone */}
            {primaryActions.map((action) => (
              <FancyButton
                key={action.key}
                type='contained'
                label={action.label}
                labelProps={{ size: 'extraSmall' }}
                icon={{ ...action.icon, size: 14, color: palette.icons.light }}
                iconPosition='left'
                isLoading={action.isLoading}
                disabled={action.disabled}
                onPress={action.onPress}
                accessibilityLabel={action.label}
                containerStyle={styles.primaryPill}
              />
            ))}

            {/* Ações secundárias: ícone com fundo semântico */}
            <View style={styles.actionsSecondaryGroup}>
              <SecondaryActions actions={secondaryActions} palette={palette} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

/** Sub-componente isolado para poder usar o hook useActionColors por ação */
function SecondaryActions({
  actions,
  palette,
}: {
  actions: InlineAction[];
  palette: ThemePalette;
}) {
  return (
    <>
      {actions.map((action) => (
        <SecondaryActionButton key={action.key} action={action} palette={palette} />
      ))}
    </>
  );
}

function SecondaryActionButton({
  action,
  palette,
}: {
  action: InlineAction;
  palette: ThemePalette;
}) {
  const { backgroundColor, iconColor } = useActionColors(action.key, palette);
  const isDisabled = !!action.disabled || !!action.isLoading;

  return (
    <FancyButton
      type='light'
      mode='icon'
      size={{ w: 32, h: 32 }}
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
        backgroundColor: isDisabled ? ColorUtils.withAlpha(backgroundColor, 0.55) : backgroundColor,
        borderRadius: 16,
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
      borderTopColor: palette.primary,
      ...palette.shadows[200],
    },
    surfaceCardWithActions: {
      paddingBottom: 0,
    },
    eyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 4,
    },
    eyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    eyebrowTick: {
      width: 3,
      height: 11,
      borderRadius: 2,
    },
    eyebrowText: {
      letterSpacing: 0.8,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    titleText: {
      lineHeight: 20,
      flex: 1,
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaInlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginTop: 5,
    },
    periodPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      alignSelf: 'flex-start',
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
    detailsLink: {
      alignSelf: 'flex-start',
      paddingHorizontal: 0,
      height: 28,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      paddingTop: 8,
      paddingBottom: 10,
    },
    actionsSecondaryGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    primaryPill: {
      height: 30,
      paddingHorizontal: 12,
      borderRadius: 999,
      minWidth: 100,
    },
  });
}
