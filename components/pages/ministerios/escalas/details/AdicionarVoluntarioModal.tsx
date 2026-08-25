import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancyCheckbox from '../../../../FancyCheckbox';
import FancyTextInput from '../../../../fields/FancyTextInput';
import { format } from 'date-fns';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useEffect, useState, useMemo } from 'react';
import { IndisponibilidadesVoluntariosApi } from '../../../../../domain/api/IndisponibilidadesVoluntariosApi';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { MinisterioVoluntarioFuncoesApi } from '../../../../../domain/api/MinisterioVoluntarioFuncoesApi';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../../../../domain/enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { AppImages } from '../../../../../assets/app_images';
import { useAuth } from '../../../../../contexts/AuthContext';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyListItemCard from '../../../../cards/FancyListItemCard';

export interface AdicionarVoluntarioModalProps {
  data: EscalaItemEquipeType & {
    ministerioId: string;
    idEscalaItem: string;
    evento: {
      dataOcorrencia: Date;
      dataInicio: Date;
      dataTermino: Date;
    };
  };
  currentEquipe?: EscalaItemEquipeType[];
}

export interface AdicionarVoluntarioConfirmDialog {
  idEscalaItem: string;
  idVoluntario?: string;
  nomeAvulso?: string;
}

export default function AdicionarVoluntarioModal({
  data,
  currentEquipe,
  ...props
}: AdicionarVoluntarioModalProps & FancyModalDialogProps<any>) {
  const palette = usePallete();
  const [disponiveisNaData, setDisponiveisNaData] = useState(false);
  const [temMesmaFuncao, setTemMesmaFuncao] = useState(false);
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;

  const {
    ministerioVoluntariosList,
    ministerioVoluntariosDropDownList: dropDownList,
    isLoadingMinisterioVoluntarios,
    isLoadingMinisterioVoluntariosMutation,
  } = useVoluntariosDoMinisterioCrud(data.ministerioId);

  const [voluntariosDropDownList, setVoluntariosDropDownList] = useState<
    DropDownItemProps<string>[]
  >([]);

  const [isLoadingVoluntarios, setIsLoadingVoluntarios] = useState(false);

  // Estabiliza as dependências do useEffect
  const dataOcorrenciaString = useMemo(
    () => data.evento.dataOcorrencia.toISOString(),
    [data.evento.dataOcorrencia],
  );
  const funcaoId = useMemo(() => data.funcao?.id, [data.funcao?.id]);

  // IDs de ministerioVoluntario já escalados NESTA MESMA função neste evento (evita
  // duplo escalonamento na mesma função — funções diferentes permitem dupla escalação).
  const alreadyAssignedIds = useMemo(() => {
    if (!currentEquipe) return new Set<string>();
    return new Set(
      currentEquipe
        .filter(
          (e) =>
            e.idEscalaItem !== data.idEscalaItem &&
            !!e.voluntario?.minVoluntarioId &&
            e.funcao?.id === funcaoId,
        )
        .map((e) => e.voluntario!.minVoluntarioId),
    );
  }, [currentEquipe, funcaoId, data.idEscalaItem]);

  useEffect(() => {
    const filteredDropDown = dropDownList.filter(
      (item) => !alreadyAssignedIds.has(item.value as string),
    );

    if (!data) {
      setVoluntariosDropDownList(filteredDropDown);
      return;
    }

    if (!disponiveisNaData && !temMesmaFuncao) {
      setVoluntariosDropDownList(filteredDropDown);
      return;
    }

    async function filtrarVoluntarios() {
      try {
        setIsLoadingVoluntarios(true);

        let newList = ministerioVoluntariosList.filter((mv) => !alreadyAssignedIds.has(mv.id!));

        if (!igrejaId) {
          setVoluntariosDropDownList(filteredDropDown);
          return;
        }

        // Filtra por disponibilidade
        if (disponiveisNaData) {
          const resultados = await Promise.all(
            newList.map(async (minVoluntario) => {
              const voluntarioId = (minVoluntario.voluntario as any)?.id;
              const indisponivel = await IndisponibilidadesVoluntariosApi.search({
                igrejaId,
                where: {
                  conditions: [
                    {
                      path: 'voluntario.id',
                      operator: Operator.EQUALS,
                      value: { type: ValueType.LITERAL, value: voluntarioId! },
                    },
                    {
                      path: 'data',
                      operator: Operator.EQUALS,
                      value: { type: ValueType.LITERAL, value: dataOcorrenciaString.split('T')[0] },
                    },
                  ],
                  conjunction: Conjunction.AND,
                },
              });

              return { item: minVoluntario, manter: indisponivel && indisponivel.length === 0 };
            }),
          );

          newList = resultados.filter((r) => r.manter).map((r) => r.item);
        }

        // Filtra por função
        if (temMesmaFuncao) {
          const resultados = await Promise.all(
            newList.map(async (minVoluntario) => {
              const funcoes = await MinisterioVoluntarioFuncoesApi.search({
                where: {
                  conditions: [
                    {
                      path: 'ministerioVoluntario.id',
                      operator: Operator.EQUALS,
                      value: { type: ValueType.LITERAL, value: minVoluntario.id! },
                    },
                    {
                      path: 'funcao.id',
                      operator: Operator.EQUALS,
                      value: { type: ValueType.LITERAL, value: funcaoId! },
                    },
                    {
                      path: 'status',
                      operator: Operator.EQUALS,
                      value: {
                        type: ValueType.LITERAL,
                        value: MinisterioVoluntarioFuncaoStatusEnum.Ativo,
                      },
                    },
                  ],
                  conjunction: Conjunction.AND,
                },
              });

              return { item: minVoluntario, manter: funcoes && funcoes.length > 0 };
            }),
          );

          newList = resultados.filter((r) => r.manter).map((r) => r.item);
        }

        // Monta a lista final do dropdown
        const mapped = newList.map((minVoluntario) => {
          const voluntario = minVoluntario.voluntario as any;
          return {
            title: voluntario?.nome,
            subtitle: minVoluntario.funcoes
              ?.map((f) => f.funcao?.nome)
              .filter(Boolean)
              .join(', '),
            value: minVoluntario.id,
            left: {
              type: 'image',
              source:
                voluntario?.fotoThumbUrl || voluntario?.fotoUrl
                  ? { uri: voluntario?.fotoThumbUrl || voluntario?.fotoUrl || '' }
                  : AppImages.emptyProfile,
            },
          } as DropDownItemProps<string>;
        });

        setVoluntariosDropDownList(mapped);
      } finally {
        setIsLoadingVoluntarios(false);
      }
    }

    filtrarVoluntarios();
  }, [
    ministerioVoluntariosList,
    disponiveisNaData,
    temMesmaFuncao,
    dataOcorrenciaString,
    funcaoId,
    igrejaId,
    dropDownList,
    alreadyAssignedIds,
  ]);

  const [selectedVoluntario, setSelectedVoluntario] = useState<string | null>(null);
  const [pessoaNaoCadastrada, setPessoaNaoCadastrada] = useState(false);
  const [nomeAvulso, setNomeAvulso] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (): boolean => {
    if (pessoaNaoCadastrada) {
      if (nomeAvulso.trim()) {
        setErrors({});
        return true;
      }
      setErrors({ nomeAvulso: 'Campo Obrigatório' });
      return false;
    }

    if (selectedVoluntario) {
      setErrors({});
      return true;
    }

    setErrors({ voluntario: 'Campo Obrigatório' });
    return false;
  };

  const handleConfirm = async () => {
    if (handleSubmit()) {
      try {
        setIsSubmitting(true);
        await props.onButton2Press?.(
          pessoaNaoCadastrada
            ? { idEscalaItem: data.idEscalaItem, nomeAvulso: nomeAvulso.trim() }
            : { idEscalaItem: data.idEscalaItem, idVoluntario: selectedVoluntario! },
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isBusy =
    isLoadingMinisterioVoluntarios ||
    isLoadingMinisterioVoluntariosMutation ||
    isLoadingVoluntarios;

  return (
    <FancyBottomSheetModal
      visible={!!props.modalProps?.visible}
      onClose={() => props.onButton1Press?.()}
      title='Selecionar Voluntário'
      closeDisabled={isSubmitting}
      footer={
        <FancyButton
          label='Adicionar'
          loadingText='Adicionando...'
          icon={{ library: 'MaterialCommunityIcons', name: 'account-plus', size: 18 }}
          isLoading={isSubmitting}
          disabled={isSubmitting || isBusy}
          onPress={() => void handleConfirm()}
        />
      }
    >
      <View style={[styles.container, { pointerEvents: isBusy ? 'none' : 'auto' }]}>
        <FancyListItemCard
          leading={{
            type: 'date',
            day: String(data.evento.dataOcorrencia.getDate()).padStart(2, '0'),
            month: data.evento.dataOcorrencia
              .toLocaleDateString('pt-BR', { month: 'short' })
              .replace('.', ''),
          }}
          title={data?.funcao?.nome ?? ''}
          subtitle={`${format(data?.evento.dataOcorrencia, 'dd/MM/yyyy')} - ${format(data?.evento.dataInicio!, 'HH:mm')} à ${format(data?.evento.dataTermino!, 'HH:mm')}`}
        />

        <FancyGroup>
          <View style={{ gap: 8 }}>
            <View style={styles.sectionEyebrow}>
              <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
              <FancyText
                type='semiBold'
                size='extraSmall'
                color={palette.primary}
                style={styles.sectionEyebrowText}
              >
                SELECIONAR VOLUNTÁRIO
              </FancyText>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ gap: 8 }}>
                <FancyCheckbox
                  value={pessoaNaoCadastrada}
                  onChangeValue={(v) => {
                    setPessoaNaoCadastrada(v);
                    setErrors({});
                  }}
                  label='Pessoa não cadastrada'
                  disabled={isSubmitting}
                />
                {!pessoaNaoCadastrada && (
                  <>
                    <FancyCheckbox
                      value={disponiveisNaData}
                      onChangeValue={setDisponiveisNaData}
                      label='Disponíveis na data'
                      disabled={isSubmitting}
                    />
                    <FancyCheckbox
                      value={temMesmaFuncao}
                      onChangeValue={setTemMesmaFuncao}
                      label='Tem a mesma função'
                      disabled={isSubmitting}
                    />
                  </>
                )}
              </View>

              {pessoaNaoCadastrada ? (
                <View style={{ flexDirection: 'column', gap: 5 }}>
                  <FancyTextInput
                    label='Nome'
                    placeholder='Nome da pessoa'
                    value={nomeAvulso}
                    errorMessage={errors['nomeAvulso']}
                    inputProps={{
                      onChangeText: (t) => {
                        setNomeAvulso(t);
                        setErrors((prev) => {
                          const { nomeAvulso: _nomeAvulso, ...rest } = prev;
                          return rest;
                        });
                      },
                    }}
                    disabled={isSubmitting}
                  />
                  <FancyText size='extraSmall' color={palette.fonts.inactive}>
                    Sem conta no app — não recebe notificação, o líder marca presença manualmente.
                  </FancyText>
                </View>
              ) : (
                <>
                  {isLoadingVoluntarios && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <ActivityIndicator size='small' color={palette.primary} />
                      <FancyText size='extraSmall' color={palette.fonts.inactive}>
                        Filtrando voluntários...
                      </FancyText>
                    </View>
                  )}

                  <View style={{ flexDirection: 'column', gap: 5 }}>
                    <FancySearchSelect
                      label='Voluntário'
                      placeholder='Buscar voluntário...'
                      value={selectedVoluntario}
                      onChange={(value) => {
                        setSelectedVoluntario(Array.isArray(value) ? value[0] || null : value);
                        setErrors((prev) => {
                          const { voluntario, ...rest } = prev;
                          return rest;
                        });
                      }}
                      listItems={voluntariosDropDownList}
                      disabled={
                        isSubmitting ||
                        isLoadingMinisterioVoluntarios ||
                        isLoadingMinisterioVoluntariosMutation ||
                        isLoadingVoluntarios
                      }
                    />
                    {errors && <FancyErrorText message={errors['voluntario']} />}
                  </View>
                </>
              )}
            </View>
          </View>
        </FancyGroup>
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingTop: 0, paddingBottom: 10 },
  sectionEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionEyebrowTick: {
    width: 3,
    height: 11,
    borderRadius: 2,
  },
  sectionEyebrowText: {
    letterSpacing: 0.8,
  },
});
