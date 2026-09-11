import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FancyFormScrollView, { FancyFormScrollViewProps } from '../../../FancyFormScrollView';
import EventoRepeticaoInput from './EventoRepeticaoInput';
import { useFormContext, Controller } from 'react-hook-form';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledColorPicker from '../../../forms/ControlledColorPicker';
import EventoDatesInput from './EventoDatesInput';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import EventoRepeticaoInputCustom from './EventoRepeticaoInputCustom';
import { useState } from 'react';
import ControlledFancyToggle from '../../../forms/ControlledFancyToggle';
import { useMinisteriosCrud } from '../../../../hooks/useMinisteriosCrud';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';

interface EventosDadosFormProps {
  onlyView?: boolean;
  scrollViewProps?: FancyFormScrollViewProps;
}

export default function EventosDadosForm({
  onlyView = false,
  scrollViewProps,
}: EventosDadosFormProps) {
  const { control, watch } = useFormContext<EventoFormData>();
  const [repeticaoModalVisible, setRepeticaoModalVisible] = useState(false);
  const palette = usePallete();

  const { data: ministerios = [], isLoading: isLoadingMinisterios } = useMinisteriosCrud({
    autoFetch: true,
  });

  const restringirMinisterios = watch('restringirMinisterios');
  const ministeriosIds = watch('ministeriosIds');

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <FancyFormScrollView contentContainerStyle={styles.fields} {...scrollViewProps}>
        <ControlledTextInput control={control} name='nome' label='Nome' disabled={onlyView} />
        <EventoDatesInput disabled={onlyView} />
        <EventoRepeticaoInput
          disabled={onlyView}
          setRepeticaoModalVisible={setRepeticaoModalVisible}
        />
        <ControlledTextInput control={control} name='local' label='Local' disabled={onlyView} />
        <ControlledTextArea
          control={control}
          name='descricao'
          label='Descrição'
          disabled={onlyView}
        />
        <ControlledColorPicker control={control} name='cor' horizontal disabled={onlyView} />

        <View style={styles.ministeriosSection}>
          <ControlledFancyToggle
            control={control}
            name='restringirMinisterios'
            label='Restringir a ministérios específicos'
            option1={{ title: 'Não', value: false }}
            option2={{ title: 'Sim', value: true }}
            disabled={onlyView}
          />

          {restringirMinisterios && !onlyView && (
            <View style={styles.ministeriosChecklist}>
              <FancyText size='small' type='semiBold' style={{ color: palette.fonts.dark }}>
                Selecione os ministérios que participam:
              </FancyText>

              {isLoadingMinisterios ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size='small' />
                </View>
              ) : (
                <Controller
                  control={control}
                  name='ministeriosIds'
                  render={({ field: { onChange } }) => (
                    <View style={{ gap: 8 }}>
                      {ministerios.map((ministerio) => (
                        <FancyCard.CheckBox
                          key={ministerio.id}
                          title={ministerio.nome}
                          value={(ministeriosIds ?? []).includes(ministerio.id)}
                          onChangeValue={(isChecked: boolean) => {
                            const current = ministeriosIds ?? [];
                            if (isChecked) {
                              onChange([...current, ministerio.id]);
                            } else {
                              onChange(current.filter((id) => id !== ministerio.id));
                            }
                          }}
                          checkboxColor={palette.primary}
                        />
                      ))}
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>
      </FancyFormScrollView>

      {repeticaoModalVisible && (
        <EventoRepeticaoInputCustom
          modalProps={{
            visible: repeticaoModalVisible,
            onRequestClose: () => setRepeticaoModalVisible(false),
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 15,
    paddingHorizontal: 15,
  },
  ministeriosSection: {
    gap: 12,
  },
  ministeriosChecklist: {
    gap: 8,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
