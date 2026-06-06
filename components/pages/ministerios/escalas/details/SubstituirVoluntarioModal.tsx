import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyAvatarImage from '../../../../images/FancyImage';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancyCheckbox from '../../../../FancyCheckbox';
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
import { getFirstAndLastName } from '../../../../../utils/text_utils';
import DefaultIcons from '../../../../FancyIcons';
import { ColorUtils } from '../../../../../utils/color_utils';

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
  idSubstituto: string;
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

  const alreadyAssignedIds = useMemo(() => {
    if (!currentEquipe) return new Set<string>();
    return new Set(
      currentEquipe
        .filter(
          (e) =>
            !!e.voluntario?.minVoluntarioId && e.voluntario.minVoluntarioId !== currentVoluntarioId,
        )
        .map((e) => e.voluntario!.minVoluntarioId),
    );
  }, [currentEquipe, currentVoluntarioId]);

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (!selectedSubstituto) {
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
              idSubstituto: selectedSubstituto,
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
            disabled={isSubmitting || isLoadingMinisterioVoluntarios || isLoadingMinisterioVoluntariosMutation || isLoadingSubstitutos}
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <View
        style={{
          backgroundColor: palette.backgroundColor2,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: palette.borderCard,
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 6,
          pointerEvents:
            isLoadingMinisterioVoluntarios ||
            isLoadingMinisterioVoluntariosMutation ||
            isLoadingSubstitutos
              ? 'none'
              : 'auto',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='event'
            size={12}
            color={palette.primary}
          />
          <FancyText size='extraSmall' type='medium'>
            {`${format(data?.evento.dataOcorrencia, 'dd/MM/yyyy')} - ${format(data?.evento.dataInicio!, 'HH:mm')} à ${format(data?.evento.dataTermino!, 'HH:mm')}`}
          </FancyText>
        </View>
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: ColorUtils.withAlpha(palette.borderCard, 0.7),
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <FancyAvatarImage
            source={
              data.voluntario?.fotoUrl || data.voluntario?.fotoThumbUrl
                ? { uri: data.voluntario?.fotoThumbUrl || data.voluntario?.fotoUrl || '' }
                : AppImages.emptyProfile
            }
            size={20}
            style={{ width: 20, height: 20 }}
          />
          <View>
            <FancyText size={10} color={palette.fonts.inactive}>
              {data?.funcao?.nome}
            </FancyText>
            <FancyText size={12} type='semiBold'>
              {getFirstAndLastName(data?.voluntario?.nome)}
            </FancyText>
          </View>
        </View>
      </View>
      <FancyGroup>
        <View style={{ gap: 8 }}>
          <FancyText size='small' type='bold'>
            Para:
          </FancyText>

          <View style={{ gap: 12 }}>
            <View style={{ gap: 8 }}>
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
            </View>

            {isLoadingSubstitutos && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
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
});
