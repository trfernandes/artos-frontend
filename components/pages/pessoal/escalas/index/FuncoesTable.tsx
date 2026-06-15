import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyChips from '../../../../FancyChips';
import FancyButton from '../../../../buttons/FancyButton';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { VoluntarioStatusChipParams } from '../../../ministerios/escalas/details/ListaVoluntariosTable';
import { ColorUtils } from '../../../../../utils/color_utils';

type FuncoesTableProps = {
  data: ResponseEscalaItemDto[];
  eventColor: string;
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
};

function getActionState(item: ResponseEscalaItemDto) {
  const isPendente = item.status === EscalaItemStatusEnum.Pendente;
  const isSubstituicaoPendente = item.status === EscalaItemStatusEnum.SubstituicaoSolicitada;
  const canSubstitute = isPendente || item.status === EscalaItemStatusEnum.Confirmado;

  return { isPendente, isSubstituicaoPendente, canSubstitute };
}

function FuncaoRow({
  item,
  isLast,
  eventColor,
  onConfirmButtonPress,
  onSubButtonPress,
}: {
  item: ResponseEscalaItemDto;
  isLast: boolean;
  eventColor: string;
  onConfirmButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress?: (dadosEscala: ResponseEscalaItemDto) => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isPendente, isSubstituicaoPendente, canSubstitute } = getActionState(item);
  const statusUi = VoluntarioStatusChipParams[item.status];

  return (
    <View style={[styles.row, !isLast ? styles.rowDivider : null]}>
      <View style={[styles.icon, { backgroundColor: ColorUtils.withAlpha(eventColor, 0.12) }]}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='badge-account-outline'
          size={14}
          color={eventColor}
        />
      </View>

      <View style={styles.info}>
        <FancyText size='small' type='semiBold' style={styles.roleTitle} numberOfLines={1}>
          {item.funcao?.nome || 'Função'}
        </FancyText>
        <View style={styles.chipRow}>
          <FancyChips size='small' label={statusUi.label} color={statusUi.color} />
        </View>
      </View>

      {!isSubstituicaoPendente && (
        <View style={styles.actionsRow}>
          {isPendente && (
            <FancyButton
              mode='icon'
              type='outlined'
              icon={{ library: 'MaterialCommunityIcons', name: 'check-bold', size: 14 }}
              containerStyle={{
                borderColor: palette.confirm,
                backgroundColor: ColorUtils.withAlpha(palette.confirm, 0.12),
              }}
              iconStyle={{ color: palette.confirm }}
              onPress={() => onConfirmButtonPress?.(item)}
              size={28}
            />
          )}
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
      )}
    </View>
  );
}

export default function FuncoesTable({
  data,
  eventColor,
  onConfirmButtonPress,
  onSubButtonPress,
}: FuncoesTableProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {data?.map((item, index) => (
        <FuncaoRow
          key={item.id || `${item.funcaoId}-${index}`}
          item={item}
          isLast={index === data.length - 1}
          eventColor={eventColor}
          onConfirmButtonPress={onConfirmButtonPress}
          onSubButtonPress={onSubButtonPress}
        />
      ))}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      paddingBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 9,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, 0.5),
    },
    icon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    info: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    roleTitle: {
      lineHeight: 17,
      includeFontPadding: false,
      color: palette.fonts.dark,
    },
    chipRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
  });
}
