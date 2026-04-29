import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyText from '../../FancyText';
import { ResponseEquipeOcorrenciaIntegranteDto } from '../../../domain/dtos/Evento/evento-equipe.response';
import { EscalaItemStatusEnum } from '../../../domain/enums/Escala/escala-item-status.enum';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { getFirstAndLastName } from '../../../utils/text_utils';

type Integrante = ResponseEquipeOcorrenciaIntegranteDto & { nomeFuncao: string };

type Props = {
  integrante: Integrante;
  isCurrentUser: boolean;
  isLeaderMode: boolean;
  index: number;
  onSubstituir: (escalaItemId: string) => void;
};

// Badge de status — só para status != Confirmado
type StatusBadgeMeta = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

const STATUS_BADGE: Partial<Record<EscalaItemStatusEnum, StatusBadgeMeta>> = {
  [EscalaItemStatusEnum.Pendente]: {
    label: 'convite pendente',
    icon: 'clock-outline',
    color: '#F59E0B',
  },
  [EscalaItemStatusEnum.Ausente]: {
    label: 'convite recusado',
    icon: 'close',
    color: '#EF4444',
  },
  [EscalaItemStatusEnum.Substituido]: {
    label: 'substituído',
    icon: 'swap-horizontal',
    color: '#EF4444',
  },
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
    label: 'substituição solicitada',
    icon: 'clock-alert-outline',
    color: '#F59E0B',
  },
  // EscalaItemStatusEnum.Confirmado => ausente do mapa = não renderiza badge
};

// ─── Constantes de layout ───────────────────────────────────────────────────
const AVATAR_SIZE = 56;
const BADGE_SIZE  = 18;

// Padding ajustável por borda: normal=10/12, isSelf=9/11 (compensa borda 2px)
const PAD_H_NORMAL = 10;
const PAD_V_NORMAL = 12;
const PAD_H_SELF   =  9;
const PAD_V_SELF   = 11;

// Paleta de cores para chips de função (determinística por nome da função)
const ROLE_CHIP_COLORS = [
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#84CC16', // lime
  '#0EA5E9', // sky
  '#A855F7', // purple
];

function getRoleChipColor(roleName: string): string {
  const idx = roleName
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % ROLE_CHIP_COLORS.length;
  return ROLE_CHIP_COLORS[idx];
}

// ─── Componente ─────────────────────────────────────────────────────────────
function EquipeMemberCard({ integrante, isCurrentUser, isLeaderMode, index, onSubstituir }: Props) {
  const palette = usePallete();

  const voluntario    = integrante.voluntario;
  const isOpenSlot    = !voluntario;
  const imageUri      = voluntario?.fotoThumbUrl ?? voluntario?.fotoUrl ?? '';
  const hasPhoto      = !!imageUri;

  // Primeiro + último nome via utilitário do projeto
  const displayName   = voluntario?.nome ? getFirstAndLastName(voluntario.nome) : 'Vaga aberta';

  // Função: troca hífens ASCII por non-breaking hyphen para evitar quebra indevida
  const displayRole   = integrante.nomeFuncao.replace(/-/g, '\u2011');

  // Cor do chip de função — determinística pelo nome da função
  const roleChipColor = useMemo(
    () => getRoleChipColor(integrante.nomeFuncao),
    [integrante.nomeFuncao],
  );
  const roleChipBg   = ColorUtils.withAlpha(roleChipColor, 0.12);
  const roleTextColor = ColorUtils.darkenColor(roleChipColor, 0.05);

  // Iniciais para o fallback de avatar (até 2 palavras)
  const avatarInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  const statusEnum  = integrante.status as EscalaItemStatusEnum;
  const statusBadge = useMemo<StatusBadgeMeta | null>(
    () => STATUS_BADGE[statusEnum] ?? null,
    [statusEnum],
  );

  // ── Cor determinística do avatar (sem foto) ──────────────────────────────
  const avatarSeedPalette = [
    palette.primary,
    palette.secondary,
    palette.terciary,
    palette.warning,
    palette.confirm,
  ];
  const seedIdx   = displayName
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % avatarSeedPalette.length;
  const avatarBg        = ColorUtils.lightenColor(avatarSeedPalette[seedIdx], 0.72);
  const avatarTextColor = ColorUtils.darkenColor(avatarSeedPalette[seedIdx], 0.12);

  // ── Aparência do card ─────────────────────────────────────────────────────
  const cardBg          = isCurrentUser ? '#EFF6FF' : '#FFFFFF';
  const cardBorderColor = isCurrentUser ? '#3B82F6' : '#E5E7EB';
  const cardBorderWidth = isCurrentUser ? 2 : 1;
  const cardShadow      = isCurrentUser
    ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }
    : { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 };
  const padH = isCurrentUser ? PAD_H_SELF : PAD_H_NORMAL;
  const padV = isCurrentUser ? PAD_V_SELF : PAD_V_NORMAL;

  // ── Posição do badge de status ────────────────────────────────────────────
  const statusBadgePosition = { top: -2, right: -2 };

  // ── Acessibilidade ────────────────────────────────────────────────────────
  const a11yLabel = [
    displayName,
    integrante.nomeFuncao,
    isCurrentUser ? 'você' : undefined,
    statusBadge ? statusBadge.label : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 22, 220)).duration(260)}
      style={styles.cardWrap}
    >
      <Pressable
        onPress={isLeaderMode ? () => onSubstituir(integrante.escalaItemId) : undefined}
        accessibilityRole='button'
        accessibilityLabel={a11yLabel}
        style={[
          styles.surface,
          {
            backgroundColor: cardBg,
            borderColor: cardBorderColor,
            borderWidth: cardBorderWidth,
            paddingHorizontal: padH,
            paddingVertical: padV,
          },
          cardShadow,
        ]}
      >
        {/* ── Botão substituir (modo líder) ── */}
        {isLeaderMode ? (
          <Pressable
            onPress={() => onSubstituir(integrante.escalaItemId)}
            accessibilityRole='button'
            accessibilityLabel={voluntario ? 'Substituir voluntário' : 'Atribuir voluntário'}
            style={[
              styles.swapButton,
              {
                backgroundColor: ColorUtils.withAlpha(palette.backgroundColor, 0.96),
                borderColor: ColorUtils.withAlpha(palette.primary, 0.18),
              },
            ]}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={voluntario ? 'swap-horizontal' : 'account-plus'}
              size={12}
              color={palette.primary}
            />
          </Pressable>
        ) : null}

        {/* ── Avatar 56×56 circular ── */}
        <View style={styles.avatarWrap}>
          {isOpenSlot ? (
            <View
              style={[
                styles.avatar,
                styles.avatarOpen,
                {
                  borderColor: ColorUtils.withAlpha(palette.borderCard, 0.6),
                  backgroundColor: palette.backgroundColor3,
                },
              ]}
            >
              <MaterialCommunityIcons
                name='account-plus-outline'
                size={24}
                color={palette.fonts.inactive2}
              />
            </View>
          ) : hasPhoto ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatar}
              contentFit='cover'
              transition={120}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <FancyText type='semiBold' style={[styles.initialsText, { color: avatarTextColor }]}>
                {avatarInitials || '?'}
              </FancyText>
            </View>
          )}

          {/* Badge de status: só quando != Confirmado */}
          {!isOpenSlot && statusBadge ? (
            <View
              style={[
                styles.statusBadge,
                statusBadgePosition,
                { backgroundColor: statusBadge.color },
              ]}
            >
              <MaterialCommunityIcons name={statusBadge.icon} size={9} color='#FFFFFF' />
            </View>
          ) : null}
        </View>

        {/* ── Bloco função + nome: centralizado verticalmente abaixo do avatar ── */}
        <View style={styles.textBlock}>

          {/* Chip de função — destaque principal */}
          {isOpenSlot ? (
            <View style={[styles.roleChip, { backgroundColor: ColorUtils.withAlpha(palette.borderCard, 0.3) }]}>
              <FancyText type='semiBold' numberOfLines={2} style={[styles.roleChipText, { color: palette.fonts.inactive }]}>
                Vaga aberta
              </FancyText>
            </View>
          ) : (
            <View style={[styles.roleChip, { backgroundColor: roleChipBg }]}>
              <FancyText type='semiBold' numberOfLines={2} style={[styles.roleChipText, { color: roleTextColor }]}>
                {displayRole}
              </FancyText>
            </View>
          )}

          {/* Nome — identificação secundária, ou "Você" para o usuário logado */}
          {isCurrentUser ? (
            <FancyText type='semiBold' style={styles.youText}>
              Você
            </FancyText>
          ) : (
            <FancyText
              type='semiBold'
              numberOfLines={2}
              ellipsizeMode='tail'
              style={[
                styles.nameText,
                { color: isOpenSlot ? palette.fonts.inactive2 : '#374151' },
              ]}
            >
              {isOpenSlot ? 'Aguardando escala' : displayName}
            </FancyText>
          )}
        </View>

      </Pressable>
    </Animated.View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardWrap: {
    flex: 1,
    width: '100%',
    minHeight: 44,
  },
  surface: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  swapButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 2,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginBottom: 8,
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarOpen: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  initialsText: {
    fontSize: 18,
    lineHeight: 20,
    includeFontPadding: false,
    color: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  // Bloco texto — chip ancorado no topo, nome imediatamente abaixo
  // justifyContent:'flex-start' garante que o chip começa sempre na mesma
  // coordenada Y em todos os cards da linha, independente da altura do card
  textBlock: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    gap: 5,
  },
  // Chip de função — cresce com o conteúdo, nunca trunca
  roleChip: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 22,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: {
    fontSize: 11,
    lineHeight: 14,
    includeFontPadding: false,
    textAlign: 'center',
  },
  // Nome — identificação secundária, mais destaque que antes mas abaixo do chip
  nameText: {
    fontSize: 12,
    lineHeight: 15,
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',
  },
  // "Você" — substitui o nome para o usuário logado
  youText: {
    fontSize: 12,
    lineHeight: 15,
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',
    color: '#3B82F6',
  },
});

export default memo(EquipeMemberCard, (prev, next) =>
  prev.integrante.escalaItemId === next.integrante.escalaItemId &&
  prev.integrante.status       === next.integrante.status &&
  prev.integrante.voluntarioId === next.integrante.voluntarioId &&
  prev.isCurrentUser           === next.isCurrentUser &&
  prev.isLeaderMode            === next.isLeaderMode,
);
