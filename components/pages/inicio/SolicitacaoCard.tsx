import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';
import { DashboardSolicitacaoDto } from '../../../domain/dtos/Dashboard/dashboard.response';
import { Image } from 'expo-image';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SolicitacaoCardProps = {
  solicitacao: DashboardSolicitacaoDto;
  onPress?: () => void;
};

export default function SolicitacaoCard({ solicitacao, onPress }: SolicitacaoCardProps) {
  const tempoDecorrido = formatDistanceToNow(parseISO(solicitacao.dataSolicitacao), {
    addSuffix: true,
    locale: ptBR,
  });

  const isEntrada = solicitacao.tipo === 'entrada';

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.avatarContainer}>
        {solicitacao.voluntarioFoto ? (
          <Image source={{ uri: solicitacao.voluntarioFoto }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <DefaultIcons.Custom library="MaterialCommunityIcons" name="account" size={20} color={Pallete.fonts.light} />
          </View>
        )}

        <View style={[styles.typeBadge, isEntrada ? styles.entradaBadge : styles.substituicaoBadge]}>
          <DefaultIcons.Custom
            library="MaterialCommunityIcons"
            name={isEntrada ? 'account-plus' : 'swap-horizontal'}
            size={10}
            color={Pallete.fonts.light}
          />
        </View>
      </View>

      <View style={styles.content}>
        <FancyText size="medium" type="bold" color={Pallete.fonts.dark} numberOfLines={1}>
          {solicitacao.voluntarioNome}
        </FancyText>

        {solicitacao.ministerioNome && (
          <View style={styles.infoRow}>
            <DefaultIcons.Custom library="MaterialCommunityIcons" name="account-group" size={12} color={Pallete.fonts.inactive} />
            <FancyText size="small" type="normal" color={Pallete.fonts.inactive} numberOfLines={1}>
              {solicitacao.ministerioNome}
            </FancyText>
          </View>
        )}

        <View style={styles.footer}>
          <FancyText
            size="extraSmall"
            type="bold"
            color={isEntrada ? Pallete.primary : Pallete.warning}
          >
            {isEntrada ? 'Solicitação de Entrada' : 'Substituição'}
          </FancyText>

          <FancyText size="extraSmall" type="normal" color={Pallete.fonts.inactive}>
            {tempoDecorrido}
          </FancyText>
        </View>
      </View>

      <View style={styles.actions}>
        <DefaultIcons.Custom library="Entypo" name="chevron-right" size={18} color={Pallete.fonts.inactive} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    ...Pallete.shadows[100],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: Pallete.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Pallete.backgroundColor2,
  },
  entradaBadge: {
    backgroundColor: Pallete.primary,
  },
  substituicaoBadge: {
    backgroundColor: Pallete.warning,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  actions: {
    justifyContent: 'center',
  },
});
