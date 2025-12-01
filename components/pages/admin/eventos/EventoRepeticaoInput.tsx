import { StyleSheet, TouchableOpacity } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import { useState } from 'react';
import DefaultIcons from '../../../FancyIcons';
import FancyText from '../../../FancyText';
import { DefaultIconsNames } from '../../../../constants/icons';
import EventoRepeticaoInputCustom from './EventoRepeticaoInputCustom';
import FancySettingItem from '../../../FancySettingItem';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoFormData, generateRecorrenciaDescription } from '../../../../hooks/useEventosCrud';
import { RecorrenciaEnum } from '../../../../domain/models/Evento';
import FancyErrorText from '../../../forms/FancyErrorText';

export type RecorrenciaValue = { type: 'Nunca' } | { type: 'Personalizado' };
export type EventoRepeticaoInputProps = {
  disabled?: boolean;
};

export default function EventoRepeticaoInput({ disabled = false }: EventoRepeticaoInputProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  const recorrencia = watch('recorrencia');

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
                <TouchableOpacity
                  style={styles.personalizadoContainer}
                  onPress={() => setModalVisible(true)}
                >
                  <FancyText
                    size={'extraSmall'}
                    type="medium"
                    style={{ lineHeight: 16, flex: 1, borderWidth: 0 }}
                  >
                    {getValues('recorrencia') !== undefined &&
                      generateRecorrenciaDescription(
                        getValues('recorrencia')!,
                        getValues('recorrenciaSemanaDias')!,
                        getValues('recorrenciaACadaMeses')!,
                        getValues('recorrenciaSemanasMes')!
                      )}
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
