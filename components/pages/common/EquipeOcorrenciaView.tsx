import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import FancyButton from '../../buttons/FancyButton';
import FancyChips from '../../FancyChips';
import DefaultIcons from '../../FancyIcons';
import FancyImage from '../../images/FancyImage';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import FancyScrollView from '../../FancyScrollView';
import FancyText from '../../FancyText';
import FancyTextInput from '../../fields/FancyTextInput';
import { AppImages } from '../../../assets/app_images';
import { getApiErrorMessage } from '../../../domain/api/api-error';
import { EscalaItemStatusEnum, EscalaItemStatusEnumLabel } from '../../../domain/enums/Escala/escala-item-status.enum';
import { MinisterioVoluntarioStatusEnum } from '../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { useAuth } from '../../../contexts/AuthContext';
import { usePallete } from '../../../hooks/usePallete';
import { useEscalaItensCrud } from '../../../hooks/useEscalaItensCrud';
import { useEventoEquipe } from '../../../hooks/useEventoEquipe';
import { useEventoSetlistResponsavel } from '../../../hooks/useEventoSetlistResponsavel';
import { useVoluntariosDoMinisterioCrud } from '../../../hooks/useVoluntariosDoMinisterioCrud';
import { ColorUtils } from '../../../utils/color_utils';

type Props = {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  modo: 'lider' | 'voluntario';
};

const STATUS_VISUALS: Record<
  EscalaItemStatusEnum,
  {
    color: string;
    background: string;
    label: string;
  }
> = {
  [EscalaItemStatusEnum.Pendente]: {
    color: '#A16207',
    background: '#FEF3C7',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Pendente],
  },
  [EscalaItemStatusEnum.Confirmado]: {
    color: '#166534',
    background: '#DCFCE7',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Confirmado],
  },
  [EscalaItemStatusEnum.Ausente]: {
    color: '#B91C1C',
    background: '#FEE2E2',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Ausente],
  },
  [EscalaItemStatusEnum.Substituido]: {
    color: '#7C2D12',
    background: '#FFEDD5',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Substituido],
  },
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
    color: '#6D28D9',
    background: '#EDE9FE',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.SubstituicaoSolicitada],
  },
};

export default function EquipeOcorrenciaView({ eventoId, dataOcorrencia, ministerioId, modo }: Props) {
  const palette = usePallete();
  const queryClient = useQueryClient();
  const { user, igrejaAtiva } = useAuth();
  const isLeaderMode = modo === 'lider';
  const dataOcorrenciaIso = dataOcorrencia.toISOString();

  const { data, isLoading, refetch } = useEventoEquipe(eventoId, dataOcorrenciaIso, ministerioId);
  const { voluntariosList, ministerioVoluntariosList, isLoadingMinisterioVoluntarios } = useVoluntariosDoMinisterioCrud(
    ministerioId,
    MinisterioVoluntarioStatusEnum.Ativo,
  );
  const { update } = useEscalaItensCrud();
  const { salvarResponsavelSetlist, isSavingResponsavelSetlist } = useEventoSetlistResponsavel();

  const [responsavelVisible, setResponsavelVisible] = useState(false);
  const [responsavelSelecionadoId, setResponsavelSelecionadoId] = useState('');
  const [substituicaoVisible, setSubstituicaoVisible] = useState(false);
  const [escalaItemSelecionadoId, setEscalaItemSelecionadoId] = useState<string | null>(null);
  const [novoVoluntarioId, setNovoVoluntarioId] = useState('');
  const [motivoSubstituicao, setMotivoSubstituicao] = useState('');
  const [isSalvandoSubstituicao, setIsSalvandoSubstituicao] = useState(false);

  const integrantesEscaladosIds = useMemo(
    () =>
      new Set(
        data?.grupos.flatMap((grupo) => grupo.integrantes.map((integrante) => integrante.voluntarioId).filter(Boolean)) ?? [],
      ),
    [data?.grupos],
  );

  const responsavelOptions = useMemo(
    () =>
      voluntariosList.map((voluntario) => ({
        title: voluntario.nome,
        value: voluntario.id,
        left: {
          type: 'image' as const,
          source:
            voluntario.fotoThumbUrl || voluntario.fotoUrl
              ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' }
              : AppImages.emptyProfile,
        },
      })),
    [voluntariosList],
  );

  const substituicaoOptions = useMemo(() => {
    const integranteAtual = data?.grupos
      .flatMap((grupo) => grupo.integrantes)
      .find((integrante) => integrante.escalaItemId === escalaItemSelecionadoId);

    const funcaoAtualId = integranteAtual?.funcaoId ?? null;

    return ministerioVoluntariosList
      .filter((ministerioVoluntario) => {
        const voluntarioId = ministerioVoluntario.voluntarioId;
        if (!voluntarioId || voluntarioId === integranteAtual?.voluntarioId) return false;
        if (integrantesEscaladosIds.has(voluntarioId)) return false;
        if (!funcaoAtualId) return true;
        const funcoes = ministerioVoluntario.funcoes ?? [];
        return funcoes.length === 0 || funcoes.some((funcao) => funcao.funcaoId === funcaoAtualId);
      })
      .map((ministerioVoluntario) => ({
        title: ministerioVoluntario.voluntario?.nome || 'Voluntário',
        value: ministerioVoluntario.voluntarioId,
        left: {
          type: 'image' as const,
          source:
            ministerioVoluntario.voluntario?.fotoThumbUrl || ministerioVoluntario.voluntario?.fotoUrl
              ? {
                  uri:
                    ministerioVoluntario.voluntario?.fotoThumbUrl ||
                    ministerioVoluntario.voluntario?.fotoUrl ||
                    '',
                }
              : AppImages.emptyProfile,
        },
      }));
  }, [data?.grupos, escalaItemSelecionadoId, integrantesEscaladosIds, ministerioVoluntariosList]);

  const openResponsavelSheet = () => {
    setResponsavelSelecionadoId(data?.responsavelSetlistVoluntarioId || '');
    setResponsavelVisible(true);
  };

  const openSubstituicaoSheet = (escalaItemId: string) => {
    setEscalaItemSelecionadoId(escalaItemId);
    setNovoVoluntarioId('');
    setMotivoSubstituicao('');
    setSubstituicaoVisible(true);
  };

  const invalidateEquipe = async () => {
    if (!igrejaAtiva?.id) return;
    await queryClient.invalidateQueries({
      queryKey: ['evento-equipe', igrejaAtiva.id, eventoId, ministerioId, dataOcorrenciaIso],
    });
    await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    await queryClient.invalidateQueries({
      queryKey: ['evento-setlist', igrejaAtiva.id, ministerioId, eventoId, dataOcorrenciaIso],
    });
    await refetch();
  };

  const handleSalvarResponsavel = async () => {
    if (!ministerioId || !responsavelSelecionadoId) return;

    try {
      await salvarResponsavelSetlist({
        eventoId,
        data: {
          ministerioId,
          dataOcorrencia: dataOcorrenciaIso,
          responsavelVoluntarioId: responsavelSelecionadoId,
          escopo: 'OCORRENCIA' as any,
        },
      });
      await invalidateEquipe();
      setResponsavelVisible(false);
      Toast.show({ type: 'success', text1: 'Responsável do setlist atualizado' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar responsável',
        text2: getApiErrorMessage(error, 'Não foi possível salvar o responsável do setlist.'),
      });
    }
  };

  const handleSubstituir = async () => {
    if (!escalaItemSelecionadoId || !novoVoluntarioId) return;

    try {
      setIsSalvandoSubstituicao(true);
      await update?.({
        id: escalaItemSelecionadoId,
        data: {
          voluntarioId: novoVoluntarioId,
        },
      });
      await invalidateEquipe();
      setSubstituicaoVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Voluntário substituído',
        text2: motivoSubstituicao ? `Motivo registrado: ${motivoSubstituicao}` : undefined,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao substituir voluntário',
        text2: getApiErrorMessage(error, 'Não foi possível atualizar a escala desta ocorrência.'),
      });
    } finally {
      setIsSalvandoSubstituicao(false);
    }
  };

  if (isLoading || (isLeaderMode && isLoadingMinisterioVoluntarios)) {
    return <FancyLoading />;
  }

  if (!data || data.grupos.length === 0) {
    return (
      <FancyListEmpty
        label='Nenhuma equipe escalada para esta ocorrência.'
        icon={{ library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 56 }}
      />
    );
  }

  return (
    <>
      <FancyScrollView contentContainerStyle={styles.contentContainer}>
        <View
          style={[
            styles.responsavelCard,
            {
              backgroundColor: palette.backgroundColor4,
              borderColor: ColorUtils.withAlpha(palette.primary, 0.16),
              ...palette.shadows[100],
            },
          ]}
        >
          <FancyImage
            size={42}
            source={
              data.responsavelSetlistVoluntario?.fotoThumbUrl || data.responsavelSetlistVoluntario?.fotoUrl
                ? {
                    uri:
                      data.responsavelSetlistVoluntario?.fotoThumbUrl ||
                      data.responsavelSetlistVoluntario?.fotoUrl ||
                      '',
                  }
                : AppImages.emptyProfile
            }
          />

          <View style={styles.responsavelInfo}>
            <FancyText type='semiBold' size='small'>
              {data.responsavelSetlistVoluntario?.nome || 'Responsável não definido'}
            </FancyText>
            <FancyChips
              label='Responsável do setlist'
              size='small'
              color={palette.secondary}
              backgroundColor={ColorUtils.withAlpha(palette.secondary, 0.1)}
              icon={{ library: 'MaterialCommunityIcons', name: 'music-note-outline', size: 12 }}
            />
          </View>

          {isLeaderMode ? (
            <FancyButton
              type='light'
              mode='icon'
              icon={{ library: 'Feather', name: 'edit-2', size: 16, color: palette.primary }}
              containerStyle={styles.inlineIconButton}
              onPress={openResponsavelSheet}
            />
          ) : null}
        </View>

        {data.grupos.map((grupo) => (
          <View key={`${grupo.funcaoId || grupo.nomeFuncao}`} style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <FancyText type='bold' size='small'>
                {grupo.nomeFuncao}
              </FancyText>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                {grupo.integrantes.length} {grupo.integrantes.length === 1 ? 'pessoa' : 'pessoas'}
              </FancyText>
            </View>

            <View style={styles.groupList}>
              {grupo.integrantes.map((integrante) => {
                const voluntario = integrante.voluntario;
                const isCurrentUser = voluntario?.id === user?.user?.id;
                const statusVisual = STATUS_VISUALS[integrante.status as EscalaItemStatusEnum] ?? {
                  color: palette.fonts.inactive,
                  background: ColorUtils.withAlpha(palette.fonts.inactive, 0.14),
                  label: integrante.status,
                };

                return (
                  <View
                    key={integrante.escalaItemId}
                    style={[
                      styles.memberRow,
                      {
                        backgroundColor: palette.backgroundColor2,
                        borderColor: isCurrentUser
                          ? ColorUtils.withAlpha(palette.primary, 0.22)
                          : ColorUtils.withAlpha(palette.borderCard, 0.65),
                      },
                    ]}
                  >
                    <FancyImage
                      size={40}
                      source={
                        voluntario?.fotoThumbUrl || voluntario?.fotoUrl
                          ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' }
                          : AppImages.emptyProfile
                      }
                    />

                    <View style={styles.memberInfo}>
                      <View style={styles.memberTitleRow}>
                        <FancyText type='semiBold' size='small' numberOfLines={1} style={styles.memberName}>
                          {voluntario?.nome || 'Vaga aberta'}
                        </FancyText>
                        {isCurrentUser ? (
                          <FancyChips
                            label='Você'
                            size='small'
                            color={palette.primary}
                            backgroundColor={ColorUtils.withAlpha(palette.primary, 0.12)}
                          />
                        ) : null}
                      </View>

                      <View style={styles.memberMetaRow}>
                        <FancyChips
                          label={statusVisual.label}
                          size='small'
                          color={statusVisual.color}
                          backgroundColor={statusVisual.background}
                        />
                      </View>
                    </View>

                    {isLeaderMode ? (
                      <FancyButton
                        type='text'
                        mode='icon'
                        icon={{ library: 'MaterialCommunityIcons', name: 'swap-horizontal', size: 18, color: palette.primary }}
                        containerStyle={styles.inlineIconButton}
                        onPress={() => openSubstituicaoSheet(integrante.escalaItemId)}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </FancyScrollView>

      <FancyBottomSheetModal
        visible={responsavelVisible}
        onClose={() => setResponsavelVisible(false)}
        title='Responsável do setlist'
        footer={
          <FancyButton
            label='Salvar responsável'
            isLoading={isSavingResponsavelSetlist}
            disabled={!responsavelSelecionadoId}
            onPress={() => void handleSalvarResponsavel()}
          />
        }
      >
        <View style={styles.sheetForm}>
          <FancyText size='small' type='medium' color={palette.fonts.inactive}>
            Escolha quem ficará responsável por conduzir o setlist desta ocorrência.
          </FancyText>
          <FancyBottomSheetSelect
            label='Voluntário'
            title='Selecionar responsável'
            value={responsavelSelecionadoId}
            onChange={(value) => setResponsavelSelecionadoId(String(value || ''))}
            listItems={responsavelOptions}
          />
        </View>
      </FancyBottomSheetModal>

      <FancyBottomSheetModal
        visible={substituicaoVisible}
        onClose={() => setSubstituicaoVisible(false)}
        title='Substituir voluntário'
        footer={
          <FancyButton
            label='Confirmar substituição'
            isLoading={isSalvandoSubstituicao}
            disabled={!novoVoluntarioId}
            onPress={() => void handleSubstituir()}
          />
        }
      >
        <View style={styles.sheetForm}>
          <FancyBottomSheetSelect
            label='Novo voluntário'
            title='Selecionar substituto'
            value={novoVoluntarioId}
            onChange={(value) => setNovoVoluntarioId(String(value || ''))}
            listItems={substituicaoOptions}
          />
          <FancyTextInput
            label='Motivo'
            value={motivoSubstituicao}
            inputProps={{ onChangeText: setMotivoSubstituicao, multiline: true, style: { minHeight: 90, textAlignVertical: 'top' } }}
          />
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
  },
  responsavelCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  responsavelInfo: {
    flex: 1,
    gap: 6,
  },
  inlineIconButton: {
    minWidth: 34,
    width: 34,
    height: 34,
  },
  groupSection: {
    gap: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  groupList: {
    gap: 10,
  },
  memberRow: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberInfo: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  memberTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    flex: 1,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetForm: {
    gap: 14,
  },
});
