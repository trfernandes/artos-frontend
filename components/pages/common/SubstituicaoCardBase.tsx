import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import FancyActionSheet, { FancyActionSheetItem } from '../../actions/FancyActionSheet';
import FancyButton from '../../buttons/FancyButton';
import FancyChips from '../../FancyChips';
import FancySeparator from '../../FancySeparator';
import { AppImages } from '../../../assets/app_images';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import {
  EscalaSubstituicaoStatusEnum,
  EscalaSubstituicaoStatusEnumLabel,
} from '../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../domain/dtos/Escala/escala-substituicao.response';
import { DateUtilsApi } from '../../../utils/date_utils';
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
  isSubstituto?: boolean;
  onCancelar?: () => void;
};

export default function SubstituicaoCardBase({
  substituicao,
  canAct = false,
  actions,
  isActing = false,
  onVerEvento,
  isSolicitante = false,
  isSubstituto,
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

  const dataFormatada = dataOcorrencia
    ? format(dataOcorrencia, "EEE, dd 'de' MMM", { locale: ptBR })
    : '—';
  const horaCurta = dataOcorrencia ? format(dataOcorrencia, "HH'h'mm", { locale: ptBR }) : '';

  const eventoNome = substituicao.escalaItem?.evento?.nome ?? '—';
  const eventoCor = substituicao.escalaItem?.evento?.cor ?? palette.fonts.inactive;
  const funcaoNome = substituicao.escalaItem?.funcao?.nome;

  const firstAndLast = (full?: string) => {
    if (!full?.trim()) return '—';
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const solicitanteNome = isSolicitante ? 'Você' : firstAndLast(solicitanteVol?.nome);
  const substitutoEhVoce = isSubstituto ?? (!isSolicitante && canAct);
  const substitutoNome = substitutoEhVoce ? 'Você' : firstAndLast(substitutoVol?.nome);

  const motivo = substituicao.motivo;

  const podeAceitar = isPendente && canAct && !!actions?.onAceitar;
  const podeRecusar = isPendente && canAct && !!actions?.onRecusar;
  const temAcoesPrimarias = podeAceitar || podeRecusar;

  const sheetActions = useMemo<FancyActionSheetItem[]>(() => {
    const list: FancyActionSheetItem[] = [];
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
  }, [isPendente, isActing, onVerEvento, isSolicitante, onCancelar]);

  const hasMenu = sheetActions.length > 0;

  const renderAvatar = (fotoUrl: string | undefined, highlight?: boolean) => (
    <Image
      source={fotoUrl ? { uri: fotoUrl } : AppImages.emptyProfile}
      style={[
        styles.avatar,
        {
          borderColor: highlight ? palette.primary : palette.borderCard,
          borderWidth: highlight ? 2 : 1,
        },
      ]}
    />
  );

  const renderPersonRow = (
    fotoUrl: string | undefined,
    role: string,
    nome: string,
    highlight: boolean,
    alignRight: boolean,
  ) => {
    const textAlignStyle = alignRight ? { textAlign: 'right' as const } : undefined;
    const textBlock = (
      <View style={[styles.personText, alignRight ? styles.personTextRight : undefined]}>
        <FancyText
          size='extraSmall'
          type='semiBold'
          color={palette.fonts.inactive}
          style={[styles.personRole, textAlignStyle]}
        >
          {role}
        </FancyText>
        <FancyText
          size='extraSmall'
          type='bold'
          color={palette.fonts.dark}
          numberOfLines={2}
          style={textAlignStyle}
        >
          {nome}
        </FancyText>
      </View>
    );

    if (alignRight) {
      return (
        <View style={styles.personRowRight}>
          <View style={styles.personInnerRight}>
            {textBlock}
            {renderAvatar(fotoUrl, highlight)}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.personRow}>
        {renderAvatar(fotoUrl, highlight)}
        {textBlock}
      </View>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderCard,
            ...palette.shadows[100],
          },
        ]}
      >
        <View style={styles.content}>
          {/* HEADER: status + ações icon-only + kebab */}
          <View style={styles.headerRow}>
            <FancyChips
              label={statusLabel}
              color={visual.color}
              size='small'
              outlined
              icon={{
                library: 'MaterialIcons',
                name: visual.icon,
                size: 12,
              }}
            />
            <View style={styles.headerActions}>
              {podeRecusar ? (
                <FancyButton
                  type='text'
                  mode='icon'
                  size={28}
                  icon={{
                    library: 'MaterialIcons',
                    name: 'close',
                    size: 16,
                    color: palette.fonts.inactive,
                  }}
                  onPress={actions?.onRecusar}
                  isLoading={isActing}
                  disabled={isActing}
                  containerStyle={styles.headerActionBtn}
                  accessibilityLabel='Recusar substituição'
                />
              ) : null}
              {podeAceitar ? (
                <FancyButton
                  type='contained'
                  mode='icon'
                  size={28}
                  icon={{
                    library: 'MaterialIcons',
                    name: 'check',
                    size: 16,
                    color: palette.fonts.light,
                  }}
                  onPress={actions?.onAceitar}
                  isLoading={isActing}
                  disabled={isActing}
                  containerStyle={styles.headerActionBtn}
                  accessibilityLabel='Aceitar substituição'
                />
              ) : null}
              {hasMenu ? (
                <Pressable
                  onPress={() => setMenuOpen(true)}
                  hitSlop={10}
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
                    size={18}
                    color={palette.fonts.dark}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* BLOCO 1: EVENTO — nome + meta inline (data/hora · função) */}
          <View style={styles.blockEvento}>
            <View style={styles.eventoTituloRow}>
              <View style={[styles.eventoColorDot, { backgroundColor: eventoCor }]} />
              <FancyText
                type='bold'
                size='medium'
                color={palette.fonts.dark}
                numberOfLines={2}
                style={styles.eventoTitulo}
              >
                {eventoNome}
              </FancyText>
            </View>

            <View style={styles.metaRow}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='calendar-clock-outline'
                size={13}
                color={palette.fonts.inactive}
              />
              <FancyText size='small' type='medium' color={palette.fonts.inactive}>
                {dataFormatada}
                {horaCurta ? ` · ${horaCurta}` : ''}
              </FancyText>
              {funcaoNome ? (
                <>
                  <FancyText
                    size='small'
                    type='normal'
                    color={palette.fonts.inactive}
                    style={styles.metaDot}
                  >
                    ·
                  </FancyText>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='work-outline'
                    size={12}
                    color={isPendente ? palette.primary : palette.fonts.dark}
                  />
                  <FancyText
                    size='small'
                    type='medium'
                    color={isPendente ? palette.primary : palette.fonts.dark}
                    numberOfLines={1}
                    style={styles.metaFuncao}
                  >
                    {funcaoNome}
                  </FancyText>
                </>
              ) : null}
            </View>
          </View>

          <FancySeparator />

          {/* BLOCO 2: PESSOAS — solicitante ↔ substituto (horizontal compacto) */}
          <View style={styles.blockPessoas}>
            {renderPersonRow(
              solicitanteVol?.fotoThumbUrl ?? solicitanteVol?.fotoUrl,
              'Solicitante',
              solicitanteNome,
              isSolicitante,
              false,
            )}

            <View style={styles.swapBubbleWrap}>
              <View
                style={[
                  styles.swapBubble,
                  { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12) },
                ]}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='swap-horiz'
                  size={16}
                  color={palette.primary}
                />
              </View>
            </View>

            {renderPersonRow(
              substitutoVol?.fotoThumbUrl ?? substitutoVol?.fotoUrl,
              'Substituto',
              substitutoNome,
              substitutoEhVoce,
              true,
            )}
          </View>

          {/* BLOCO 3: MOTIVO (só renderiza se existir) */}
          {motivo ? (
            <>
              <FancySeparator />
              <View style={styles.blockMotivoRow}>
                <FancyText
                  size='small'
                  type='semiBold'
                  color={palette.fonts.inactive}
                  style={styles.motivoLabel}
                >
                  Motivo:
                </FancyText>
                <FancyText
                  size='small'
                  type='bold'
                  color={palette.fonts.dark}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  style={styles.motivoTextoInline}
                >
                  {motivo}
                </FancyText>
              </View>
            </>
          ) : null}
        </View>
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
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActionBtn: {
    paddingHorizontal: 0,
  },
  kebabBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockEvento: {
    gap: 4,
  },
  eventoTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventoColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventoTitulo: {
    flex: 1,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  metaDot: {
    opacity: 0.5,
    paddingHorizontal: 1,
  },
  metaFuncao: {
    flexShrink: 1,
  },
  blockPessoas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  personRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  personRowRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  personInnerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  personText: {
    flexShrink: 1,
    minWidth: 0,
    gap: 1,
  },
  personTextRight: {
    alignItems: 'flex-end',
  },
  personRole: {
    opacity: 0.85,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  swapBubbleWrap: {
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockMotivoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  motivoLabel: {
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  motivoTextoInline: {
    flexShrink: 1,
    opacity: 0.9,
  },
});
