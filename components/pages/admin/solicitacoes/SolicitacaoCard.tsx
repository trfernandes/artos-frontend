import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import FancyImage from '../../../images/FancyImage';
import FancyChips from '../../../FancyChips';
import FancyLoading from '../../../FancyLoading';
import DefaultIcons from '../../../FancyIcons';
import { Pallete } from '../../../../constants/colors';
import { ResponseIgrejaSolicitacaoDto } from '../../../../domain/dtos/Igreja/response-igreja-solicitacao.dto';
import { AppImages } from '../../../../assets/app_images';
import { getSolicitacaoTheme } from './statusThemes';

type SolicitacaoCardProps = {
  solicitacao: ResponseIgrejaSolicitacaoDto;
  onAprovar: () => void;
  onRejeitar: () => void;
  isAprovando?: boolean;
  isRejeitando?: boolean;
  formatDateTime: (date: string) => string;
};

export default function SolicitacaoCard({
  solicitacao,
  onAprovar,
  onRejeitar,
  isAprovando = false,
  isRejeitando = false,
  formatDateTime,
}: SolicitacaoCardProps) {
  const voluntario = solicitacao.voluntario;
  const theme = getSolicitacaoTheme(solicitacao.status);
  const isPending = solicitacao.status === 'PENDING';
  const createdDateFormatted = formatDateTime(solicitacao.createdAt);
  const respondedDateFormatted = solicitacao.respondedAt ? formatDateTime(solicitacao.respondedAt) : null;
  const isLoading = isAprovando || isRejeitando;

  if (isLoading) {
    return <FancyLoading />;
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      {/* Borda lateral colorida */}
      <View style={[styles.leftBorder, { backgroundColor: theme.borderLeft }]} />

      <View style={styles.content}>
        {/* Header com avatar e info */}
        <View style={styles.header}>
          <FancyImage
            source={
              voluntario?.fotoThumbUrl || voluntario?.fotoUrl
                ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl }
                : AppImages.emptyProfile
            }
            size={42}
            style={styles.avatar}
          />

          <View style={styles.info}>
            <FancyText type='bold' size='medium' numberOfLines={1}>
              {voluntario?.nome || 'Voluntário'}
            </FancyText>
            <View style={styles.dateRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='email'
                size={12}
                color={Pallete.fonts.inactive}
              />
              <FancyText size='small' type='medium' color={Pallete.fonts.inactive} numberOfLines={1}>
                {voluntario?.email || ''}
              </FancyText>
            </View>
            <View style={styles.dateRow}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='calendar-clock-outline'
                size={12}
                color={Pallete.fonts.inactive}
              />
              <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                Solicitado em {createdDateFormatted}
              </FancyText>
            </View>
            {!isPending && respondedDateFormatted && (
              <View style={styles.dateRow}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='check-circle-outline'
                  size={12}
                  color={Pallete.fonts.inactive}
                />
                <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                  Respondido em {respondedDateFormatted}
                </FancyText>
              </View>
            )}
            <View style={styles.statusBadge}>
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
          </View>

          {/* Botões de ação (apenas para pendentes) */}
          {isPending && (
            <View style={styles.verticalActions}>
              <FancyButton
                type='outlined'
                size={32}
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'check',
                  size: 20,
                  color: Pallete.fonts.light,
                }}
                onPress={onAprovar}
                containerStyle={[styles.iconButton, styles.approveButton]}
              />
              <FancyButton
                type='outlined'
                size={32}
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'close',
                  size: 20,
                  color: Pallete.fonts.light,
                }}
                onPress={onRejeitar}
                containerStyle={[styles.iconButton, styles.rejectButton]}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    ...Pallete.shadows[100],
  },
  leftBorder: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    borderRadius: 21,
    alignSelf: 'flex-start',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 4,
  },
  verticalActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    minWidth: 32,
  },
  approveButton: {
    backgroundColor: Pallete.confirm,
    borderColor: Pallete.confirm,
  },
  rejectButton: {
    backgroundColor: Pallete.error,
    borderColor: Pallete.error,
  },
});
