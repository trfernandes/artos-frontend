import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyText from '../../FancyText';
import { EscalaItemStatusEnum } from '../../../domain/enums/Escala/escala-item-status.enum';
import { usePallete } from '../../../hooks/usePallete';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ColorUtils } from '../../../utils/color_utils';

const BADGE_AVATAR_SIZE = 44;
const RING_WIDTH = 2;

export type PessoaFuncaoStatus = {
  key: string;
  nomeFuncao: string;
  status: EscalaItemStatusEnum;
};

export type PessoaChamadaRow = {
  kind: 'pessoa';
  key: string;
  nome: string;
  fotoUrl?: string | null;
  isCurrentUser: boolean;
  funcoes: PessoaFuncaoStatus[];
};

export type VagaChamadaRow = {
  kind: 'vaga';
  key: string;
  nomeFuncao: string;
};

export type ChamadaGridItem = PessoaChamadaRow | VagaChamadaRow;

export type GridPairRow = {
  kind: 'grid-pair';
  key: string;
  items: ChamadaGridItem[];
};

export type ChamadaRow = GridPairRow;

/** Agrupa itens em pares pra grid 2 colunas, preservando ordem. */
export function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

/** Cor semântica de um status individual. */
function statusColor(palette: ReturnType<typeof usePallete>, status: EscalaItemStatusEnum) {
  if (
    status === EscalaItemStatusEnum.Ausente ||
    status === EscalaItemStatusEnum.Substituido ||
    status === EscalaItemStatusEnum.SubstituicaoSolicitada
  ) {
    return palette.error;
  }
  if (status === EscalaItemStatusEnum.Confirmado) return palette.confirm;
  return palette.warning;
}

function PessoaBadge({ nome, fotoUrl, isCurrentUser, funcoes }: PessoaChamadaRow) {
  const { palette, isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;

  const initials = useMemo(() => {
    const parts = nome.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }, [nome]);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cardBg,
          borderColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, 0.45),
        },
        { ...palette.shadows[200] },
        isCurrentUser && {
          borderColor: palette.primary,
          borderWidth: 1.5,
        },
      ]}
    >
      <View style={[styles.ring, { borderColor: ColorUtils.withAlpha(palette.border, 0.6) }]}>
        {fotoUrl ? (
          <Image
            source={{ uri: fotoUrl }}
            style={styles.avatarImage}
            cachePolicy='memory-disk'
            transition={120}
          />
        ) : (
          <View
            style={[
              styles.avatarLetter,
              { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14) },
            ]}
          >
            <FancyText type='bold' size='medium' color={palette.primary}>
              {initials}
            </FancyText>
          </View>
        )}
      </View>

      <View style={styles.badgeTextWrap}>
        <FancyText
          type='bold'
          size='small'
          numberOfLines={1}
          color={palette.fonts.dark}
          style={styles.badgeName}
        >
          {nome}
        </FancyText>
        <View style={styles.funcaoList}>
          {funcoes.map((f) => {
            const color = statusColor(palette, f.status);
            return (
              <View key={f.key} style={styles.funcaoRow}>
                <View style={[styles.funcaoDot, { backgroundColor: color }]} />
                <FancyText
                  type='medium'
                  size='extraSmall'
                  numberOfLines={1}
                  color={palette.fonts.inactive}
                  style={styles.funcaoText}
                >
                  {f.nomeFuncao}
                </FancyText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function VagaBadge({ nomeFuncao }: VagaChamadaRow) {
  const { palette, isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;

  return (
    <View
      style={[
        styles.badge,
        styles.vagaBadge,
        {
          backgroundColor: cardBg,
          borderColor: ColorUtils.withAlpha(palette.border, 0.6),
        },
        { ...palette.shadows[200] },
      ]}
    >
      <View
        style={[
          styles.ring,
          styles.ringDashed,
          { borderColor: ColorUtils.withAlpha(palette.border, 0.6) },
        ]}
      >
        <View
          style={[
            styles.avatarLetter,
            { backgroundColor: ColorUtils.withAlpha(palette.team[1], 0.14) },
          ]}
        >
          <MaterialCommunityIcons name='plus' size={22} color={palette.team[1]} />
        </View>
      </View>

      <View style={styles.badgeTextWrap}>
        <FancyText
          type='bold'
          size='small'
          numberOfLines={1}
          color={palette.team[1]}
          style={styles.badgeName}
        >
          Vaga aberta
        </FancyText>
        <FancyText
          type='medium'
          size='extraSmall'
          numberOfLines={1}
          color={palette.fonts.inactive}
          style={styles.badgeFuncao}
        >
          {nomeFuncao}
        </FancyText>
      </View>
    </View>
  );
}

export function ChamadaGridRowView({ items }: GridPairRow) {
  return (
    <View style={styles.gridRow}>
      {items.map((item) =>
        item.kind === 'vaga' ? (
          <VagaBadge key={item.key} kind={item.kind} nomeFuncao={item.nomeFuncao} />
        ) : (
          <PessoaBadge
            key={item.key}
            kind={item.kind}
            nome={item.nome}
            fotoUrl={item.fotoUrl}
            isCurrentUser={item.isCurrentUser}
            funcoes={item.funcoes}
          />
        ),
      )}
    </View>
  );
}

export const ChamadaGridRow = memo(ChamadaGridRowView);

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  vagaBadge: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  ring: {
    width: BADGE_AVATAR_SIZE,
    height: BADGE_AVATAR_SIZE,
    borderRadius: BADGE_AVATAR_SIZE / 2,
    borderWidth: RING_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDashed: {
    borderStyle: 'dashed',
  },
  avatarImage: {
    width: BADGE_AVATAR_SIZE - RING_WIDTH * 2 - 4,
    height: BADGE_AVATAR_SIZE - RING_WIDTH * 2 - 4,
    borderRadius: (BADGE_AVATAR_SIZE - RING_WIDTH * 2 - 4) / 2,
  },
  avatarLetter: {
    width: BADGE_AVATAR_SIZE - RING_WIDTH * 2 - 4,
    height: BADGE_AVATAR_SIZE - RING_WIDTH * 2 - 4,
    borderRadius: (BADGE_AVATAR_SIZE - RING_WIDTH * 2 - 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextWrap: {
    flex: 1,
    gap: 4,
  },
  badgeName: {},
  badgeFuncao: {},
  funcaoList: {
    alignItems: 'flex-start',
    gap: 0,
  },
  funcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  funcaoText: {
    flexShrink: 1,
  },
  funcaoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
