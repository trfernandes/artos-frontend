import { StyleSheet, View } from 'react-native';
import FancyText from '../../../FancyText';
import FancySettingItem from '../../../FancySettingItem';
import { Controller, useFormContext } from 'react-hook-form';
import { generateRecorrenciaDescription } from '../../../../hooks/useEventosCrud';
import FancyErrorText from '../../../forms/FancyErrorText';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import { RecorrenciaEnum } from '../../../../domain/enums/Evento/recorrencia.enum';
import FancyButton from '../../../buttons/FancyButton';
import { DefaultIconsNames } from '../../../../constants/icons';

export type RecorrenciaValue = { type: 'Nunca' } | { type: 'Personalizado' };
export type EventoRepeticaoInputProps = {
  disabled?: boolean;
  setRepeticaoModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EventoRepeticaoInput({ disabled = false, setRepeticaoModalVisible }: EventoRepeticaoInputProps) {
  const {
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  const recorrencia = watch('recorrencia');

  return (
    <View style={{ gap: 5 }}>
      <Controller
        control={control}
        name='recorrencia'
        render={() => (
          <FancySettingItem
            disabled={disabled}
            icon={{ library: 'Feather', name: 'repeat', size: 14 }}
            label={'Recorrência'}
            containerStyle={{ gap: 4 }}
            value={
              recorrencia && [RecorrenciaEnum.Semanal, RecorrenciaEnum.Mensal].includes(recorrencia) ? 'Personalizado' : 'Nunca'
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
                  setRepeticaoModalVisible(true);
                },
              },
            ]}
          >
            {recorrencia && [RecorrenciaEnum.Semanal, RecorrenciaEnum.Mensal].includes(recorrencia) && (
              <>
                <View style={styles.personalizadoContainer}>
                  <FancyText
                    size={'small'}
                    type='semiBold'
                    style={{
                      opacity: 0.8,
                      flex: 1,
                      height: '100%',
                    }}
                  >
                    {getValues('recorrencia') !== undefined &&
                      generateRecorrenciaDescription(
                        getValues('recorrencia')!,
                        getValues('recorrenciaSemanaDias')!,
                        getValues('recorrenciaACadaMeses')!,
                        getValues('recorrenciaSemanasMes')!,
                      )}
                  </FancyText>
                  <FancyButton
                    label='Editar'
                    type='contained'
                    containerStyle={{ gap: 6, height: 31, minHeight: 31, width: 75 }}
                    icon={{ ...DefaultIconsNames.edit, size: 13 }}
                    onPress={() => setRepeticaoModalVisible(true)}
                  />
                </View>
              </>
            )}
          </FancySettingItem>
        )}
      />
      {(errors.recorrencia || errors.recorrenciaACadaMeses || errors.recorrenciaSemanaDias || errors.recorrenciaSemanasMes) && (
        <FancyErrorText
          message={`${errors.recorrencia ? errors.recorrencia?.message + '\n' : ''} ${
            errors.recorrenciaACadaMeses ? errors.recorrenciaACadaMeses?.message + '\n' : ''
          } ${errors.recorrenciaSemanaDias ? errors.recorrenciaSemanaDias?.message + '\n' : ''} ${
            errors.recorrenciaSemanasMes ? errors.recorrenciaSemanasMes?.message : ''
          }`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  personalizadoContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 5,
    paddingVertical: 3,
    paddingBottom: 5,
    gap: 15,
  },
});
