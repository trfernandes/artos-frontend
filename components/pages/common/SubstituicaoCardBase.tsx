import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import FancyActionSheet, { FancyActionSheetItem } from '../../actions/FancyActionSheet';
import { AppImages } from '../../../assets/app_images';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import {
  EscalaSubstituicaoStatusEnum,
  EscalaSubstituicaoStatusEnumLabel,
} from '../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../domain/dtos/Escala/escala-substituicao.response';
import { DateUtilsApi } from '../../../utils/date_utils';
import { getFirstAndLastName } from '../../../utils/text_utils';
import { ThemePalette } from '../../../constants/colors';

type StatusVisual = { color: string; icon: string };

export type AvatarStats = {
  solicitacoesEnviadas?: number;
  solicitacoesAceitas?: number;
};

export type RespondidoPor = {
  nome: string;
  fotoUrl?: string;
};

export type SubstituicaoCardActions = {
  onAceitar?: () => void;
  onRecusar?: () => void;
};

export function getStatusVisual(
  status: EscalaSubstituicaoStatusEnum,
  palette: ThemePalette,
): StatusVisual {
  switch (status) {
    case EscalaSubstituicaoStatusEnum.Pendente:
      return { color: palette.warning, icon: 'schedule' };
    case EscalaSubstituicaoStatusEnum.Aprovada:
      return { color: palette.confirm, icon: 'check-circle' };
    case EscalaSubstituicaoStatusEnum.Recusada:
      return { color: palette.error, icon: 'cancel' };
    case EscalaSubstituicaoStatusEnum.Cancelada:
      return { color: palette.fonts.inactive, icon: 'cancel' };
  }
}

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  canAct?: boolean;
  actions?: SubstituicaoCardActions;
  isActing?: boolean;
  solicitanteStats?: AvatarStats;
  substitutoStats?: AvatarStats;
  respondidoPor?: RespondidoPor;
  motivoRecusa?: string;
  onVerEvento?: () => void;
  isSolicitante?: boolean;
  onCancelar?: () => void;
};

export default function SubstituicaoCardBase({
  substituicao,
  canAct = false,
  actions,
  isActing = false,
  onVerEvento,
  isSolicitante = false,
  onCancelar,
}: Props) {
  const palette = usePallete();
  const [menuOpen, setMenuOpen] = useState(false);
  const visual = getStatusVisual(substituicao.status, palette);

  const isPendente = substituicao.status === EscalaSubstituicaoStatusEnum.Pendente;
  const statusLabel = EscalaSubstituicaoStatusEnumLabel[substituicao.status];

  const solicitanteVol = substituicao.solicitante?.voluntario;
  const substitutoVol = substituicao.substituto?.voluntario;

  const dataOcorrencia = substituicao.escalaItem?.dataOcorrencia
    ? DateUtilsApi.dateOnlyFromApi(substituicao.escalaItem.dataOcorrencia as string)
    : null;

  const mesAbrev = dataOcorrencia ? format(dataOcorrencia, 'MMM', { locale: ptBR }).toUpperCase() : '—';
  const diaNum = dataOcorrencia ? format(dataOcorrencia, 'dd', { locale: ptBR }) : '—';
  const horaCurta = dataOcorrencia ? format(dataOcorrencia, "HH'h'mm", { locale: ptBR }) : '';

  const eventoNome = substituicao.escalaItem?.evento?.nome ?? '—';
  const funcaoNome = substituicao.escalaItem?.funcao?.nome;
  const firstAndLast = (full?: string) => {
    if (!full?.trim()) return '—';
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };
  const solicitanteNomeCurto = isSolicitante ? 'Você' : firstAndLast(solicitanteVol?.nome);
  const substitutoNomeCurto = firstAndLast(substitutoVol?.nome);

  const eventoCor = substituicao.escalaItem?.evento?.cor;
  const accentColor = eventoCor ?? palette.primary;

  const motivo = substituicao.motivo;

  const sheetActions = useMemo<FancyActionSheetItem[]>(() => {
    const list: FancyActionSheetItem[] = [];
    if (isPendente && canAct && actions?.onAceitar) {
      list.push({
        label: 'Aceitar',
        icon: { library: 'MaterialIcons', name: 'check', size: 16 },
        onPress: () => actions.onAceitar?.(),
        disabled: isActing,
      });
    }
    if (isPendente && canAct && actions?.onRecusar) {
      list.push({
        label: 'Recusar',
        icon: { library: 'MaterialIcons', name: 'close', size: 16 },
        onPress: () => actions.onRecusar?.(),
        destructive: true,
        disabled: isActing,
      });
    }
    if (isPendente && isSolicitante && onCancelar) {
      list.push({
        label: 'Cancelar solicitação',
        icon: { library: 'MaterialIcons', name: 'close', size: 16 },
        onPress: () => onCancelar(),
        destructive: true,
        disabled: isActing,
      });
    }
    if (onVerEvento) {
      list.push({
        label: 'Visualizar evento',
        icon: { library: 'MaterialIcons', name: 'event', size: 16 },
        onPress: () => onVerEvento(),
      });
    }
    return list;
  }, [isPendente, canAct, actions, isActing, onVerEvento, isSolicitante, onCancelar]);

  const hasMenu = sheetActions.length > 0;

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderCard,
            borderLeftColor: accentColor,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.dateBlock,
              {
                backgroundColor: ColorUtils.withAlpha(accentColor, 0.08),
                borderColor: ColorUtils.withAlpha(accentColor, 0.2),
              },
            ]}
          >
            <FancyText size='extraSmall' type='bold' color={accentColor} style={styles.dateMonth}>
              {mesAbrev}
            </FancyText>
            <FancyText type='bold' color={accentColor} style={styles.dateDay}>
              {diaNum}
            </FancyText>
            {horaCurta ? (
              <>
                <View
                  style={[
                    styles.dateDivider,
                    { backgroundColor: ColorUtils.withAlpha(accentColor, 0.3) },
                  ]}
                />
                <View style={styles.dateHourRow}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='schedule'
                    size={9}
                    color={accentColor}
                  />
                  <FancyText
                    size='extraSmall'
                    type='semiBold'
                    color={accentColor}
                    style={styles.dateHour}
                  >
                    {horaCurta}
                  </FancyText>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.headerRight}>
            <FancyText type='bold' size='medium' numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {eventoNome}
            </FancyText>
            <View style={styles.pillsRow}>
              {funcaoNome ? (
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1) },
                  ]}
                >
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='work-outline'
                    size={10}
                    color={palette.primary}
                  />
                  <FancyText
                    size='extraSmall'
                    type='semiBold'
                    color={palette.primary}
                    numberOfLines={1}
                    style={styles.pillText}
                  >
                    {funcaoNome}
                  </FancyText>
                </View>
              ) : null}
              <View
                style={[
                  styles.pill,
                  { backgroundColor: ColorUtils.withAlpha(visual.color, 0.18) },
                ]}
                accessibilityLabel={`Status: ${statusLabel}`}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name={visual.icon}
                  size={10}
                  color={visual.color}
                />
                <FancyText
                  size='extraSmall'
                  type='bold'
                  color={visual.color}
                  style={styles.pillText}
                >
                  {statusLabel}
                </FancyText>
              </View>
            </View>
            <View style={styles.miniPeopleRow}>
              <View style={styles.miniPersonGroup}>
                <Image
                  source={
                    solicitanteVol?.fotoThumbUrl || solicitanteVol?.fotoUrl
                      ? { uri: solicitanteVol.fotoThumbUrl ?? solicitanteVol.fotoUrl }
                      : AppImages.emptyProfile
                  }
                  style={[styles.miniAvatar, { borderColor: palette.borderCard }]}
                />
                <FancyText
                  size='extraSmall'
                  type='normal'
                  color={palette.fonts.dark}
                  numberOfLines={2}
                  style={styles.miniName}
                >
                  {solicitanteNomeCurto}
                </FancyText>
              </View>
              <View style={styles.miniArrowContainer}>
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='arrow-forward'
                  size={12}
                  color={palette.fonts.inactive}
                />
              </View>
              <View style={styles.miniPersonGroup}>
                <Image
                  source={
                    substitutoVol?.fotoThumbUrl || substitutoVol?.fotoUrl
                      ? { uri: substitutoVol.fotoThumbUrl ?? substitutoVol.fotoUrl }
                      : AppImages.emptyProfile
                  }
                  style={[styles.miniAvatar, { borderColor: palette.borderCard }]}
                />
                <FancyText
                  size='extraSmall'
                  type='normal'
                  color={palette.fonts.dark}
                  numberOfLines={2}
                  style={styles.miniName}
                >
                  {substitutoNomeCurto}
                </FancyText>
              </View>
            </View>
          </View>

          {hasMenu ? (
            <Pressable
              onPress={() => setMenuOpen(true)}
              hitSlop={8}
              style={[
                styles.kebabBtn,
                { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.1) },
              ]}
              accessibilityRole='button'
              accessibilityLabel='Mais ações'
            >
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='more-vert'
                size={20}
                color={palette.fonts.dark}
              />
            </Pressable>
          ) : null}
        </View>

        {motivo ? (
          <View
            style={[
              styles.motivoCard,
              { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08) },
            ]}
          >
            <FancyText size='extraSmall' type='bold' color={palette.fonts.inactive} style={styles.motivoLabel}>
              Motivo:
            </FancyText>
            <FancyText
              size='extraSmall'
              type='semiBold'
              color={palette.fonts.dark}
              style={styles.motivoText}
              numberOfLines={1}
            >
              {motivo}
            </FancyText>
          </View>
        ) : null}
      </View>

      <FancyActionSheet
        visible={menuOpen}
        title='Ações'
        actions={sheetActions}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBlock: {
    width: 60,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 1,
  },
  dateMonth: {
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  dateDay: {
    fontSize: 22,
    lineHeight: 26,
  },
  dateDivider: {
    height: 1,
    width: 28,
    marginVertical: 3,
  },
  dateHourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dateHour: {
    lineHeight: 12,
  },
  headerRight: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  pillText: {
    fontSize: 10,
    lineHeight: 12,
  },
  miniPeopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniArrowContainer: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPersonGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
  },
  miniName: {
    flex: 1,
    minWidth: 0,
    opacity: 0.75,
    lineHeight: 13,
  },
  kebabBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  motivoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  motivoLabel: {
    letterSpacing: 0.2,
  },
  motivoText: {
    flexShrink: 1,
    opacity: 0.75,
  },
});
