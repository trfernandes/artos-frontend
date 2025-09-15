import { View, StyleSheet, ModalProps } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import FancyScrollView from '../../../FancyScrollView';
import FancySettingItem from '../../../FancySettingItem';
import EventoRepeticaoInputCustomSemana from './EventoRepeticaoInputCustomSemana';
import FancyFullModal from '../../../modal/FancyFullModal';
import FancyButton from '../../../buttons/FancyButton';
import { DefaultIconsNames } from '../../../../constants/icons';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventos';
import { RecorrenciaEnum, RecorrenciaEnumLabel } from '../../../../domain/models/Evento';
import EventoRepeticaoInputCustomMensal from './EventoRepeticaoInputCustomMensal';

export default function EventoRepeticaoInputCustom({ modalProps }: { modalProps?: ModalProps }) {
  const { control, getValues, trigger, formState } = useFormContext<EventoFormData>();

  return (
    <FancyFullModal modalProps={modalProps}>
      <FancyScrollView style={{ flex: 1, borderWidth: 0, borderColor: 'coral' }}>
        <View style={styles.body}>
          <Controller
            control={control}
            name="recorrencia"
            render={({ field: { value, onChange } }) => (
              <FancySettingItem
                label="Frequência"
                value={RecorrenciaEnumLabel[value]}
                options={[
                  {
                    label: RecorrenciaEnumLabel[RecorrenciaEnum.Semanal],
                    onPress: () => {
                      onChange(RecorrenciaEnum.Semanal);
                    },
                  },
                  {
                    label: RecorrenciaEnumLabel[RecorrenciaEnum.Mensal],
                    onPress: () => {
                      onChange(RecorrenciaEnum.Mensal);
                    },
                  },
                ]}
              />
            )}
          />

          {/* SEMANAL */}
          {getValues('recorrencia') === RecorrenciaEnum.Semanal && <EventoRepeticaoInputCustomSemana />}

          {/* MENSALMENTE */}
          {getValues('recorrencia') === RecorrenciaEnum.Mensal && <EventoRepeticaoInputCustomMensal />}
        </View>
      </FancyScrollView>
      <FancyButton
        label="Confirmar"
        icon={{ ...DefaultIconsNames.confirm, size: 16 }}
        containerStyle={styles.confirmarButton}
        onPress={async e => {
          await trigger(['recorrencia', 'recorrenciaSemanaDias']);
          if (!formState.errors.recorrenciaSemanaDias) {
            modalProps?.onRequestClose?.(e);
          }
        }}
      />
    </FancyFullModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 15,
    paddingRight: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: Pallete.disabled,
  },
  body: {
    backgroundColor: 'transparent',
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 10,
  },
  confirmarButton: { marginHorizontal: 20 },
});
