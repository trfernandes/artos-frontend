import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import { Pallete } from '../../../../../constants/colors';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';

export type EscalaStatusBadgeStatus =
  | EscalaStatusEnum
  | 'GERADA'
  | 'PUBLICADA'
  | 'RASCUNHO'
  | 'CANCELADA'
  | 'FECHADA'
  | 'EM_EDICAO';

type EscalaStatusBadgeProps = {
  status: EscalaStatusBadgeStatus;
  size?: 'sm' | 'md';
};

type StatusVisualToken = {
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
};

const STATUS_VISUALS: Record<
  'GERADA' | 'PUBLICADA' | 'RASCUNHO' | 'CANCELADA' | 'FECHADA' | 'EM_EDICAO',
  StatusVisualToken
> = {
  GERADA: {
    label: 'Gerada',
    color: '#2F6FD1',
    backgroundColor: 'rgba(47, 111, 209, 0.10)',
    borderColor: 'rgba(47, 111, 209, 0.18)',
  },
  PUBLICADA: {
    label: 'Publicada',
    color: '#9A7600',
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderColor: 'rgba(245, 166, 35, 0.22)',
  },
  RASCUNHO: {
    label: 'Rascunho',
    color: '#496186',
    backgroundColor: 'rgba(73, 97, 134, 0.10)',
    borderColor: 'rgba(73, 97, 134, 0.18)',
  },
  CANCELADA: {
    label: 'Cancelada',
    color: '#B14236',
    backgroundColor: 'rgba(231, 76, 60, 0.10)',
    borderColor: 'rgba(231, 76, 60, 0.18)',
  },
  FECHADA: {
    label: 'Fechada',
    color: '#4C3C7D',
    backgroundColor: 'rgba(142, 99, 232, 0.10)',
    borderColor: 'rgba(142, 99, 232, 0.18)',
  },
  EM_EDICAO: {
    label: 'Em edição',
    color: '#496186',
    backgroundColor: 'rgba(73, 97, 134, 0.10)',
    borderColor: 'rgba(73, 97, 134, 0.18)',
  },
};

function normalizeStatus(status: EscalaStatusBadgeStatus) {
  if (status === EscalaStatusEnum.Gerada) return 'GERADA';
  if (status === EscalaStatusEnum.Publicada) return 'PUBLICADA';
  return status;
}

export default function EscalaStatusBadge({ status, size = 'sm' }: EscalaStatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const visual = STATUS_VISUALS[normalized] ?? STATUS_VISUALS.GERADA;

  return (
    <View
      style={[
        styles.container,
        size === 'md' ? styles.containerMd : styles.containerSm,
        {
          backgroundColor: visual.backgroundColor,
          borderColor: visual.borderColor,
        },
      ]}
    >
      <FancyText
        type='semiBold'
        size='extraSmall'
        color={visual.color}
        numberOfLines={1}
        style={styles.label}
      >
        {visual.label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSm: {
    height: 26,
    paddingHorizontal: 10,
  },
  containerMd: {
    height: 28,
    paddingHorizontal: 12,
  },
  label: {
    opacity: 0.95,
  },
});
