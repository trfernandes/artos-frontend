import { StyleSheet, TouchableOpacity } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import { useState } from 'react';
import DefaultIcons from '../../../FancyIcons';
import FancyText from '../../../FancyText';
import { DefaultIconsNames } from '../../../../constants/icons';
import EventoRepeticaoInputCustom from './EventoRepeticaoInputCustom';
import FancySettingItem from '../../../FancySettingItem';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventosCrud';
import { RecorrenciaEnum } from '../../../../domain/models/Evento';
import FancyErrorText from '../../../forms/FancyErrorText';

export type RecorrenciaValue = { type: 'Nunca' } | { type: 'Personalizado' };
export type EventoRepeticaoInputProps = {
  disabled?: boolean;
};

const DIAS_SEMANA: Record<number, { artigo: string; plural: string }> = {
  1: { artigo: 'o', plural: 'Domingos' },
  2: { artigo: 'a', plural: 'Segundas-feiras' },
  3: { artigo: 'a', plural: 'Terças-feiras' },
  4: { artigo: 'a', plural: 'Quartas-feiras' },
  5: { artigo: 'a', plural: 'Quintas-feiras' },
  6: { artigo: 'a', plural: 'Sextas-feiras' },
  7: { artigo: 'o', plural: 'Sábados' },
};

const SEMANAS_MES: Record<number, { abreviado: string }> = {
  1: { abreviado: '1ª' },
  2: { abreviado: '2ª' },
  3: { abreviado: '3ª' },
  4: { abreviado: '4ª' },
  5: { abreviado: '5ª' },
};

export default function EventoRepeticaoInput({ disabled = false }: EventoRepeticaoInputProps) {
  // const [recorrenciaValue, setRecorrenciaValue] = useState<RecorrenciaValue>(value || { type: 'Nunca' });
  const [modalVisible, setModalVisible] = useState(false);

  const {
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  const recorrencia = watch('recorrencia');

  const generateDescription = () => {
    const recorrencia = getValues('recorrencia');
    let result = '';

    if (recorrencia === RecorrenciaEnum.Semanal) {
      const diasSemana = getValues('recorrenciaSemanaDias') || [];
      if (diasSemana.length === 0) {
        result = 'Nenhum dia';
      } else if (diasSemana.length === 7) {
        result = 'Todos os dias';
      } else {
        // Ordena os dias para garantir a ordem correta
        const diasOrdenados = diasSemana.slice().sort((a, b) => a - b);
        const dias = diasOrdenados.map(item => DIAS_SEMANA[item]);
        if (dias.length === 1) {
          result = `Nas ${dias[0].plural}`;
        } else if (dias.length === 2) {
          result = `Nas ${dias[0].plural} e ${dias[1].plural}`;
        } else {
          result = `Nas ${dias
            .slice(0, -1)
            .map(d => d.plural)
            .join(', ')} e ${dias[dias.length - 1].plural}`;
        }
      }
    } else if (recorrencia === RecorrenciaEnum.Mensal) {
      const aCadaMes = getValues('recorrenciaACadaMeses') || 0;
      const semanasDoMes = getValues('recorrenciaSemanasMes') || [];
      const diasSemana = getValues('recorrenciaSemanaDias') || [];

      result = `A cada (${aCadaMes}) Mês(es)\n`;

      // SEMANAS DO MÊS
      if (semanasDoMes.length === 0) {
        result += 'Em nenhuma semana';
      } else if (semanasDoMes.length === Object.keys(SEMANAS_MES).length) {
        result += 'Em todas as semanas do mês';
      } else {
        const semanasValidas = semanasDoMes.filter(item => SEMANAS_MES[item]).sort((a, b) => a - b);
        const semanasAbreviadas = semanasValidas.map(item => SEMANAS_MES[item].abreviado);
        if (semanasAbreviadas.length === 1) {
          result += `Na ${semanasAbreviadas[0]} semana do mês`;
        } else if (semanasAbreviadas.length === 2) {
          result += `Nas ${semanasAbreviadas[0]} e ${semanasAbreviadas[1]} semanas do mês`;
        } else {
          result += `Nas ${semanasAbreviadas.slice(0, -1).join(', ')} e ${semanasAbreviadas.slice(-1)[0]} semanas do mês`;
        }
      }

      result += '\n';

      // DIAS DA SEMANA
      if (diasSemana.length === 0) {
        result += 'Em nenhum dia da semana';
      } else if (diasSemana.length === 7) {
        result += 'Em todos os dias';
      } else {
        // Ordena os dias para garantir a ordem correta
        const diasOrdenados = diasSemana.slice().sort((a, b) => a - b);
        const dias = diasOrdenados.map(item => DIAS_SEMANA[item]);
        if (dias.length === 1) {
          result += `N${dias[0].artigo}s ${dias[0].plural}`;
        } else if (dias.length === 2) {
          result += `N${dias[0].artigo}s ${dias[0].plural} e ${dias[1].plural}`;
        } else {
          result += `N${dias[0].artigo}s ${dias
            .slice(0, -1)
            .map(d => d.plural)
            .join(', ')} e ${dias[dias.length - 1].plural}`;
        }
      }
    }

    return result;
  };

  return (
    <>
      <Controller
        control={control}
        name="recorrencia"
        render={({ field: { value, onChange: controllerOnChange } }) => (
          <FancySettingItem
            disabled={disabled}
            icon={{ library: 'Feather', name: 'repeat', size: 14 }}
            label={'Recorrência'}
            value={
              recorrencia && [RecorrenciaEnum.Semanal, RecorrenciaEnum.Mensal].includes(recorrencia)
                ? 'Personalizado'
                : 'Nunca'
            }
            options={[
              {
                label: 'Nunca',
                onPress: () => {
                  setValue('recorrencia', RecorrenciaEnum.Nunca);
                },
              },
              {
                label: 'Personalizado',
                onPress: () => {
                  setValue('recorrencia', RecorrenciaEnum.Semanal);
                  setModalVisible(true);
                },
              },
            ]}
          >
            {recorrencia && [RecorrenciaEnum.Semanal, RecorrenciaEnum.Mensal].includes(recorrencia) && (
              <>
                <TouchableOpacity style={styles.personalizadoContainer} onPress={() => setModalVisible(true)}>
                  <FancyText size={'extraSmall'} type="medium" style={{ lineHeight: 16, flex: 1, borderWidth: 0 }}>
                    {generateDescription()}
                  </FancyText>
                  <DefaultIcons.Custom
                    library={DefaultIconsNames['chevron-right'].library}
                    name={DefaultIconsNames['chevron-right'].name}
                    size={18}
                    color={Pallete.icons.inactive}
                  />
                </TouchableOpacity>
                <EventoRepeticaoInputCustom
                  modalProps={{
                    visible: modalVisible,
                    onRequestClose: () => setModalVisible(false),
                  }}
                />
              </>
            )}
          </FancySettingItem>
        )}
      />
      {(errors.recorrencia ||
        errors.recorrenciaACadaMeses ||
        errors.recorrenciaSemanaDias ||
        errors.recorrenciaSemanasMes) && (
        <FancyErrorText
          message={`${errors.recorrencia ? errors.recorrencia?.message + '\n' : ''} ${
            errors.recorrenciaACadaMeses ? errors.recorrenciaACadaMeses?.message + '\n' : ''
          } ${errors.recorrenciaSemanaDias ? errors.recorrenciaSemanaDias?.message + '\n' : ''} ${
            errors.recorrenciaSemanasMes ? errors.recorrenciaSemanasMes?.message : ''
          }`}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  personalizadoContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 10,
    gap: 15,
  },
});
