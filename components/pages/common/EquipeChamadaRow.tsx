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

export type SecaoChamadaRow = {
  kind: 'secao';
  key: string;
  label: string;
  count: number;
  tone: 'ok' | 'wait';
};

export type ChamadaRow = GridPairRow | SecaoChamadaRow;

/** Agrupa itens em pares pra grid 2 colunas, preservando ordem. */
export function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

function getPersonColor(team: string[], seed: string): string {
  return team[seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % team.length];
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

/** Cor do anel do avatar: reflete o pior status entre as funções da pessoa. */
function ringColor(palette: ReturnType<typeof usePallete>, funcoes: PessoaFuncaoStatus[]) {
  const temProblema = funcoes.some(
    (f) =>
      f.status === EscalaItemStatusEnum.Ausente ||
      f.status === EscalaItemStatusEnum.Substituido ||
      f.status === EscalaItemStatusEnum.SubstituicaoSolicitada,
  );
  if (temProblema) return palette.error;
  const todasConfirmadas = funcoes.every((f) => f.status === EscalaItemStatusEnum.Confirmado);
  return todasConfirmadas ? palette.confirm : palette.warning;
}

export function SecaoChamadaHeader({ label, count, tone }: SecaoChamadaRow) {
  const palette = usePallete();
  const color = tone === 'ok' ? palette.confirm : palette.warning;

  return (
    <View style={styles.secaoHeader}>
      <FancyText
        size='extraSmall'
        type='bold'
        color={palette.fonts.inactive}
        style={styles.secaoLabel}
      >
        {label.toUpperCase()}
      </FancyText>
      <View style={[styles.secaoCount, { backgroundColor: ColorUtils.withAlpha(color, 0.14) }]}>
        <FancyText size='extraSmall' type='bold' color={color}>
          {count}
        </FancyText>
      </View>
    </View>
  );
}

function PessoaBadge({ nome, fotoUrl, isCurrentUser, funcoes }: PessoaChamadaRow) {
  const { palette, isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;

  const initials = useMemo(() => {
    const parts = nome.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }, [nome]);

  const personColor = useMemo(() => getPersonColor(palette.team, nome), [palette.team, nome]);
  const ring = ringColor(palette, funcoes);

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
      <View style={[styles.ring, { borderColor: ring }]}>
        {fotoUrl ? (
          <Image
            source={{ uri: fotoUrl }}
            style={styles.avatarImage}
            cachePolicy='memory-disk'
            transition={120}
          />
        ) : (
          <View style={[styles.avatarLetter, { backgroundColor: personColor }]}>
            <FancyText type='bold' size='medium' color={palette.fonts.light}>
              {initials}
            </FancyText>
          </View>
        )}
      </View>

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
            <View
              key={f.key}
              style={[styles.funcaoPill, { backgroundColor: ColorUtils.withAlpha(color, 0.12) }]}
            >
              <View style={[styles.funcaoDot, { backgroundColor: color }]} />
              <FancyText type='semiBold' size='extraSmall' numberOfLines={1} color={color}>
                {f.nomeFuncao}
              </FancyText>
            </View>
          );
        })}
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
          borderColor: ColorUtils.withAlpha(palette.team[1], 0.4),
        },
        { ...palette.shadows[200] },
      ]}
    >
      <View style={[styles.ring, styles.ringDashed, { borderColor: palette.team[1] }]}>
        <View
          style={[
            styles.avatarLetter,
            { backgroundColor: ColorUtils.withAlpha(palette.team[1], 0.14) },
          ]}
        >
          <MaterialCommunityIcons name='plus' size={22} color={palette.team[1]} />
        </View>
      </View>

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
        color={ColorUtils.withAlpha(palette.team[1], 0.8)}
        style={styles.badgeFuncao}
      >
        {nomeFuncao}
      </FancyText>
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
  secaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 0,
  },
  secaoLabel: {
    flex: 1,
    letterSpacing: 0.6,
  },
  secaoCount: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
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
  badgeName: {
    textAlign: 'center',
  },
  badgeFuncao: {
    textAlign: 'center',
  },
  funcaoList: {
    alignItems: 'center',
    gap: 4,
  },
  funcaoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  funcaoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
