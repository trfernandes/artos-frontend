import { useFormContext } from 'react-hook-form';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { EscalaFormData } from '../../../../../domain/schemas/escalaSchema';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../../../FancyText';
import FancyImage from '../../../../images/FancyImage';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import { useMemo, useState } from 'react';
import { EscalaTemplateTipoEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { AppImages } from '../../../../../assets/app_images';
import { Pallete } from '../../../../../constants/colors';
import DefaultIcons from '../../../../FancyIcons';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancySeparator from '../../../../FancySeparator';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';
import { EscalaTemplateExperienciaLabel } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { getFirstAndLastName } from '../../../../../utils/text_utils';

// --- Componentes Auxiliares Locais ---

const InfoCard = ({
  children,
  title,
  icon,
  defaultExpanded = true,
}: {
  children: React.ReactNode;
  title: string;
  icon: string;
  defaultExpanded?: boolean;
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={0.85}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <View style={styles.iconContainer}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name={icon as any}
            size={16}
            color={Pallete.primary}
          />
        </View>
        <FancyText type='bold' size='small' color={Pallete.fonts.dark}>
          {title}
        </FancyText>
        <DefaultIcons.Custom
          library='Feather'
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Pallete.fonts.inactive}
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>
      {expanded && (
        <>
          <FancySeparator />
          <View style={styles.cardContent}>{children}</View>
        </>
      )}
    </View>
  );
};

const EventItem = ({
  evento,
  isLast,
  funcoesList,
  ministerioVoluntariosList,
}: {
  evento: any;
  isLast: boolean;
  funcoesList: any[];
  ministerioVoluntariosList: any[];
}) => {
  const [expanded, setExpanded] = useState(false);

  const tipoTemplate = useMemo(() => {
    return evento.template.tipo === EscalaTemplateTipoEnum.Fixo
      ? `Modelo Fixo • ${evento.template.fixos?.length || 0} voluntários`
      : evento.template.tipo === EscalaTemplateTipoEnum.Funcoes
        ? `Por Funções • ${evento.template.funcoes?.length || 0} funções`
        : 'Modelo Manual';
  }, [evento]);

  return (
    <View>
      <TouchableOpacity
        style={styles.listItem}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={[styles.eventDot, { backgroundColor: evento.cor || Pallete.primary }]} />
        <View style={{ flex: 1 }}>
          <FancyText size='small' type='semiBold' color={Pallete.fonts.dark}>
            {evento.nome}
          </FancyText>
          <FancyText
            size='extraSmall'
            type='medium'
            color={Pallete.fonts.inactive}
            style={{ marginTop: 4 }}
          >
            {format(evento.dataOcorrencia, 'dd/MM • HH:mm')} • {tipoTemplate}
          </FancyText>
        </View>
        <DefaultIcons.Custom
          library='Feather'
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Pallete.fonts.inactive}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {/* Template Info */}
          {evento.template.templateBase?.nome && (
            <View style={styles.detailRow}>
              <FancyText size='extraSmall' type='bold' color={Pallete.fonts.inactive}>
                TEMPLATE:
              </FancyText>
              <FancyText size='extraSmall' color={Pallete.fonts.dark}>
                {evento.template.templateBase.nome}
              </FancyText>
            </View>
          )}

          {/* Lista de Funções (Se for por Funções) */}
          {evento.template.tipo === EscalaTemplateTipoEnum.Funcoes &&
            evento.template.funcoes?.length > 0 && (
              <View style={styles.detailsList}>
                <FancyText
                  size='extraSmall'
                  type='bold'
                  color={Pallete.fonts.inactive}
                  style={{ marginBottom: 4 }}
                >
                  FUNÇÕES REQUERIDAS:
                </FancyText>
                {evento.template.funcoes.map((f: any, idx: number) => {
                  const funcaoNome =
                    funcoesList.find((fl) => String(fl.id) === String(f.funcaoId))?.nome ||
                    'Função desconhecida';
                  const expLabel =
                    EscalaTemplateExperienciaLabel[
                      f.experiencia as keyof typeof EscalaTemplateExperienciaLabel
                    ];
                  return (
                    <View key={idx} style={styles.detailItem}>
                      <View style={styles.bullet} />
                      <FancyText size='extraSmall' color={Pallete.fonts.dark}>
                        {funcaoNome}{' '}
                        <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                          ({f.quantidade}x {expLabel})
                        </FancyText>
                      </FancyText>
                    </View>
                  );
                })}
              </View>
            )}

          {/* Lista de Fixos (Se for Fixo) */}
          {evento.template.tipo === EscalaTemplateTipoEnum.Fixo &&
            evento.template.fixos?.length > 0 && (
              <View style={styles.detailsList}>
                <FancyText
                  size='extraSmall'
                  type='bold'
                  color={Pallete.fonts.inactive}
                  style={{ marginBottom: 4 }}
                >
                  VOLUNTÁRIOS FIXOS:
                </FancyText>
                {evento.template.fixos.map((f: any, idx: number) => {
                  const vol = ministerioVoluntariosList.find(
                    (v) => String(v.id) === String(f.minVolId),
                  );
                  const volNome = vol?.voluntario?.nome || 'Voluntário desconhecido';
                  const funcaoNome =
                    funcoesList.find((fl) => String(fl.id) === String(f.funcaoId))?.nome ||
                    'Sem função';

                  return (
                    <View key={idx} style={styles.detailItem}>
                      <FancyImage
                        source={
                          vol?.voluntario?.fotoThumbUrl
                            ? { uri: vol.voluntario.fotoThumbUrl }
                            : AppImages.emptyProfile
                        }
                        size={20}
                        style={{ borderRadius: 10, marginRight: 6 }}
                      />
                      <FancyText size='extraSmall' color={Pallete.fonts.dark}>
                        {volNome}{' '}
                        <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                          • {funcaoNome}
                        </FancyText>
                      </FancyText>
                    </View>
                  );
                })}
              </View>
            )}
        </View>
      )}

      {!isLast && <FancySeparator style={{ marginTop: 8, marginBottom: 10 }} />}
    </View>
  );
};

export default function AssistenteRevisaoStep() {
  const { ministerioId } = useAssistenteEscala();
  const form = useFormContext<EscalaFormData>();

  const { funcoesList } = useFuncoesDoMinisterio(ministerioId);
  // Carrega dados para resolver IDs (nomes, fotos, funções)
  const { ministerioVoluntariosList } = useVoluntariosDoMinisterioCrud(ministerioId);

  // --- Dados Processados ---

  const eventosSelecionados = useMemo(() => {
    return (form.watch('eventos') || []).filter((e) => e.selected);
  }, [form.watch('eventos')]);

  const participantesSelecionados = useMemo(() => {
    const parts = form.watch('participantes') || [];
    return parts
      .filter((p) => p.selected)
      .map((p) => {
        const minVol = ministerioVoluntariosList.find((v) => v.id === p.minVolId);
        return {
          id: p.minVolId,
          nome: minVol?.voluntario?.nome || 'Desconhecido',
          fotoUrl: minVol?.voluntario?.fotoThumbUrl || minVol?.voluntario?.fotoUrl,
          // Pega as funções cadastradas do voluntário no ministério para exibir como badge
          funcoes:
            minVol?.funcoes
              ?.map((f) => {
                // Tenta pegar o nome direto se populado
                if (f.funcao?.nome) return f.funcao.nome;
                // Se não, tenta resolver pelo ID usando a lista de funções do ministério
                const fId = (f as any).funcaoId || (f.funcao as any)?.id || (f as any).id;
                return funcoesList.find((fl) => String(fl.id) === String(fId))?.nome;
              })
              .filter((n): n is string => !!n) || [],
        };
      });
  }, [form.watch('participantes'), ministerioVoluntariosList, funcoesList]);

  // Agrupamento para resumo (ex: quantos de cada função)
  const resumoFuncoes = useMemo(() => {
    const counts: Record<string, number> = {};
    participantesSelecionados.forEach((p) => {
      if (p.funcoes.length === 0) {
        counts['Sem função'] = (counts['Sem função'] || 0) + 1;
      } else {
        p.funcoes.forEach((f) => {
          counts[f] = (counts[f] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [participantesSelecionados]);

  const dataInicio = form.watch('dataInicio');
  const dataTermino = form.watch('dataTermino');
  const nomeEscala = form.watch('nome');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* --- 1. CONFIGURAÇÕES --- */}
      <InfoCard title='Configurações' icon='cog-outline'>
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <FancyText
              size='small'
              type='semiBold'
              color={Pallete.fonts.inactive}
              style={styles.label}
            >
              NOME DA ESCALA
            </FancyText>
            <FancyText size='small' type='bold' color={Pallete.fonts.dark} style={{ opacity: 0.8 }}>
              {nomeEscala || 'Sem nome'}
            </FancyText>
          </View>
        </View>
        <FancySeparator style={{ marginVertical: 12 }} />
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <FancyText
              size='small'
              type='semiBold'
              color={Pallete.fonts.inactive}
              style={styles.label}
            >
              PERÍODO
            </FancyText>
            <FancyText size='small' type='bold' color={Pallete.fonts.dark} style={{ opacity: 0.8 }}>
              {dataInicio ? format(dataInicio, 'dd/MM', { locale: ptBR }) : '--'} a{' '}
              {dataTermino ? format(dataTermino, 'dd/MM/yyyy', { locale: ptBR }) : '--'}
            </FancyText>
          </View>
        </View>
      </InfoCard>

      {/* --- 2. EVENTOS --- */}
      <InfoCard title={`Eventos (${eventosSelecionados.length})`} icon='calendar-month-outline'>
        {eventosSelecionados.length === 0 ? (
          <FancyText
            size='small'
            color={Pallete.fonts.inactive}
            style={{ textAlign: 'center', padding: 10 }}
          >
            Nenhum evento selecionado.
          </FancyText>
        ) : (
          <View style={styles.eventListContainer}>
            {eventosSelecionados.map((evento, index) => (
              <EventItem
                key={evento.eventoId + index}
                evento={evento}
                isLast={index === eventosSelecionados.length - 1}
                funcoesList={funcoesList}
                ministerioVoluntariosList={ministerioVoluntariosList}
              />
            ))}
          </View>
        )}
      </InfoCard>

      {/* --- 3. PARTICIPANTES --- */}
      <InfoCard title={`Equipe (${participantesSelecionados.length})`} icon='account-group-outline'>
        {/* Resumo de Funções (Chips) */}
        {resumoFuncoes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {resumoFuncoes.map(([funcao, count]) => (
              <View key={funcao} style={styles.summaryChip}>
                <FancyText size='extraSmall' type='bold' style={{ color: '#065F46' }}>
                  {count}
                </FancyText>
                <FancyText size='extraSmall' style={{ color: '#065F46', marginLeft: 4 }}>
                  {funcao}
                </FancyText>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Grid de Participantes */}
        <View style={styles.participantGrid}>
          {participantesSelecionados.map((participante) => (
            <View key={participante.id} style={styles.participantGridItem}>
              <FancyImage
                source={
                  participante.fotoUrl ? { uri: participante.fotoUrl } : AppImages.emptyProfile
                }
                size={36}
                style={styles.gridAvatar}
              />
              <FancyText
                size='extraSmall'
                type='semiBold'
                color={Pallete.fonts.dark}
                numberOfLines={2}
                style={[styles.gridName, { opacity: 0.8 }]}
              >
                {getFirstAndLastName(participante.nome)}
              </FancyText>
              {participante.funcoes.length > 0 ? (
                <View style={styles.gridFuncaoRow}>
                  <DefaultIcons.Custom
                    library='MaterialCommunityIcons'
                    name='briefcase-outline'
                    size={11}
                    color={Pallete.primary}
                  />
                  <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive} numberOfLines={1} style={{ flexShrink: 1 }}>
                    {participante.funcoes[0]}
                    {participante.funcoes.length > 1 ? ` +${participante.funcoes.length - 1}` : ''}
                  </FancyText>
                </View>
              ) : (
                <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ opacity: 0.6 }}>
                  Sem função
                </FancyText>
              )}
            </View>
          ))}

          {participantesSelecionados.length === 0 && (
            <View style={styles.emptyState}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='account-off-outline'
                size={30}
                color={Pallete.fonts.inactive}
              />
              <FancyText size='small' color={Pallete.fonts.inactive} style={{ marginTop: 8 }}>
                Nenhum participante selecionado.
              </FancyText>
            </View>
          )}
        </View>
      </InfoCard>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Pallete.backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Pallete.borderCard,
    ...Pallete.shadows[100],
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.96),
    gap: 10,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  listContainer: {
    gap: 12,
  },
  participantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantGridItem: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 3,
  },
  gridAvatar: {
    borderRadius: 18,
  },
  gridName: {
    textAlign: 'center',
    marginTop: 2,
  },
  gridFuncaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    maxWidth: '100%',
  },
  eventListContainer: {
    gap: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  expandedContent: {
    paddingTop: 8,
    paddingBottom: 4,
    paddingLeft: 20, // Indentação para hierarquia
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  detailsList: {
    gap: 4,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Pallete.fonts.inactive,
    marginHorizontal: 4,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipsScroll: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  summaryChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Pallete.borderCard,
    borderRadius: 8,
  },
});
