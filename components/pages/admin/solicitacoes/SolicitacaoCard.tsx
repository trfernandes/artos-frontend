import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import FancyImage from '../../../images/FancyImage';
import DefaultIcons from '../../../FancyIcons';
import { ResponseIgrejaSolicitacaoDto } from '../../../../domain/dtos/Igreja/response-igreja-solicitacao.dto';
import { AppImages } from '../../../../assets/app_images';
import { getSolicitacaoTheme } from './statusThemes';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';

type SolicitacaoCardProps = {
  solicitacao: ResponseIgrejaSolicitacaoDto;
  onAprovar: () => void;
  onRejeitar: () => void;
  formatDateTime: (date: string) => string;
};

export default function SolicitacaoCard({
  solicitacao,
  onAprovar,
  onRejeitar,
  formatDateTime,
}: SolicitacaoCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const voluntario = solicitacao.voluntario;
  const theme = getSolicitacaoTheme(solicitacao.status);
  const isPending = solicitacao.status === 'PENDING';
  const createdDateFormatted = formatDateTime(solicitacao.createdAt);
  const respondedDateFormatted = solicitacao.respondedAt
    ? formatDateTime(solicitacao.respondedAt)
    : null;

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
        <View style={[styles.accentStrip, { backgroundColor: theme.borderLeft }]} />

        <View style={styles.content}>
          <FancyImage
            source={
              voluntario?.fotoThumbUrl || voluntario?.fotoUrl
                ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl }
                : AppImages.emptyProfile
            }
            size={44}
            style={styles.avatar}
          />

          <View style={styles.info}>
            <FancyText type='semiBold' size='small' numberOfLines={1}>
              {voluntario?.nome || 'Voluntário'}
            </FancyText>
            <View style={styles.metaRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='email'
                size={11}
                color={palette.fonts.inactive}
              />
              <FancyText
                size='extraSmall'
                type='medium'
                color={palette.fonts.inactive}
                numberOfLines={1}
              >
                {voluntario?.email || ''}
              </FancyText>
            </View>
            <View style={styles.metaRow}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='calendar-clock-outline'
                size={11}
                color={palette.fonts.inactive}
              />
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                Solicitado em {createdDateFormatted}
              </FancyText>
            </View>
            {!isPending && respondedDateFormatted && (
              <View style={styles.metaRow}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='check-circle-outline'
                  size={11}
                  color={palette.fonts.inactive}
                />
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                  Respondido em {respondedDateFormatted}
                </FancyText>
              </View>
            )}
            <View
              style={[
                styles.statusPill,
                { backgroundColor: ColorUtils.withAlpha(theme.icon, 0.12) },
              ]}
            >
              <DefaultIcons.Custom
                library={theme.iconLib}
                name={theme.iconName}
                size={11}
                color={theme.icon}
              />
              <FancyText size='extraSmall' type='semiBold' style={{ color: theme.icon }}>
                {theme.label}
              </FancyText>
            </View>
          </View>

          {isPending && (
            <View style={styles.actionsCol}>
              <FancyButton
                type='outlined'
                size={34}
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'check',
                  size: 18,
                  color: palette.fonts.light,
                }}
                onPress={onAprovar}
                containerStyle={[
                  styles.actionBtn,
                  { backgroundColor: palette.confirm, borderColor: palette.confirm },
                ]}
              />
              <FancyButton
                type='outlined'
                size={34}
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'close',
                  size: 18,
                  color: palette.fonts.light,
                }}
                onPress={onRejeitar}
                containerStyle={[
                  styles.actionBtn,
                  { backgroundColor: palette.error, borderColor: palette.error },
                ]}
              />
            </View>
          )}
        </View>
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
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      paddingHorizontal: 14,
    },
    avatar: {
      borderRadius: 22,
      alignSelf: 'flex-start',
    },
    info: {
      flex: 1,
      gap: 2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginTop: 5,
    },
    actionsCol: {
      flexDirection: 'column',
      gap: 7,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    actionBtn: {
      width: 34,
      height: 34,
      minWidth: 34,
    },
  });
}
