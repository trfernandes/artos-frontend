import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyChips from '../../FancyChips';
import FancyText from '../../FancyText';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyBaseCard from '../../cards/Horizontal/FancyBaseCard';
import { FancyActionButtons } from '../../cards/Horizontal/FancyCardActionButtons';
import { AppImages } from '../../../assets/app_images';
import { ResponseEquipeOcorrenciaIntegranteDto } from '../../../domain/dtos/Evento/evento-equipe.response';
import { EscalaItemStatusEnum, EscalaItemStatusEnumLabel } from '../../../domain/enums/Escala/escala-item-status.enum';
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
  onRemover?: (escalaItemId: string) => void;
};

type StatusBadgeMeta = {
  label: string;
  shortLabel: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

const AVATAR_SIZE = 40;
const STATUS_DOT_SIZE = 18;

const ROLE_CHIP_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#84CC16',
  '#0EA5E9',
  '#A855F7',
];

function getRoleChipColor(roleName: string): string {
  return ROLE_CHIP_COLORS[
    roleName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % ROLE_CHIP_COLORS.length
  ];
}

function EquipeMemberCard({ integrante, isCurrentUser, isLeaderMode, index, onSubstituir, onRemover }: Props) {
  const palette = usePallete();
  const isDark = palette.backgroundColor === '#121212';
  const [profileVisible, setProfileVisible] = useState(false);

  const voluntario = integrante.voluntario;
  const isOpenSlot = !voluntario;
  const imageUri = voluntario?.fotoThumbUrl ?? voluntario?.fotoUrl ?? '';
  const displayName = voluntario?.nome ? getFirstAndLastName(voluntario.nome) : 'Vaga aberta';
  const displayRole = integrante.nomeFuncao.replace(/-/g, '\u2011');
  const statusEnum = integrante.status as EscalaItemStatusEnum;

  const statusBadge = useMemo<StatusBadgeMeta | null>(() => {
    switch (statusEnum) {
      case EscalaItemStatusEnum.Confirmado:
        return null;
      case EscalaItemStatusEnum.Pendente:
        return {
          label: 'convite pendente',
          shortLabel: 'Pendente',
          icon: 'clock-outline',
          color: palette.warning,
        };
      case EscalaItemStatusEnum.Ausente:
        return {
          label: 'convite recusado',
          shortLabel: 'Ausente',
          icon: 'close-circle-outline',
          color: palette.error,
        };
      case EscalaItemStatusEnum.Substituido:
        return {
          label: 'substituído',
          shortLabel: 'Substituído',
          icon: 'swap-horizontal',
          color: palette.error,
        };
      case EscalaItemStatusEnum.SubstituicaoSolicitada:
        return {
          label: 'substituição solicitada',
          shortLabel: 'Troca pedida',
          icon: 'clock-alert-outline',
          color: palette.warning,
        };
      default:
        return null;
    }
  }, [palette.confirm, palette.error, palette.warning, statusEnum]);

  const roleChipColor = useMemo(
    () => getRoleChipColor(integrante.nomeFuncao),
    [integrante.nomeFuncao],
  );
  const roleChipBg = ColorUtils.withAlpha(roleChipColor, isDark ? 0.2 : 0.12);
  const roleChipBorder = ColorUtils.withAlpha(roleChipColor, isDark ? 0.38 : 0.2);
  const roleTextColor = isDark
    ? ColorUtils.lightenColor(roleChipColor, 0.18)
    : ColorUtils.darkenColor(roleChipColor, 0.05);

  const a11yLabel = [
    displayName,
    integrante.nomeFuncao,
    isCurrentUser ? 'você' : undefined,
    !isOpenSlot && statusBadge ? statusBadge.label : undefined,
    isLeaderMode ? (isOpenSlot ? 'atribuir voluntário' : 'substituir voluntário') : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  const statusLabel = EscalaItemStatusEnumLabel[statusEnum] ?? 'Pendente';
  const actionIcon = voluntario ? 'swap-horizontal' : 'account-plus-outline';
  const actionLabel = voluntario ? 'Substituir voluntário' : 'Atribuir voluntário';
  const actionButtons = [
    ...(isLeaderMode
      ? [
        {
          icon: {
            library: 'MaterialCommunityIcons' as const,
            name: actionIcon,
            size: 17,
          },
          size: 'small' as const,
          onPress: () => onSubstituir(integrante.escalaItemId),
        },
        ...(voluntario && onRemover
          ? [
              {
                icon: {
                  library: 'MaterialCommunityIcons' as const,
                  name: 'trash-can-outline' as const,
                  size: 16,
                  backgroundColor: palette.error,
                },
                size: 'small' as const,
                onPress: () => onRemover(integrante.escalaItemId),
              },
            ]
          : []),
      ]
      : []),
    ...(voluntario
      ? [
          {
            icon: {
              library: 'MaterialCommunityIcons' as const,
              name: 'chevron-right' as const,
              size: 18,
              backgroundColor: palette.backgroundColor3,
              color: palette.icons.inactive,
            },
            size: 'small' as const,
            onPress: () => setProfileVisible(true),
          },
        ]
      : []),
  ];

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 18, 180)).duration(240)}
        style={styles.cardWrap}
      >
        <FancyBaseCard
          title={displayName}
          subtitle={isOpenSlot ? 'Aguardando escala' : undefined}
          titleProps={{ style: { color: isCurrentUser ? palette.primary : palette.fonts.dark } }}
          containerStyle={[
            styles.cardContainer,
            isCurrentUser && {
              borderWidth: 1,
              borderColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.46 : 0.26),
            },
          ]}
          contentContainerStyle={styles.cardContent}
          centerContainerStyle={styles.cardCenter}
          leftItem={
            <AvatarWithStatus
              imageUri={imageUri}
              isOpenSlot={isOpenSlot}
              statusBadge={statusBadge}
              palette={palette}
              isDark={isDark}
            />
          }
          rightItem={actionButtons.length > 0 ? <FancyActionButtons actions={actionButtons} /> : undefined}
          onPress={!isOpenSlot ? () => setProfileVisible(true) : undefined}
          additionalData1={
            <View style={styles.metaRow}>
              <FancyChips
                size='small'
                label={displayRole}
                color={roleTextColor}
                backgroundColor={roleChipBg}
                style={[styles.roleChip, { borderColor: roleChipBorder }]}
                labelProps={{
                  numberOfLines: 1,
                  ellipsizeMode: 'tail',
                  style: styles.roleChipText,
                }}
              />
              {isCurrentUser ? (
                <View
                  style={[
                    styles.currentUserBadge,
                    {
                      backgroundColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.14 : 0.08),
                      borderColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.26 : 0.16),
                    },
                  ]}
                >
                  <FancyText type='bold' numberOfLines={1} style={[styles.currentUserText, { color: palette.primary }]}>
                    Você
                  </FancyText>
                </View>
              ) : null}
            </View>
          }
        />
        {isLeaderMode ? (
          <View style={styles.accessibilityLabel} accessible accessibilityLabel={a11yLabel} accessibilityHint={actionLabel}>
            <FancyText>{''}</FancyText>
          </View>
        ) : null}
      </Animated.View>

      <FancyBottomSheetModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        title='Perfil do voluntário'
      >
        <View style={styles.profileSheet}>
          <View style={styles.profileHeader}>
            <Image
              source={imageUri ? { uri: imageUri } : AppImages.emptyProfile}
              style={styles.profileAvatar}
              cachePolicy='memory-disk'
              transition={120}
            />
            <View style={styles.profileIdentity}>
              <View style={styles.profileNameRow}>
                <FancyText type='bold' size='medium' color={palette.fonts.dark} numberOfLines={2}>
                  {voluntario?.nome || displayName}
                </FancyText>
                {isCurrentUser ? (
                  <FancyChips
                    label='Você'
                    size='small'
                    color={palette.primary}
                    backgroundColor={ColorUtils.withAlpha(palette.primary, isDark ? 0.14 : 0.08)}
                  />
                ) : null}
              </View>
              <FancyChips
                label={displayRole}
                size='small'
                color={roleTextColor}
                backgroundColor={roleChipBg}
                style={[styles.profileRoleChip, { borderColor: roleChipBorder }]}
              />
            </View>
          </View>

          <View style={styles.profileInfoList}>
            <ProfileInfoRow icon='check-circle-outline' label='Status na escala' value={statusLabel} palette={palette} />
            <ProfileInfoRow icon='phone-outline' label='Telefone' value={voluntario?.telefone || 'Não informado'} palette={palette} />
            <ProfileInfoRow icon='email-outline' label='Email' value={voluntario?.email || 'Não informado'} palette={palette} />
          </View>
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

function AvatarWithStatus({
  imageUri,
  isOpenSlot,
  statusBadge,
  palette,
  isDark,
}: {
  imageUri: string;
  isOpenSlot: boolean;
  statusBadge: StatusBadgeMeta | null;
  palette: ReturnType<typeof usePallete>;
  isDark: boolean;
}) {
  return (
    <View style={styles.avatarWrap}>
      {isOpenSlot ? (
        <View
          style={[
            styles.avatarFallback,
            {
              backgroundColor: ColorUtils.withAlpha(palette.primary, isDark ? 0.28 : 0.16),
            },
          ]}
        >
          <MaterialCommunityIcons name='account-plus-outline' size={20} color={palette.primary} />
        </View>
      ) : (
        <Image
          source={imageUri ? { uri: imageUri } : AppImages.emptyProfile}
          style={styles.avatarImage}
          cachePolicy='memory-disk'
          transition={120}
        />
      )}

      {!isOpenSlot && statusBadge ? (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: statusBadge.color,
              borderColor: palette.backgroundColor2,
            },
          ]}
        >
          <MaterialCommunityIcons name={statusBadge.icon} size={10} color={palette.fonts.light} />
        </View>
      ) : null}
    </View>
  );
}

function ProfileInfoRow({
  icon,
  label,
  value,
  palette,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  palette: ReturnType<typeof usePallete>;
}) {
  return (
    <View style={styles.profileInfoRow}>
      <MaterialCommunityIcons name={icon} size={17} color={palette.primary} />
      <View style={styles.profileInfoText}>
        <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive}>
          {label}
        </FancyText>
        <FancyText type='semiBold' size='small' color={palette.fonts.dark} numberOfLines={2}>
          {value}
        </FancyText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
  },
  cardContainer: {
    borderRadius: 28,
    paddingVertical: 12,
    marginBottom: 2,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  cardCenter: {
    gap: 2,
    justifyContent: 'center',
    paddingRight: 8,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: 5,
    position: 'relative',
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentUserText: {
    fontSize: 9.5,
    lineHeight: 11,
    includeFontPadding: false,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    marginTop: 3,
    alignSelf: 'stretch',
  },
  roleChip: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  roleChipText: {
    fontSize: 11,
    lineHeight: 12.5,
    includeFontPadding: false,
  },
  accessibilityLabel: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  profileSheet: {
    gap: 18,
    paddingBottom: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  profileIdentity: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  profileRoleChip: {
    alignSelf: 'flex-start',
  },
  profileInfoList: {
    gap: 12,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  profileInfoText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});

export default memo(EquipeMemberCard, (prev, next) =>
  prev.integrante.escalaItemId === next.integrante.escalaItemId &&
  prev.integrante.status === next.integrante.status &&
  prev.integrante.voluntarioId === next.integrante.voluntarioId &&
  prev.integrante.nomeFuncao === next.integrante.nomeFuncao &&
  prev.integrante.voluntario?.nome === next.integrante.voluntario?.nome &&
  prev.integrante.voluntario?.email === next.integrante.voluntario?.email &&
  prev.integrante.voluntario?.telefone === next.integrante.voluntario?.telefone &&
  prev.integrante.voluntario?.fotoThumbUrl === next.integrante.voluntario?.fotoThumbUrl &&
  prev.isCurrentUser === next.isCurrentUser &&
  prev.isLeaderMode === next.isLeaderMode &&
  prev.onRemover === next.onRemover,
);
