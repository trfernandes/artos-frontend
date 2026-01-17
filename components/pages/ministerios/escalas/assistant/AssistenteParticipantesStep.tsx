import { useFieldArray, useFormContext } from 'react-hook-form';
import { View, StyleSheet, Pressable } from 'react-native';
import { EscalaFormData, EscalaParticipanteFormData } from '../../../../../domain/schemas/escalaSchema';
import FancyVerticalContainerCard, { DataType } from '../../../../cards/Vertical/FancyVerticalContainerCard';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useCallback, useEffect, useMemo } from 'react';
import FancyText from '../../../../FancyText';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { Pallete } from '../../../../../constants/colors';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';
import { AppImages } from '../../../../../assets/app_images';
import { getFirstAndLastName } from '../../../../../utils/text_utils';

export default function AssistenteParticipantesStep() {
  const { ministerioId, isShouldLoadMembers, setShouldLoadMembers } = useAssistenteEscala();

  const form = useFormContext<EscalaFormData>();

  const participantesArray = useFieldArray({
    control: form.control,
    name: 'participantes',
    keyName: 'rhfKey',
  });

  const {
    ministerioVoluntariosList: voluntarioData,
    isLoadingMinisterioVoluntarios,
    isLoadingMinisterioVoluntariosMutation,
  } = useVoluntariosDoMinisterioCrud(ministerioId);
  const participantes = form.watch('participantes');

  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (!isLoadingMinisterioVoluntarios && !isLoadingMinisterioVoluntariosMutation) {
      hideLoading();
    }
  }, [isLoadingMinisterioVoluntarios, isLoadingMinisterioVoluntariosMutation]);

  useEffect(() => {
    if (!voluntarioData || voluntarioData.length === 0) return;

    const currentParticipantes = form.getValues('participantes') ?? [];

    const hasSameParticipants =
      currentParticipantes.length === voluntarioData.length &&
      currentParticipantes.every((participante) => voluntarioData.some((voluntario) => voluntario.id === participante.minVolId));

    if (hasSameParticipants && !isShouldLoadMembers) return;

    form.setValue(
      'participantes',
      voluntarioData.map(
        (v) =>
          ({
            voluntarioId: v.voluntario?.id || v.voluntarioId,
            minVolId: v.id,
            selected: currentParticipantes.find((participante) => participante.minVolId === v.id)?.selected ?? true,
          } as EscalaParticipanteFormData),
      ),
      { shouldDirty: false, shouldTouch: false },
    );

    setShouldLoadMembers(false);
  }, [form, voluntarioData, isShouldLoadMembers, setShouldLoadMembers]);

  const voluntariosList = useMemo<DataType<'check'>[]>(() => {
    if (!participantes || participantes.length === 0) return [];

    return participantes
      .map((participante) => {
        const minVoluntario = voluntarioData?.find((v) => v.id === participante.minVolId);
        if (!minVoluntario) return null;

        return {
          key: minVoluntario.id,
          title: getFirstAndLastName(minVoluntario.voluntario?.nome),
          checked: participante.selected,
          image:
            minVoluntario.voluntario?.fotoUrl || minVoluntario.voluntario?.fotoThumbUrl
              ? { uri: minVoluntario.voluntario?.fotoThumbUrl || minVoluntario.voluntario?.fotoUrl || '' }
              : AppImages.emptyProfile,
          selected: participante.selected,
          linkedData: minVoluntario,
        } as DataType<'check'>;
      })
      .filter((item): item is DataType<'check'> => item !== null);
  }, [participantes, voluntarioData]);

  const handleChangeValue = useCallback(
    (_item: DataType<'check'>, value: boolean, index: number) => {
      const currentParticipantes = form.getValues('participantes');
      const currentParticipante = currentParticipantes?.[index];
      if (!currentParticipante) return;

      participantesArray.update(index, { ...currentParticipante, selected: value });
    },
    [form, participantesArray, participantesArray.update],
  );

  const markAll = form.watch('markParticipantsAll');

  const executeMarkAll = useCallback(
    (mark: boolean) => {
      participantesArray.replace(
        participantesArray.fields.map((participante) => ({
          ...participante,
          selected: mark,
        })),
      );
    },
    [markAll, participantesArray.fields],
  );

  if (isLoadingMinisterioVoluntarios || isLoadingMinisterioVoluntariosMutation) return;

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <FancyText size={'extraSmall'} type='semiBold'>
          Selecione os 'voluntários' que farão parte da escala:
        </FancyText>
        <Pressable
          style={{ flexDirection: 'row', gap: 7 }}
          onPress={() => {
            form.setValue('markParticipantsAll', !markAll);
            executeMarkAll(!markAll);
          }}
        >
          <DefaultIcons.Custom library='Octicons' name={markAll ? 'circle' : 'check-circle'} size={18} color={Pallete.primary} />
          <FancyText size={'small'} type='semiBold' style={{ color: Pallete.primary }}>
            {!markAll ? 'Marcar todos' : 'Desmarcar todos'}
          </FancyText>
        </Pressable>
      </View>
      <FancyVerticalContainerCard
        contentContainerStyle={{ paddingHorizontal: 20 }}
        numColumns={3}
        columnSpacing={8}
        rowSpacing={8}
        data={voluntariosList}
        topElementType='check'
        onChangeValue={handleChangeValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, flex: 1 },
});
