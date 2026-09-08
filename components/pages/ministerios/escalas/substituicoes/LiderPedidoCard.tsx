import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../../../FancyText';
import DefaultIcons from '../../../../FancyIcons';
import FancyButton from '../../../../buttons/FancyButton';
import FancyChips from '../../../../FancyChips';
import FancySeparator from '../../../../FancySeparator';
import { usePallete } from '../../../../../hooks/usePallete';
import { ThemePalette } from '../../../../../constants/colors';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { PedidoComPendencia } from '../../../../../domain/dtos/SubstituicaoPedido/substituicao-pedido.response';
import {
  SubstituicaoPedidoStatusEnum,
  SubstituicaoPedidoStatusEnumLabel,
} from '../../../../../domain/enums/SubstituicaoPedido/substituicao-pedido-status.enum';
import { TentativaStatusEnum } from '../../../../../domain/enums/SubstituicaoPedido/tentativa-status.enum';
import TentativaTimeline from '../../../common/TentativaTimeline';
import { useFilaDoPedido } from '../../../../../hooks/useSubstituicaoPedidosCrud';

function getStatusVisual(status: SubstituicaoPedidoStatusEnum, palette: ThemePalette) {
  switch (status) {
    case SubstituicaoPedidoStatusEnum.Aberto:
      return { color: palette.warning, icon: 'schedule' };
    case SubstituicaoPedidoStatusEnum.Resolvido:
      return { color: palette.confirm, icon: 'check-circle' };
    case SubstituicaoPedidoStatusEnum.Cancelado:
      return { color: palette.fonts.inactive, icon: 'cancel' };
    case SubstituicaoPedidoStatusEnum.SemCandidato:
      return { color: palette.error, icon: 'person-off' };
  }
}

function firstAndLast(full?: string) {
  if (!full?.trim()) return '—';
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

type Props = {
  item: PedidoComPendencia;
  isAguardandoGate: boolean;
  isActing: boolean;
  onAprovar: () => void;
  onVetar: () => void;
  onIndicarVoluntario: () => void;
  onBuscarNovamente: () => void;
  onRemoverFuncao: () => void;
};

export default function LiderPedidoCard({
  item,
  isAguardandoGate,
  isActing,
  onAprovar,
  onVetar,
  onIndicarVoluntario,
  onBuscarNovamente,
  onRemoverFuncao,
}: Props) {
  const palette = usePallete();
  const [expanded, setExpanded] = useState(false);
  const [filaOpen, setFilaOpen] = useState(false);
  const { pedido } = item;
  const { data: fila } = useFilaDoPedido(filaOpen ? pedido.id : null);

  const visual = getStatusVisual(pedido.status, palette);
  const statusLabel = SubstituicaoPedidoStatusEnumLabel[pedido.status];

  const dataOcorrencia = pedido.escalaItem?.dataOcorrencia
    ? DateUtilsApi.dateOnlyFromApi(pedido.escalaItem.dataOcorrencia as string)
    : null;
  const dataFormatada = dataOcorrencia
    ? format(dataOcorrencia, "EEE, dd 'de' MMM", { locale: ptBR })
    : '—';
  const horaCurta = dataOcorrencia ? format(dataOcorrencia, "HH'h'mm", { locale: ptBR }) : '';

  const eventoNome = pedido.escalaItem?.evento?.nome ?? '—';
  const eventoCor = pedido.escalaItem?.evento?.cor ?? palette.fonts.inactive;
  const funcaoNome = pedido.escalaItem?.funcao?.nome;
  const solicitanteNome = firstAndLast(pedido.solicitante?.voluntario?.nome);

  const tentativaEmGate = useMemo(
    () =>
      pedido.tentativas?.find((t) => t.tentativaStatus === TentativaStatusEnum.AguardandoGateLider),
    [pedido.tentativas],
  );

  const prazoLabel = tentativaEmGate?.prazoExpiracao
    ? formatDistanceToNow(new Date(tentativaEmGate.prazoExpiracao), {
        locale: ptBR,
        addSuffix: true,
      })
    : null;

  const semCandidato = pedido.status === SubstituicaoPedidoStatusEnum.SemCandidato;

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: isAguardandoGate ? palette.warning : palette.borderCard,
            borderWidth: isAguardandoGate ? 1.5 : 1,
            ...palette.shadows[100],
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <FancyChips
              label={statusLabel}
              color={visual.color}
              size='small'
              outlined
              icon={{ library: 'MaterialIcons', name: visual.icon, size: 12 }}
            />
            {funcaoNome ? (
              <FancyChips
                label={funcaoNome}
                color={palette.secondary}
                size='small'
                outlined
                icon={{ library: 'MaterialIcons', name: 'work-outline', size: 12 }}
              />
            ) : null}
          </View>

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
            </View>
            <FancyText size='small' type='medium' color={palette.fonts.inactive}>
              Solicitante: {solicitanteNome}
            </FancyText>
          </View>

          {isAguardandoGate ? (
            <>
              <FancySeparator />
              <FancyText size='small' type='semiBold' color={palette.fonts.dark}>
                {firstAndLast(tentativaEmGate?.substituto?.voluntario?.nome)} quer aceitar esta
                substituição
              </FancyText>
              {prazoLabel ? (
                <View style={styles.prazoRow}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='timer'
                    size={13}
                    color={palette.warning}
                  />
                  <FancyText size='extraSmall' type='medium' color={palette.warning}>
                    Expira {prazoLabel}
                  </FancyText>
                </View>
              ) : null}
              <View style={styles.actionsRow}>
                <FancyButton
                  type='outlined'
                  label='Vetar'
                  onPress={onVetar}
                  isLoading={isActing}
                  disabled={isActing}
                  containerStyle={styles.actionBtn}
                />
                <FancyButton
                  type='contained'
                  label='Aprovar'
                  onPress={onAprovar}
                  isLoading={isActing}
                  disabled={isActing}
                  containerStyle={styles.actionBtn}
                />
              </View>
            </>
          ) : null}

          {semCandidato ? (
            <>
              <FancySeparator />
              <FancyText size='small' type='medium' color={palette.fonts.inactive}>
                Ninguém aceitou ainda. O que fazer?
              </FancyText>
              <View style={styles.exitsCol}>
                <FancyButton
                  type='outlined'
                  label='Indicar voluntário'
                  onPress={onIndicarVoluntario}
                  disabled={isActing}
                />
                <FancyButton
                  type='outlined'
                  label='Buscar novamente'
                  onPress={onBuscarNovamente}
                  isLoading={isActing}
                  disabled={isActing}
                />
                <FancyButton
                  type='text'
                  label='Remover função da escala'
                  onPress={onRemoverFuncao}
                  isLoading={isActing}
                  disabled={isActing}
                />
              </View>
            </>
          ) : null}

          <Pressable
            onPress={() => setFilaOpen((v) => !v)}
            style={styles.expandRow}
            accessibilityRole='button'
          >
            <FancyText size='small' type='semiBold' color={palette.secondary}>
              {filaOpen ? 'Ocultar fila de candidatos' : 'Ver fila de candidatos'}
            </FancyText>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name={filaOpen ? 'expand-less' : 'expand-more'}
              size={16}
              color={palette.secondary}
            />
          </Pressable>

          {filaOpen ? (
            <View style={styles.filaList}>
              {fila && fila.length > 0 ? (
                fila.map((candidato, index) => (
                  <View key={candidato.ministerioVoluntarioId} style={styles.filaRow}>
                    <FancyText size='small' type='medium' color={palette.fonts.dark}>
                      {index + 1}. {candidato.nome}
                    </FancyText>
                    {candidato.scoreSolicitude != null ? (
                      <FancyText size='extraSmall' type='normal' color={palette.fonts.inactive}>
                        {Math.round(candidato.scoreSolicitude * 100)}% aceite
                      </FancyText>
                    ) : null}
                  </View>
                ))
              ) : (
                <FancyText size='small' color={palette.fonts.inactive}>
                  Fila vazia.
                </FancyText>
              )}
            </View>
          ) : null}

          <Pressable
            onPress={() => setExpanded((v) => !v)}
            style={styles.expandRow}
            accessibilityRole='button'
          >
            <FancyText size='small' type='semiBold' color={palette.primary}>
              {expanded ? 'Ocultar histórico' : 'Ver histórico'}
            </FancyText>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name={expanded ? 'expand-less' : 'expand-more'}
              size={16}
              color={palette.primary}
            />
          </Pressable>

          {expanded ? (
            <>
              <FancySeparator />
              <TentativaTimeline pedidoId={pedido.id} />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: { marginBottom: 12 },
  card: { borderRadius: 14, overflow: 'hidden' },
  content: { flex: 1, padding: 12, gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  blockEvento: { gap: 4 },
  eventoTituloRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventoColorDot: { width: 10, height: 10, borderRadius: 5 },
  eventoTitulo: { flex: 1, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  prazoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
  exitsCol: { gap: 8 },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  filaList: { gap: 6, paddingVertical: 4 },
  filaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
