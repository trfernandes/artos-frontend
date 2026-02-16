import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancyCheckbox from '../../../../FancyCheckbox';
import { format } from 'date-fns';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useEffect, useState, useMemo } from 'react';
import { IndisponibilidadesVoluntariosApi } from '../../../../../domain/api/IndisponibilidadesVoluntariosApi';
import { Conjunction, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { MinisterioVoluntarioFuncoesApi } from '../../../../../domain/api/MinisterioVoluntarioFuncoesApi';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { AppImages } from '../../../../../assets/app_images';
import { useAuth } from '../../../../../contexts/AuthContext';

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
}

export interface AdicionarVoluntarioConfirmDialog {
  idEscalaItem: string;
  idVoluntario: string;
}

export default function AdicionarVoluntarioModal({ data, ...props }: AdicionarVoluntarioModalProps & FancyModalDialogProps<any>) {
  const [disponiveisNaData, setDisponiveisNaData] = useState(false);
  const [temMesmaFuncao, setTemMesmaFuncao] = useState(false);
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;

  const {
    ministerioVoluntariosList: voluntariosList,
    ministerioVoluntariosDropDownList: dropDownList,
    isLoadingMinisterioVoluntarios,
    isLoadingMinisterioVoluntariosMutation,
  } = useVoluntariosDoMinisterioCrud(data.ministerioId);

  const [voluntariosDropDownList, setVoluntariosDropDownList] = useState<DropDownItemProps<string>[]>([]);

  const [isLoadingVoluntarios, setIsLoadingVoluntarios] = useState(false);

  // Estabiliza as dependências do useEffect
  const dataOcorrenciaString = useMemo(() => data.evento.dataOcorrencia.toISOString(), [data.evento.dataOcorrencia]);
  const funcaoId = useMemo(() => data.funcao?.id, [data.funcao?.id]);

  useEffect(() => {
    if (!data) {
      setVoluntariosDropDownList(dropDownList);
      return;
    }

    if (!disponiveisNaData && !temMesmaFuncao) {
      setVoluntariosDropDownList(dropDownList);
      return;
    }

    async function filtrarVoluntarios() {
      try {
        setIsLoadingVoluntarios(true);

        let newList = [...voluntariosList];

        if (!igrejaId) {
          setVoluntariosDropDownList(dropDownList);
          return;
        }

        // Filtra por disponibilidade
        if (disponiveisNaData) {
          const resultados = await Promise.all(
            newList.map(async (minVoluntario) => {
              const indisponivel = await IndisponibilidadesVoluntariosApi.search({
                igrejaId,
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
        const mapped = newList.map(
          (minVoluntario) =>
            ({
              title: minVoluntario.voluntario?.nome,
              value: minVoluntario.id,
              left: {
                type: 'image',
                source:
                  minVoluntario.voluntario?.fotoThumbUrl || minVoluntario.voluntario?.fotoUrl
                    ? { uri: minVoluntario.voluntario?.fotoThumbUrl || minVoluntario.voluntario?.fotoUrl || '' }
                    : AppImages.emptyProfile,
              },
            } as DropDownItemProps<string>),
        );

        setVoluntariosDropDownList(mapped);
      } finally {
        setIsLoadingVoluntarios(false);
      }
    }

    filtrarVoluntarios();
  }, [voluntariosList, disponiveisNaData, temMesmaFuncao, dataOcorrenciaString, funcaoId, igrejaId]);

  const [selectedVoluntario, setSelectedVoluntario] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (): boolean => {
    if (selectedVoluntario) {
      setErrors({});
      return true;
    }

    setErrors({ voluntario: 'Campo Obrigatório' });
    return false;
  };

  const handleConfirm = () => {
    if (handleSubmit()) {
      props.onButton2Press &&
        props.onButton2Press({
          idEscalaItem: data.idEscalaItem,
          idVoluntario: selectedVoluntario!,
        });
    }
  };

  return (
    <FancyModalDialog<AdicionarVoluntarioConfirmDialog>
      {...props}
      title='Selecionar Voluntário'
      centerContainerStyle={styles.container}
      onButton2Press={handleConfirm}
      containerStyle={{
        pointerEvents: isLoadingMinisterioVoluntarios || isLoadingMinisterioVoluntariosMutation || isLoadingVoluntarios ? 'none' : 'auto',
      }}
    >
      <FancyGroup title='Evento:'>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <FancyText size={'small'} type='medium'>
            {`${format(data?.evento.dataOcorrencia, 'dd/MM/yyyy')} - ${format(data?.evento.dataInicio!, 'HH:mm')} à ${format(
              data?.evento.dataTermino!,
              'HH:mm',
            )}`}
          </FancyText>
        </View>
      </FancyGroup>

      <FancyGroup title='Função:'>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <FancyText size={'medium'} type='bold'>
            {data?.funcao?.nome}
          </FancyText>
        </View>
      </FancyGroup>

      <FancyGroup title='Selecionar Voluntário:' contentContainerStyle={{ gap: 15 }}>
        <View style={{ gap: 8 }}>
          <FancyCheckbox value={disponiveisNaData} onChangeValue={setDisponiveisNaData} label='Disponíveis na data' />
          <FancyCheckbox value={temMesmaFuncao} onChangeValue={setTemMesmaFuncao} label='Tem a mesma função' />
        </View>

        <View style={{ flexDirection: 'column', gap: 5 }}>
          <FancySearchSelect
            label='Voluntário'
            placeholder='Buscar voluntário...'
            value={selectedVoluntario}
            onChange={(value) => {
              setSelectedVoluntario(value);
              setErrors((prev) => {
                const { voluntario, ...rest } = prev;
                return rest;
              });
            }}
            listItems={voluntariosDropDownList}
            disabled={isLoadingMinisterioVoluntarios || isLoadingMinisterioVoluntariosMutation || isLoadingVoluntarios}
          />
          {errors && <FancyErrorText message={errors['voluntario']} />}
        </View>
      </FancyGroup>
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, paddingVertical: 10 },
});
