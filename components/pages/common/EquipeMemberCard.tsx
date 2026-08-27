import React, { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyChips from '../../FancyChips';
import FancyText from '../../FancyText';
import FancyButton from '../../buttons/FancyButton';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import { AppImages } from '../../../assets/app_images';
import { ResponseEquipeOcorrenciaIntegranteDto } from '../../../domain/dtos/Evento/evento-equipe.response';
import {
  EscalaItemStatusEnum,
  EscalaItemStatusEnumLabel,
} from '../../../domain/enums/Escala/escala-item-status.enum';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { getFirstAndLastName } from '../../../utils/text_utils';

type Integrante = ResponseEquipeOcorrenciaIntegranteDto & { nomeFuncao: string };

type Props = {
  integrante: Integrante;
  isCurrentUser: boolean;
  isLeaderMode: boolean;
  dimmed: boolean;
  index: number;
  onSubstituir: (escalaItemId: string) => void;
  onRemover?: (escalaItemId: string) => void;
};

type StatusMeta = {
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const AVATAR_SIZE = 52;
const STATUS_DOT_SIZE = 16;

function getPersonColor(palette: ReturnType<typeof usePallete>, seed: string): string {
  const options = palette.team;
  return options[seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % options.length];
}

function EquipeMemberCard({
  integrante,
  isCurrentUser,
  isLeaderMode,
  dimmed,
  index,
  onSubstituir,
  onRemover,
}: Props) {
  const palette = usePallete();
  const [profileVisible, setProfileVisible] = useState(false);

  const voluntario = integrante.voluntario;
  const isOpenSlot = !voluntario;
  const imageUri = voluntario?.fotoThumbUrl ?? voluntario?.fotoUrl ?? '';
  const displayName = voluntario?.nome ? getFirstAndLastName(voluntario.nome) : 'Vaga aberta';
  const displayRole = integrante.nomeFuncao;
  const statusEnum = integrante.status as EscalaItemStatusEnum;
  const statusLabel = EscalaItemStatusEnumLabel[statusEnum] ?? 'Pendente';

  const statusMeta = useMemo<StatusMeta | null>(() => {
    switch (statusEnum) {
      case EscalaItemStatusEnum.Confirmado:
        return { color: palette.confirm, icon: 'check' };
      case EscalaItemStatusEnum.Pendente:
        return { color: palette.warning, icon: 'clock-outline' };
      case EscalaItemStatusEnum.Ausente:
        return { color: palette.error, icon: 'close' };
      case EscalaItemStatusEnum.Substituido:
        return { color: palette.error, icon: 'swap-horizontal' };
      case EscalaItemStatusEnum.SubstituicaoSolicitada:
        return { color: palette.warning, icon: 'clock-alert-outline' };
      default:
        return null;
    }
  }, [palette.confirm, palette.error, palette.warning, statusEnum]);

  const roleSubtitle = displayRole;

  const personColor = useMemo(
    () => getPersonColor(palette, voluntario?.id || integrante.escalaItemId),
    [palette, voluntario?.id, integrante.escalaItemId],
  );

  const initials = useMemo(() => {
    if (!voluntario?.nome) return '';
    const parts = voluntario.nome.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }, [voluntario?.nome]);

  const canAssign = isLeaderMode && isOpenSlot;
  const canOpenProfile = !isOpenSlot;

  const handlePress = () => {
    if (canAssign) {
      onSubstituir(integrante.escalaItemId);
    } else if (canOpenProfile) {
      setProfileVisible(true);
    }
  };

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 18, 180)).duration(240)}
        style={styles.cardWrap}
      >
        <Pressable
          onPress={handlePress}
          disabled={!canAssign && !canOpenProfile}
          style={[
            styles.card,
            { backgroundColor: palette.backgroundColor, borderColor: palette.borderCard },
            isOpenSlot && {
              borderStyle: 'dashed',
              borderColor: ColorUtils.withAlpha(palette.team[1], 0.35),
              backgroundColor: ColorUtils.withAlpha(palette.team[1], 0.08),
            },
            isCurrentUser && {
              borderColor: ColorUtils.withAlpha(palette.team[0], 0.35),
              backgroundColor: ColorUtils.withAlpha(palette.team[0], 0.08),
            },
            dimmed && styles.cardDimmed,
          ]}
        >
          <View style={styles.avatarWrap}>
            {isOpenSlot ? (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: ColorUtils.withAlpha(palette.team[1], 0.14) },
                ]}
              >
                <MaterialCommunityIcons name='plus' size={24} color={palette.team[1]} />
              </View>
            ) : imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={[styles.avatar, { backgroundColor: palette.backgroundColor3 }]}
                cachePolicy='memory-disk'
                transition={120}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: personColor }]}>
                <FancyText type='bold' size='medium' color={palette.fonts.light}>
                  {initials}
                </FancyText>
              </View>
            )}

            {!isOpenSlot && statusMeta ? (
              <View
                style={[
                  styles.statusDot,
                  { borderColor: palette.backgroundColor },
                  { backgroundColor: statusMeta.color },
                ]}
              >
                <MaterialCommunityIcons name={statusMeta.icon} size={9} color={palette.fonts.light} />
              </View>
            ) : null}
          </View>

          <View style={styles.nameRow}>
            <FancyText
              type='bold'
              size='small'
              numberOfLines={1}
              style={styles.nameText}
              color={isCurrentUser ? palette.team[0] : palette.fonts.dark}
            >
              {isCurrentUser ? 'Você' : displayName}
            </FancyText>
          </View>

          <FancyText
            size='extraSmall'
            type='medium'
            numberOfLines={2}
            color={isOpenSlot ? palette.team[1] : palette.fonts.inactive}
            style={styles.roleText}
          >
            {roleSubtitle}
          </FancyText>
        </Pressable>
      </Animated.View>

      <FancyBottomSheetModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        title='Perfil do voluntário'
        footer={
          isLeaderMode ? (
            <View style={styles.profileFooterButtons}>
              <FancyButton
                label='Substituir'
                type='outlined'
                containerStyle={styles.profileFooterButton}
                onPress={() => {
                  setProfileVisible(false);
                  onSubstituir(integrante.escalaItemId);
                }}
              />
              {onRemover ? (
                <FancyButton
                  label='Remover'
                  type='outlined'
                  containerStyle={[styles.profileFooterButton, { borderColor: palette.error }]}
                  labelProps={{ color: palette.error }}
                  onPress={() => {
                    setProfileVisible(false);
                    onRemover(integrante.escalaItemId);
                  }}
                />
              ) : null}
            </View>
          ) : undefined
        }
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
                    color={palette.team[0]}
                    backgroundColor={ColorUtils.withAlpha(palette.team[0], 0.08)}
                  />
                ) : null}
              </View>
              <FancyText size='small' type='medium' color={palette.fonts.inactive}>
                {displayRole}
              </FancyText>
            </View>
          </View>

          <View style={styles.profileInfoList}>
            <ProfileInfoRow
              icon='check-circle-outline'
              label='Status na escala'
              value={statusLabel}
              palette={palette}
            />
            <ProfileInfoRow
              icon='phone-outline'
              label='Telefone'
              value={voluntario?.telefone || 'Não informado'}
              palette={palette}
            />
            <ProfileInfoRow
              icon='email-outline'
              label='Email'
              value={voluntario?.email || 'Não informado'}
              palette={palette}
            />
          </View>
        </View>
      </FancyBottomSheetModal>
    </>
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
    flex: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  cardDimmed: {
    opacity: 0.32,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: 'relative',
    marginBottom: 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: STATUS_DOT_SIZE,
    height: STATUS_DOT_SIZE,
    borderRadius: STATUS_DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  nameText: {
    flexShrink: 1,
  },
  roleText: {
    textAlign: 'center',
  },
  profileFooterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  profileFooterButton: {
    flex: 1,
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
    gap: 4,
    minWidth: 0,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
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

export default memo(
  EquipeMemberCard,
  (prev, next) =>
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
    prev.dimmed === next.dimmed &&
    prev.onRemover === next.onRemover,
);
