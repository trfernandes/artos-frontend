import { EscalItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyAvatarImage from '../../../../images/FancyImage';
import FancyDropDown from '../../../../fields/FancyDropDown';
import FancyCheckbox from '../../../../FancyCheckbox';
import { format } from 'date-fns';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useEffect, useState } from 'react';
import { IndisponibilidadesVoluntariosApi } from '../../../../../domain/api/IndisponibilidadesVoluntariosApi';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { MinisterioVoluntarioFuncoesApi } from '../../../../../domain/api/MinisterioVoluntarioFuncoesApi';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { FancyAlert } from '../../../../modal/FancyAlert';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';

export interface SubstituirVoluntarioModalProps {
  data: EscalItemEquipeType & {
    ministerioId: string;
    idEscalaItem: string;
    evento: {
      dataOcorrencia: Date;
      dataInicio: Date;
      dataTermino: Date;
    };
  };
}

export interface SubstituicaoConfirmDialog {
  idEscalaItem: string;
  idVoluntario: string;
  idSubstituto: string;
}

export default function SubstituirVoluntarioModal({
  data,
  ...props
}: SubstituirVoluntarioModalProps & FancyModalDialogProps<any>) {
  const [disponiveisNaData, setDisponiveisNaData] = useState(false);
  const [temMesmaFuncao, setTemMesmaFuncao] = useState(false);

  const {
    ministerioVoluntariosList: voluntariosList,
    ministerioVoluntariosDropDownList: dropDownList,
    isLoading: isLoadingVoluntarios,
  } = useVoluntariosDoMinisterioCrud(data.ministerioId);

  const [voluntariosDropDownList, setVoluntariosDropDownList] = useState<DropDownItemProps<string>[]>([]);

  const [isLoadingSubstitutos, setIsLoadingSubstitutos] = useState(false);

  useEffect(() => {
    const dropDownListWithoutCurrentVoluntario = dropDownList.filter(v => v.value !== data.voluntario.minVoluntarioId);

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

        const listWithoutCurrentVoluntario = voluntariosList.filter(v => v.id !== data.voluntario.minVoluntarioId);

        let newList = [...listWithoutCurrentVoluntario];

        // 🔹 Filtra por disponibilidade
        if (disponiveisNaData) {
          const resultados = await Promise.all(
            newList.map(async minVoluntario => {
              const indisponivel = await IndisponibilidadesVoluntariosApi.search({
                where: {
                  conditions: [
                    {
                      path: 'voluntario.id',
                      operator: Operator.EQUALS,
                      value: { type: ValueType.LITERAL, value: minVoluntario.voluntario?.id! },
                    },
                    {
                      path: 'data',
                      operator: Operator.EQUALS,
                      value: { type: ValueType.LITERAL, value: data.evento.dataOcorrencia.toISOString().split('T')[0] },
                    },
                  ],
                  conjunction: Conjunction.AND,
                },
              });

              return { item: minVoluntario, manter: indisponivel && indisponivel.length === 0 };
            })
          );

          newList = resultados.filter(r => r.manter).map(r => r.item);
        }

        // 🔹 Filtra por função
        if (temMesmaFuncao) {
          const resultados = await Promise.all(
            newList.map(async minVoluntario => {
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
                      value: { type: ValueType.LITERAL, value: data.funcao.id },
                    },
                  ],
                  conjunction: Conjunction.AND,
                },
              });

              return { item: minVoluntario, manter: funcoes && funcoes.length > 0 };
            })
          );

          newList = resultados.filter(r => r.manter).map(r => r.item);
        }

        // 🔹 Monta a lista final do dropdown
        const mapped = newList.map(
          minVoluntario =>
            ({
              title: minVoluntario.voluntario?.nome,
              value: minVoluntario.id,
              left: { type: 'image', source: minVoluntario.voluntario?.foto },
            } as DropDownItemProps<string>)
        );

        setVoluntariosDropDownList(mapped);
      } finally {
        setIsLoadingSubstitutos(false);
      }
    }

    filtrarVoluntarios();
  }, [dropDownList, disponiveisNaData, temMesmaFuncao, data]);

  const [selectedSubstituto, setSelectedSubstituto] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (): boolean => {
    if (selectedSubstituto) {
      setErrors({});
      return true;
    }

    setErrors({ substituto: 'Campo Obrigatório' });
    return false;
  };

  const handleConfirm = () => {
    FancyAlert.alert('Confirmação', 'Você deseja realmente confirmar a substituição?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: 'destructive',
        onPress: () => {
          if (handleSubmit()) {
            props.onButton2Press &&
              props.onButton2Press({
                idEscalaItem: data.idEscalaItem,
                idVoluntario: data.voluntario.minVoluntarioId,
                idSubstituto: selectedSubstituto!,
              });
          }
        },
      },
    ]);
  };

  return (
    <FancyModalDialog<SubstituicaoConfirmDialog>
      {...props}
      title="Substituição"
      centerContainerStyle={styles.container}
      onButton2Press={handleConfirm}
      containerStyle={{ pointerEvents: isLoadingVoluntarios || isLoadingSubstitutos ? 'none' : 'auto' }}
    >
      <FancyGroup title="Evento:">
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <FancyText size={'small'} type="medium">
            {`${format(data?.evento.dataOcorrencia, 'dd/MM/yyyy')} - ${format(
              data?.evento.dataInicio!,
              'HH:mm'
            )} à ${format(data?.evento.dataTermino!, 'HH:mm')}`}
          </FancyText>
        </View>
      </FancyGroup>
      <FancyGroup title="De:" contentContainerStyle={{ flexDirection: 'row', gap: 15 }}>
        <FancyAvatarImage
          source={
            data?.voluntario.foto
              ? { uri: data.voluntario.foto }
              : require('../../../../../assets/images/empty_profile_image.png')
          }
          style={{ width: 30, height: 30 }}
        />
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <FancyText size={'medium'} type="mediumItalic">
            {data?.voluntario?.nome}
          </FancyText>
          <FancyText size={'small'} type="bold">
            {data?.funcao?.nome}
          </FancyText>
        </View>
      </FancyGroup>
      <FancyGroup title="Para:" contentContainerStyle={{ gap: 15 }}>
        <View style={{ gap: 8 }}>
          <FancyCheckbox value={disponiveisNaData} onChangeValue={setDisponiveisNaData} label="Disponíveis na data" />
          <FancyCheckbox value={temMesmaFuncao} onChangeValue={setTemMesmaFuncao} label="Tem a mesma função" />
        </View>

        <View style={{ flexDirection: 'column', gap: 5 }}>
          <FancyDropDown
            label="Substituto"
            value={selectedSubstituto}
            onChange={value => {
              setSelectedSubstituto(value);
              setErrors(prev => {
                const { substituto, ...rest } = prev;
                return rest;
              });
            }}
            listItems={voluntariosDropDownList}
            disabled={isLoadingVoluntarios || isLoadingSubstitutos}
            isLoading={isLoadingVoluntarios || isLoadingSubstitutos}
          />
          {errors && <FancyErrorText message={errors['substituto']} />}
        </View>
      </FancyGroup>
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, paddingVertical: 10 },
});
