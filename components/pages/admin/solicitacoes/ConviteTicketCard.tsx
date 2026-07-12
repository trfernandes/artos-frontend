import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import DefaultIcons from '../../../FancyIcons';
import {
  ResponseIgrejaConviteDto,
  ConviteStatusType,
} from '../../../../domain/dtos/Igreja/response-igreja-convite.dto';
import { getConviteTheme } from './statusThemes';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';

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
    <View
      style={[
        styles.outer,
        {
          borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
          ...palette.shadows[200],
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={[styles.accentStrip, { backgroundColor: theme.ticketLine }]} />

        {/* Header */}
        <View style={styles.header}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='ticket-confirmation-outline'
            size={18}
            color={theme.icon}
          />
          <FancyText
            type='semiBold'
            size='small'
            numberOfLines={1}
            style={[styles.title, { color: isAtivo ? palette.fonts.dark : palette.fonts.inactive }]}
          >
            {convite.descricao || 'Convite'}
          </FancyText>
          <View
            style={[styles.statusPill, { backgroundColor: ColorUtils.withAlpha(theme.icon, 0.12) }]}
          >
            <DefaultIcons.Custom
              library={theme.iconLib}
              name={theme.iconName}
              size={10}
              color={theme.icon}
            />
            <FancyText size='extraSmall' type='semiBold' style={{ color: theme.icon }}>
              {theme.label}
            </FancyText>
          </View>
        </View>

        {/* Info: 2 linhas × 2 colunas */}
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='calendar-outline'
                size={12}
                color={palette.fonts.inactive}
              />
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
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
                size={12}
                color={palette.fonts.inactive}
              />
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                Usos:
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                {convite.usesCount}/{convite.maxUses ?? '∞'}
              </FancyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            {expiresFormatted ? (
              <View style={styles.infoItem}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='clock-alert-outline'
                  size={12}
                  color={status === 'EXPIRADO' ? palette.warning : palette.fonts.inactive}
                />
                <FancyText
                  size='extraSmall'
                  type='semiBold'
                  color={status === 'EXPIRADO' ? palette.warning : palette.fonts.inactive}
                >
                  {status === 'EXPIRADO' ? 'Expirou:' : 'Expira:'}
                </FancyText>
                <FancyText
                  size='extraSmall'
                  type='medium'
                  color={status === 'EXPIRADO' ? palette.warning : palette.fonts.inactive}
                >
                  {expiresFormatted}
                </FancyText>
              </View>
            ) : null}
            <View style={styles.infoItem}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name={convite.autoApprove ? 'flash-on' : 'hourglass-empty'}
                size={12}
                color={convite.autoApprove ? palette.confirm : palette.warning}
              />
              <FancyText
                size='extraSmall'
                type='semiBold'
                color={convite.autoApprove ? palette.confirm : palette.warning}
              >
                {convite.autoApprove ? 'Entrada Imediata' : 'Com Aprovação'}
              </FancyText>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={['transparent', ColorUtils.withAlpha(palette.borderCard, 0.9), 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.subtleDivider}
        />

        {/* Copy pill */}
        <Pressable
          style={[styles.copyPill, { backgroundColor: ColorUtils.withAlpha(theme.icon, 0.08) }]}
          onPress={onCopiarToken}
        >
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='content-copy'
            size={13}
            color={theme.icon}
          />
          <FancyText size='small' type='semiBold' style={{ color: theme.icon }}>
            Copiar código
          </FancyText>
        </Pressable>

        {/* Ações (só ATIVO) */}
        {isAtivo && (
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.pillBtn,
                { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08) },
              ]}
              onPress={onCompartilhar}
            >
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='share'
                size={14}
                color={palette.primary}
              />
              <FancyText size='small' type='semiBold' style={{ color: palette.primary }}>
                Compartilhar
              </FancyText>
            </Pressable>

            <Pressable
              style={[
                styles.pillBtn,
                { backgroundColor: ColorUtils.withAlpha(palette.error, 0.06) },
              ]}
              onPress={isRevogando ? undefined : onRevogar}
              disabled={isRevogando}
            >
              {isRevogando ? (
                <ActivityIndicator size='small' color={palette.error} />
              ) : (
                <>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='block'
                    size={14}
                    color={palette.error}
                  />
                  <FancyText size='small' type='semiBold' style={{ color: palette.error }}>
                    Revogar
                  </FancyText>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    outer: {
      borderRadius: 18,
      borderWidth: 0.5,
      backgroundColor: palette.backgroundColor,
    },
    inner: {
      borderRadius: 17,
      overflow: 'hidden',
    },
    accentStrip: {
      height: 3,
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingTop: 11,
      paddingBottom: 8,
    },
    title: {
      flex: 1,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 3,
      flexShrink: 0,
    },
    infoBlock: {
      paddingHorizontal: 14,
      paddingBottom: 10,
      gap: 5,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    subtleDivider: {
      height: 1,
      width: '55%',
      alignSelf: 'center',
      marginVertical: 12,
    },
    copyPill: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 14,
      marginBottom: 10,
      paddingVertical: 9,
      borderRadius: 10,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    pillBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 9,
      borderRadius: 10,
    },
  });
}
