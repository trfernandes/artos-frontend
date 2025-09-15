import { StyleSheet, TouchableOpacity } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import { useState } from 'react';
import DefaultIcons from '../../../FancyIcons';
import FancyText from '../../../FancyText';
import { DefaultIconsNames } from '../../../../constants/icons';
import EventoRepeticaoInputCustom from './EventoRepeticaoInputCustom';
import FancySettingItem from '../../../FancySettingItem';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventos';
import { RecorrenciaEnum } from '../../../../domain/models/Evento';

export type RecorrenciaValue = { type: 'Nunca' } | { type: 'Personalizado' };
export type EventoRepeticaoInputProps = {
  value?: RecorrenciaValue;
  onChange?: (value: RecorrenciaValue) => void;
  disabled?: boolean;
};

export default function EventoRepeticaoInput({ value, onChange, disabled = false }: EventoRepeticaoInputProps) {
  const [recorrenciaValue, setRecorrenciaValue] = useState<RecorrenciaValue>(value || { type: 'Nunca' });
  const [modalVisible, setModalVisible] = useState(false);

  // const generateDescription = (frequencia: Frequencia) => {
  //   let result = '';

  //   switch (frequencia.type) {
  //     case 'Semanal':
  //       if (!frequencia.data?.diasSemana || frequencia.data.diasSemana.length === 0) {
  //         result = 'Nenhum dia';
  //       } else if (frequencia.data.diasSemana.length === 7) {
  //         result = 'Todos os dias';
  //       } else {
  //         const dias = frequencia.data.diasSemana.map(item => DIAS_SEMANA[item]);
  //         if (dias.length === 1) {
  //           result = `Todos ${dias[0].artigo} ${dias[0].plural}`;
  //         } else if (dias.length === 2) {
  //           result = `Todos ${dias[0].artigo} ${dias[0].plural} e ${dias[1].plural}`;
  //         } else {
  //           result = `Todos ${dias[0].artigo} ${dias.slice(0, -1).join(', ')} e ${dias[dias.length - 1].plural}`;
  //         }
  //       }
  //       break;

  //     case 'Mensal':
  //       //A CADA MES

  //       result = `A cada (${frequencia.data?.aCadaMes ? frequencia.data?.aCadaMes : 0}) Mês(es)`;

  //       result += '\n';

  //       // SEMANAS DO MÊS
  //       if (!frequencia.data?.semanasDoMes || frequencia.data?.semanasDoMes?.length === 0) {
  //         result += 'Em nenhuma semana';
  //       } else if (frequencia.data?.semanasDoMes?.length === 1) {
  //         result += `Na ${frequencia.data?.semanasDoMes?.map(item => SEMANAS_MES[item].abreviado).join(', ')} semana do mês`;
  //       } else if (frequencia.data?.semanasDoMes?.length === Object.keys(SEMANAS_MES).length) {
  //         result += `Em todas as semanas do mês`;
  //       } else {
  //         result += `Nas ${frequencia.data?.semanasDoMes
  //           ?.slice(0, -1)
  //           .map(item => SEMANAS_MES[item].abreviado)
  //           .join(', ')} e ${frequencia.data?.semanasDoMes?.slice(-1).map(item => SEMANAS_MES[item].abreviado)} semanas do mês`;
  //       }

  //       result += '\n';

  //       // DIAS DA SEMANA
  //       if (!frequencia.data?.diasSemana || frequencia.data.diasSemana.length === 0) {
  //         result += 'Em nenhum dia da semana';
  //       } else if (frequencia.data.diasSemana.length === 7) {
  //         result += 'Em todos os dias';
  //       } else {
  //         const dias = frequencia.data.diasSemana.map(item => DIAS_SEMANA[item]);
  //         if (dias.length === 1) {
  //           result += `Em todos(as) ${dias[0].plural}`;
  //         } else if (dias.length === 2) {
  //           result += `Em todos(as) ${dias[0].plural} e ${dias[1].plural}`;
  //         } else {
  //           result += `Em todos(as) ${dias.slice(0, -1).join(', ')} e ${dias[dias.length - 1].plural}`;
  //         }
  //       }
  //       break;

  //     default:
  //       break;
  //   }

  //   return result;
  // };

  const { control } = useFormContext<EventoFormData>();

  return (
    <Controller
      control={control}
      name="recorrencia"
      render={({ field: { value, onChange: controllerOnChange } }) => (
        <FancySettingItem
          disabled={disabled}
          icon={{ library: 'Feather', name: 'repeat', size: 14 }}
          label={'Recorrência'}
          value={value === RecorrenciaEnum.Nunca ? 'Nunca' : 'Personalizado'}
          options={[
            {
              label: 'Nunca',
              onPress: () => {
                setRecorrenciaValue({ type: 'Nunca' });
                onChange?.({ type: 'Nunca' });
              },
            },
            {
              label: 'Personalizado',
              onPress: () => {
                setRecorrenciaValue({ type: 'Personalizado' });
                onChange?.({ type: 'Personalizado' });
                controllerOnChange(RecorrenciaEnum.Semanal);
                setModalVisible(true);
              },
            },
          ]}
        >
          {recorrenciaValue.type === 'Personalizado' && (
            <>
              <TouchableOpacity style={styles.personalizadoContainer} onPress={() => setModalVisible(true)}>
                <FancyText size={'extraSmall'} type="medium" style={{ lineHeight: 16, flex: 1, borderWidth: 0 }}>
                  {/* {generateDescription(recorrenciaValue.data)} */}
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
