import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';
import DefaultIcons, { IconLibrary } from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import {
  EscalaItemStatusEnum,
  EscalaItemStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { VoluntarioStatusChipParams } from '../../../ministerios/escalas/details/ListaVoluntariosTable';
import { ColorUtils } from '../../../../../utils/color_utils';
import {
  BOLD_FONT,
  EXTRA_SMALL_SIZE_FONT,
  LARGE_MEDIUM_SIZE_FONT,
  MEDIUM_SIZE_FONT,
  SMALL_SIZE_FONT,
} from '../../../../../constants/font';

export type FuncoesTableVariant =
  | 'rowCompactPremium'
  | 'editorialClean'
  | 'quickActionsMobile';

type FuncoesTableProps = {
  data: ResponseEscalaItemDto[];
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  variant?: FuncoesTableVariant;
};

type ActionButtonProps = {
  icon: { library: IconLibrary; name: string };
  color: string;
  backgroundColor: string;
  disabled?: boolean;
  onPress?: () => void;
  subtle?: boolean;
};

const ROW_VARIANT_RENDER_ORDER: FuncoesTableVariant[] = [
  'rowCompactPremium',
  'editorialClean',
  'quickActionsMobile',
];

function ActionButton({
  icon,
  color,
  backgroundColor,
  disabled,
  onPress,
  subtle = false,
}: ActionButtonProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[
        styles.actionButton,
        subtle ? styles.actionButtonSubtle : null,
        {
          backgroundColor: disabled ? palette.icons.inactive2 : backgroundColor,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <DefaultIcons.Custom
        library={icon.library}
        name={icon.name}
        size={subtle ? 12 : 13}
        color={disabled ? palette.icons.inactive : color}
      />
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: { status: EscalaItemStatusEnum }) {
  const styles = useThemedStyles(createStyles);
  const statusUi = VoluntarioStatusChipParams[status];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: statusUi.background,
          borderColor: ColorUtils.withAlpha(statusUi.color, 0.18),
        },
      ]}
    >
      <FancyText
        size='extraSmall'
        type='semiBold'
        style={[styles.statusBadgeText, { color: statusUi.color }]}
        numberOfLines={1}
      >
        {EscalaItemStatusEnumLabel[status]}
      </FancyText>
    </View>
  );
}

function getActionState(item: ResponseEscalaItemDto) {
  const isPendente = item.status === EscalaItemStatusEnum.Pendente;
  const canSubstitute = isPendente || item.status === EscalaItemStatusEnum.Confirmado;

  return { isPendente, canSubstitute };
}

function renderActions(
  item: ResponseEscalaItemDto,
  palette: ThemePalette,
  styles: ReturnType<typeof createStyles>,
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void,
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void,
  subtle = false,
) {
  const { isPendente, canSubstitute } = getActionState(item);

  return (
    <View style={[styles.actionsRow, subtle ? styles.actionsRowTight : null]}>
      <ActionButton
        icon={{ library: 'MaterialCommunityIcons', name: 'check-bold' }}
        color={palette.icons.light}
        backgroundColor={palette.confirm}
        disabled={!isPendente}
        onPress={() => onConfirmButtonPress?.(item)}
        subtle={subtle}
      />
      <ActionButton
        icon={{ library: 'FontAwesome6', name: 'repeat' }}
        color={palette.icons.light}
        backgroundColor={palette.terciary}
        disabled={!canSubstitute}
        onPress={() => onSubButtonPress?.(item)}
        subtle={subtle}
      />
    </View>
  );
}

function RowCompactPremium({
  item,
  isLast,
  onConfirmButtonPress,
  onSubButtonPress,
}: {
  item: ResponseEscalaItemDto;
  isLast: boolean;
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isPendente, canSubstitute } = getActionState(item);

  // Dot semântico: warning=pendente, success=confirmado, error=ausente/substituído
  const dotColor =
    item.status === EscalaItemStatusEnum.Confirmado
      ? palette.confirm
      : item.status === EscalaItemStatusEnum.Pendente
        ? palette.warning
        : palette.error;

  return (
    <View
      style={[
        styles.rowCard,
        {
          backgroundColor: palette.backgroundColor,
          borderRadius: 12,
          ...palette.shadows[100],
        },
      ]}
    >
      {/* Dot semântico 8px */}
      <View style={[styles.statusDot, { backgroundColor: dotColor }]} />

      {/* Nome da função — flex 1 */}
      <FancyText
        size='small'
        type='semiBold'
        style={styles.roleTitle}
        numberOfLines={1}
      >
        {item.funcao?.nome || 'Função'}
      </FancyText>

      {/* Status texto neutro — omitido quando Pendente (dot + FAB já comunicam) */}
      {item.status !== EscalaItemStatusEnum.Pendente && (
        <FancyText
          size='extraSmall'
          type='medium'
          style={styles.statusText}
          numberOfLines={1}
        >
          {EscalaItemStatusEnumLabel[item.status]}
        </FancyText>
      )}

      {/* FABs circulares */}
      <View style={styles.fabRow}>
        {/* ✓ Confirmar — só aparece quando pendente */}
        {isPendente && (
          <FancyButton
            mode='icon'
            type='contained'
            icon={{ library: 'MaterialCommunityIcons', name: 'check-bold', size: 14 }}
            containerStyle={{ backgroundColor: palette.confirm }}
            onPress={() => onConfirmButtonPress?.(item)}
            size={28}
          />
        )}
        {/* ↻ Trocar — sempre presente */}
        <FancyButton
          mode='icon'
          type='outlined'
          icon={{ library: 'FontAwesome6', name: 'repeat', size: 13 }}
          containerStyle={canSubstitute ? { borderColor: palette.warning } : undefined}
          iconStyle={canSubstitute ? { color: palette.warning } : undefined}
          disabled={!canSubstitute}
          onPress={() => onSubButtonPress?.(item)}
          size={28}
        />
      </View>
    </View>
  );
}

function EditorialClean({
  item,
  isLast,
  onConfirmButtonPress,
  onSubButtonPress,
}: {
  item: ResponseEscalaItemDto;
  isLast: boolean;
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.editorialRow, !isLast ? styles.editorialDivider : null]}>
      <View style={styles.editorialMain}>
        <FancyText size='small' type='semiBold' style={styles.roleTitle} numberOfLines={1}>
          {item.funcao?.nome || 'Função'}
        </FancyText>
        <View style={styles.editorialMeta}>
          <FancyText
            size='extraSmall'
            type='medium'
            style={styles.editorialMetaLabel}
            numberOfLines={1}
          >
            {EscalaItemStatusEnumLabel[item.status]}
          </FancyText>
        </View>
      </View>

      {renderActions(item, palette, styles, onConfirmButtonPress, onSubButtonPress, true)}
    </View>
  );
}

function QuickActionsMobile({
  item,
  isLast,
  onConfirmButtonPress,
  onSubButtonPress,
}: {
  item: ResponseEscalaItemDto;
  isLast: boolean;
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.quickRow, !isLast ? styles.rowSpacing : null]}>
      <View style={styles.quickMain}>
        <FancyText size='small' type='semiBold' style={styles.roleTitle} numberOfLines={1}>
          {item.funcao?.nome || 'Função'}
        </FancyText>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.quickActionsCapsule}>
        {renderActions(item, palette, styles, onConfirmButtonPress, onSubButtonPress, true)}
      </View>
    </View>
  );
}

export default function FuncoesTable({
  data,
  onConfirmButtonPress,
  onSubButtonPress,
  variant = 'rowCompactPremium',
}: FuncoesTableProps) {
  const styles = useThemedStyles(createStyles);
  const activeVariant = ROW_VARIANT_RENDER_ORDER.includes(variant)
    ? variant
    : 'rowCompactPremium';

  return (
    <View style={styles.container}>
      {data?.map((item, index) => {
        const isLast = index === data.length - 1;

        if (activeVariant === 'editorialClean') {
          return (
            <EditorialClean
              key={item.id || `${item.funcaoId}-${index}`}
              item={item}
              isLast={isLast}
              onConfirmButtonPress={onConfirmButtonPress}
              onSubButtonPress={onSubButtonPress}
            />
          );
        }

        if (activeVariant === 'quickActionsMobile') {
          return (
            <QuickActionsMobile
              key={item.id || `${item.funcaoId}-${index}`}
              item={item}
              isLast={isLast}
              onConfirmButtonPress={onConfirmButtonPress}
              onSubButtonPress={onSubButtonPress}
            />
          );
        }

        return (
          <RowCompactPremium
            key={item.id || `${item.funcaoId}-${index}`}
            item={item}
            isLast={isLast}
            onConfirmButtonPress={onConfirmButtonPress}
            onSubButtonPress={onSubButtonPress}
          />
        );
      })}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 6,
    },
    // Mini-card por função: branco elevado sobre fundo tintado do body
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingHorizontal: 12,
      gap: 8,
    },
    rowSpacing: {
      marginBottom: 0,
    },
    rowWithDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.2),
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    roleTitle: {
      fontFamily: BOLD_FONT,
      fontSize: SMALL_SIZE_FONT,
      lineHeight: SMALL_SIZE_FONT + 3,
      color: palette.fonts.dark,
      flex: 1,
    },
    statusText: {
      fontSize: EXTRA_SMALL_SIZE_FONT,
      lineHeight: EXTRA_SMALL_SIZE_FONT + 3,
      color: palette.fonts.inactive,
      flexShrink: 1,
      maxWidth: 96,
      textAlign: 'right',
    },
    fabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
    },
    statusBadgeText: {
      fontFamily: BOLD_FONT,
      fontSize: EXTRA_SMALL_SIZE_FONT,
      lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionsRowTight: {
      gap: 6,
    },
    actionButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonSubtle: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    editorialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
    editorialDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.22),
    },
    editorialMain: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    editorialMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    editorialMetaLabel: {
      fontSize: EXTRA_SMALL_SIZE_FONT,
      lineHeight: EXTRA_SMALL_SIZE_FONT + 3,
      color: palette.fonts.inactive,
      letterSpacing: 0.2,
    },
    quickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.08),
    },
    quickMain: {
      flex: 1,
      minWidth: 0,
      gap: 6,
    },
    quickActionsCapsule: {
      paddingHorizontal: 6,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.06),
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.08),
    },
  });
}
