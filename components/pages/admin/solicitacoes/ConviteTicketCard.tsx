import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import FancyChips from '../../../FancyChips';
import DefaultIcons from '../../../FancyIcons';
import { ResponseIgrejaConviteDto, ConviteStatusType } from '../../../../domain/dtos/Igreja/response-igreja-convite.dto';
import { getConviteTheme } from './statusThemes';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';

type ConviteTicketCardProps = {
  convite: ResponseIgrejaConviteDto;
  status: ConviteStatusType;
  onCompartilhar: () => void;
  onRevogar: () => void;
  onCopiarToken: () => void;
  formatDateTime: (date: string) => string;
  isRevogando?: boolean;
};

export default function ConviteTicketCard({
  convite,
  status,
  onCompartilhar,
  onRevogar,
  onCopiarToken,
  formatDateTime,
  isRevogando = false,
}: ConviteTicketCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const theme = getConviteTheme(status);
  const isAtivo = status === 'ATIVO';
  const createdDateFormatted = formatDateTime(convite.createdAt);
  const expiresFormatted = convite.expiresAt ? formatDateTime(convite.expiresAt) : null;

  return (
    <View style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      {/* Header do Ticket */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='ticket-confirmation-outline'
            size={18}
            color={theme.icon}
          />
          <FancyText type='bold' size='medium' numberOfLines={1} style={styles.title} color={theme.icon}>
            {convite.descricao || 'Convite'}
          </FancyText>
        </View>
        <FancyChips
          label={theme.label}
          color={theme.icon}
          size='small'
          icon={{
            library: theme.iconLib,
            name: theme.iconName,
            size: 12,
          }}
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='calendar-outline'
            size={14}
            color={palette.fonts.inactive}
          />
          <FancyText size='extraSmall' type='bold' color={palette.fonts.inactive}>
            Criado:
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            {createdDateFormatted}
          </FancyText>
        </View>

        <View style={styles.infoItem}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='account-multiple-outline'
            size={14}
            color={palette.fonts.inactive}
          />
          <FancyText size='extraSmall' type='bold' color={palette.fonts.inactive}>
            Usos:
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            {convite.usesCount}/{convite.maxUses ?? '∞'}
          </FancyText>
        </View>

        {expiresFormatted && (
          <View style={styles.infoItem}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='clock-alert-outline'
              size={14}
              color={palette.fonts.inactive}
            />
            <FancyText size='extraSmall' type='bold' color={palette.fonts.inactive}>
              Expiração:
            </FancyText>
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
              {expiresFormatted}
            </FancyText>
          </View>
        )}

        <View style={styles.infoItem}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name={convite.autoApprove ? 'flash-on' : 'hourglass-empty'}
            size={14}
            color={convite.autoApprove ? palette.confirm : palette.warning}
          />
          <FancyText size='extraSmall' type='semiBold' color={convite.autoApprove ? palette.confirm : palette.warning}>
            {convite.autoApprove ? 'Entrada Imediata' : 'Requer Aprovação'}
          </FancyText>
        </View>
      </View>

      {/* Botão copiar código */}
      <TouchableOpacity style={[styles.copyRow, { backgroundColor: `${theme.icon}10` }]} onPress={onCopiarToken} activeOpacity={0.7}>
        <DefaultIcons.Custom
          library='MaterialIcons'
          name='content-copy'
          size={14}
          color={theme.icon}
        />
        <FancyText size='small' type='semiBold' color={theme.icon}>
          Copiar código
        </FancyText>
      </TouchableOpacity>

      {/* Botões de ação (apenas para convites ativos) */}
      {isAtivo && (
        <View style={[styles.actions, { borderTopColor: palette.borderCard }]}>
          <FancyButton
            label='Compartilhar'
            type='outlined'
            size={34}
            icon={{
              library: 'MaterialIcons',
              name: 'share',
              size: 16,
              color: palette.primary,
            }}
            onPress={onCompartilhar}
            containerStyle={[styles.actionButton, { borderColor: palette.primary }]}
            labelStyle={{ color: palette.primary }}
          />
          <FancyButton
            label='Revogar'
            type='outlined'
            size={34}
            icon={{
              library: 'MaterialIcons',
              name: 'block',
              size: 16,
              color: palette.error,
            }}
            onPress={onRevogar}
            containerStyle={[styles.actionButton, styles.revokeButton, { borderColor: palette.error }]}
            labelStyle={{ color: palette.error }}
            isLoading={isRevogando}
            disabled={isRevogando}
          />
        </View>
      )}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 14,
      borderWidth: 1,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 6,
      gap: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    title: {
      flex: 1,
    },
    copyRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 14,
      marginBottom: 10,
      paddingVertical: 10,
      borderRadius: 8,
    },
    infoContainer: {
      paddingHorizontal: 14,
      paddingBottom: 12,
      gap: 6,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      padding: 12,
      paddingTop: 10,
      borderTopWidth: 1,
    },
    actionButton: {
      flex: 1,
    },
    revokeButton: {},
  });
}
