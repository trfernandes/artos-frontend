import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
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
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { FancyAlert } from '../../../../modal/FancyAlert';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { AppImages } from '../../../../../assets/app_images';
import { useAuth } from '../../../../../contexts/AuthContext';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyListItemCard from '../../../../cards/FancyListItemCard';
import FancyChips from '../../../../FancyChips';

export interface SubstituirVoluntarioModalProps {
  visible: boolean;
  onClose: () => void;
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
  onConfirm: (data: SubstituicaoConfirmDialog) => Promise<void>;
}

export interface SubstituicaoConfirmDialog {
  idEscalaItem: string;
  idVoluntario: string;
  idSubstituto?: string;
  nomeAvulso?: string;
}

export default function SubstituirVoluntarioModal({
  visible,
  onClose,
  data,
  currentEquipe,
  onConfirm,
}: SubstituirVoluntarioModalProps) {
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

  const [isLoadingSubstitutos, setIsLoadingSubstitutos] = useState(false);

  // Estabiliza as dependências do useEffect
  const dataOcorrenciaString = useMemo(
    () => data.evento.dataOcorrencia.toISOString(),
    [data.evento.dataOcorrencia],
  );
  const funcaoId = useMemo(() => data.funcao?.id, [data.funcao?.id]);
  const currentVoluntarioId = useMemo(
    () => data.voluntario?.minVoluntarioId,
    [data.voluntario?.minVoluntarioId],
  );

  // Escopado pela mesma função do slot (funções diferentes permitem dupla escalação).
  const alreadyAssignedIds = useMemo(() => {
    if (!currentEquipe) return new Set<string>();
    return new Set(
      currentEquipe
        .filter(
          (e) =>
            !!e.voluntario?.minVoluntarioId &&
            e.voluntario.minVoluntarioId !== currentVoluntarioId &&
            e.funcao?.id === funcaoId,
        )
        .map((e) => e.voluntario!.minVoluntarioId),
    );
  }, [currentEquipe, currentVoluntarioId, funcaoId]);

  useEffect(() => {
    const dropDownListWithoutCurrentVoluntario = dropDownList.filter(
      (v) => v.value !== currentVoluntarioId && !alreadyAssignedIds.has(v.value as string),
    );

    if (!data) {
      setVoluntariosDropDownList(dropDownListWithoutCurrentVoluntario);
      return;
    }

    if (!disponiveisNaData && !temMesmaFuncao) {
      setVoluntariosDropDownList(dropDownListWithoutCurrentVoluntario);
      return;
    }

    async function filtrarVoluntarios() {
      try {
        setIsLoadingSubstitutos(true);

        const listWithoutCurrentVoluntario = ministerioVoluntariosList.filter(
          (v) => v.id !== currentVoluntarioId && !alreadyAssignedIds.has(v.id!),
        );

        let newList = [...listWithoutCurrentVoluntario];

        if (!igrejaId) {
          setVoluntariosDropDownList(dropDownListWithoutCurrentVoluntario);
          return;
        }

        // 🔹 Filtra por disponibilidade
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

        // 🔹 Filtra por função
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
                  ],
                  conjunction: Conjunction.AND,
                },
              });

              return { item: minVoluntario, manter: funcoes && funcoes.length > 0 };
            }),
          );

          newList = resultados.filter((r) => r.manter).map((r) => r.item);
        }

        // 🔹 Monta a lista final do dropdown
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
        setIsLoadingSubstitutos(false);
      }
    }

    filtrarVoluntarios();
  }, [
    ministerioVoluntariosList,
    disponiveisNaData,
    temMesmaFuncao,
    dataOcorrenciaString,
    funcaoId,
    currentVoluntarioId,
    igrejaId,
    alreadyAssignedIds,
  ]);

  const [selectedSubstituto, setSelectedSubstituto] = useState<string | null>(null);
  const [pessoaNaoCadastrada, setPessoaNaoCadastrada] = useState(false);
  const [nomeAvulso, setNomeAvulso] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (pessoaNaoCadastrada) {
      if (!nomeAvulso.trim()) {
        setErrors({ nomeAvulso: 'Campo Obrigatório' });
        return;
      }
    } else if (!selectedSubstituto) {
      setErrors({ substituto: 'Campo Obrigatório' });
      return;
    }
    setErrors({});
    FancyAlert.alert('Confirmação', 'Você deseja realmente confirmar a substituição?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSubmitting(true);
            await onConfirm({
              idEscalaItem: data.idEscalaItem,
              idVoluntario: data.voluntario?.minVoluntarioId ?? '',
              ...(pessoaNaoCadastrada
                ? { nomeAvulso: nomeAvulso.trim() }
                : { idSubstituto: selectedSubstituto! }),
            });
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Substituição'
      closeDisabled={isSubmitting}
      footer={
        <View style={styles.footer}>
          <FancyButton
            type='outlined'
            label='Cancelar'
            onPress={onClose}
            disabled={isSubmitting}
            containerStyle={styles.footerButton}
          />
          <FancyButton
            type='contained'
            label='Substituir'
            onPress={handleConfirm}
            isLoading={isSubmitting}
            loadingText='Substituindo...'
            disabled={
              isSubmitting ||
              isLoadingMinisterioVoluntarios ||
              isLoadingMinisterioVoluntariosMutation ||
              isLoadingSubstitutos
            }
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <View
        style={{
          gap: 10,
          pointerEvents:
            isLoadingMinisterioVoluntarios ||
            isLoadingMinisterioVoluntariosMutation ||
            isLoadingSubstitutos
              ? 'none'
              : 'auto',
        }}
      >
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

        <FancyListItemCard
          leading={{
            type: 'image',
            source:
              data.voluntario?.fotoUrl || data.voluntario?.fotoThumbUrl
                ? { uri: data.voluntario?.fotoThumbUrl || data.voluntario?.fotoUrl || '' }
                : AppImages.emptyProfile,
          }}
          title={data?.voluntario?.nome ?? data?.nomeAvulso ?? ''}
          subtitle={data?.funcao?.nome}
          status={<FancyChips label='Atual' color={palette.warning} outlined />}
        />
      </View>
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
              PARA
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
                {isLoadingSubstitutos && (
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
                    label='Substituto'
                    placeholder='Buscar voluntário...'
                    value={selectedSubstituto}
                    onChange={(value) => {
                      setSelectedSubstituto(Array.isArray(value) ? (value[0] ?? null) : value);
                      setErrors((prev) => {
                        const { substituto: _substituto, ...rest } = prev;
                        return rest;
                      });
                    }}
                    listItems={voluntariosDropDownList}
                    isLoading={isLoadingSubstitutos}
                    disabled={
                      isSubmitting ||
                      isLoadingMinisterioVoluntarios ||
                      isLoadingMinisterioVoluntariosMutation
                    }
                  />
                  {errors['substituto'] && <FancyErrorText message={errors['substituto']} />}
                </View>
              </>
            )}
          </View>
        </View>
      </FancyGroup>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  footerButton: {
    flex: 1,
  },
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
