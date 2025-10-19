import { useFieldArray, useFormContext } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { EscalaFormData, EscalaParticipanteFormData } from '../../../../domain/schemas/escalaSchema';
import FancyVerticalContainerCard, { DataType } from '../../../cards/Vertical/FancyVerticalContainerCard';
import { useVoluntariosDoMinisterio } from '../../../../hooks/useVoluntariosDoMinisterio';
import { useCallback, useEffect, useMemo } from 'react';
import FancyLoading from '../../../FancyLoading';
import { ImageUtils } from '../../../../utils/image_utils';
import FancyText from '../../../FancyText';

const EMPTY_PROFILE_IMAGE = require('../../../../assets/images/empty_profile_image.png');

export default function AssistenteParticipantesStep({
  ministerioId,
  isShouldLoad,
}: {
  ministerioId: string;
  isShouldLoad: React.RefObject<boolean>;
}) {
  const form = useFormContext<EscalaFormData>();

  const { update } = useFieldArray({
    control: form.control,
    name: 'participantes',
    keyName: 'rhfKey',
  });

  const { voluntariosList: voluntarioData, isLoading } = useVoluntariosDoMinisterio(ministerioId);
  const participantes = form.watch('participantes');

  useEffect(() => {
    if (!isShouldLoad) return;

    if (!voluntarioData || voluntarioData.length === 0) return;

    const currentParticipantes = form.getValues('participantes') ?? [];
    const hasSameParticipants =
      currentParticipantes.length === voluntarioData.length &&
      currentParticipantes.every(participante => voluntarioData.some(voluntario => voluntario.id === participante.id));

    if (hasSameParticipants) return;

    form.setValue(
      'participantes',
      voluntarioData.map(
        v =>
          ({
            id: v.id,
            selected: currentParticipantes.find(participante => participante.id === v.id)?.selected ?? true,
          } as EscalaParticipanteFormData)
      ),
      { shouldDirty: false, shouldTouch: false }
    );

    isShouldLoad.current = false;
  }, [form, voluntarioData, isShouldLoad]);

  const voluntariosList = useMemo<DataType<'check'>[]>(() => {
    if (!participantes || participantes.length === 0) return [];

    return participantes
      .map(participante => {
        const voluntario = voluntarioData?.find(v => v.id === participante.id);
        if (!voluntario) return null;

        const imageSource = ImageUtils.rawToDataUri(voluntario.foto) ?? voluntario.foto ?? EMPTY_PROFILE_IMAGE;

        return {
          key: voluntario.id,
          title: voluntario.nome,
          checked: participante.selected,
          image: imageSource || EMPTY_PROFILE_IMAGE,
          selected: participante.selected,
          linkedData: voluntario,
        } as DataType<'check'>;
      })
      .filter((item): item is DataType<'check'> => item !== null);
  }, [participantes, voluntarioData]);

  const handleChangeValue = useCallback(
    (_item: DataType<'check'>, value: boolean, index: number) => {
      const currentParticipantes = form.getValues('participantes');
      const currentParticipante = currentParticipantes?.[index];
      if (!currentParticipante) return;

      update(index, { ...currentParticipante, selected: value });
    },
    [form, update]
  );

  if (isLoading) return <FancyLoading label="Buscando Voluntarios..." />;

  return (
    <View style={styles.container}>
      <FancyText size={'extraSmall'} type="semiBold">Selecione os 'voluntários' que farão parte da escala:</FancyText>
      <FancyVerticalContainerCard data={voluntariosList} topElementType="check" onChangeValue={handleChangeValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, paddingHorizontal: 20, flex: 1 },
});
