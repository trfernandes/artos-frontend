import { useFieldArray, useFormContext } from 'react-hook-form';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  EscalaFormData,
  EscalaParticipanteFormData,
} from '../../../../../domain/schemas/escalaSchema';
import FancyVerticalContainerCard, {
  DataType,
} from '../../../../cards/Vertical/FancyVerticalContainerCard';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useCallback, useEffect, useMemo } from 'react';
import FancyText from '../../../../FancyText';
import FancyLoading from '../../../../FancyLoading';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { Pallete } from '../../../../../constants/colors';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';
import { AppImages } from '../../../../../assets/app_images';
import { getFirstAndLastName } from '../../../../../utils/text_utils';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../../../../domain/enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';

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

  const { hideLoading } = useLoading();

  const voluntariosComFuncaoAtiva = useMemo(() => {
    if (!voluntarioData) return [];

    return voluntarioData.filter((voluntario) =>
      (voluntario.funcoes ?? []).some(
        (funcao) => funcao.status === MinisterioVoluntarioFuncaoStatusEnum.Ativo,
      ),
    );
  }, [voluntarioData]);

  useEffect(() => {
    if (!isLoadingMinisterioVoluntarios && !isLoadingMinisterioVoluntariosMutation) {
      hideLoading();
    }
  }, [isLoadingMinisterioVoluntarios, isLoadingMinisterioVoluntariosMutation]);

  useEffect(() => {
    if (!voluntarioData) return;

    const currentParticipantes = form.getValues('participantes') ?? [];

    const hasSameParticipants =
      currentParticipantes.length === voluntariosComFuncaoAtiva.length &&
      currentParticipantes.every((participante) =>
        voluntariosComFuncaoAtiva.some((voluntario) => voluntario.id === participante.minVolId),
      );

    if (hasSameParticipants && !isShouldLoadMembers) return;

    form.setValue(
      'participantes',
      voluntariosComFuncaoAtiva.map(
        (v) =>
          ({
            voluntarioId: v.voluntario?.id || v.voluntarioId,
            minVolId: v.id,
            selected:
              currentParticipantes.find((participante) => participante.minVolId === v.id)
                ?.selected ?? true,
          }) as EscalaParticipanteFormData,
      ),
      { shouldDirty: false, shouldTouch: false },
    );

    setShouldLoadMembers(false);
  }, [form, voluntarioData, voluntariosComFuncaoAtiva, isShouldLoadMembers, setShouldLoadMembers]);

  const voluntariosList = useMemo<DataType<'check'>[]>(() => {
    if (!participantes || participantes.length === 0) return [];

    return participantes
      .map((participante) => {
        const minVoluntario = voluntariosComFuncaoAtiva.find((v) => v.id === participante.minVolId);
        if (!minVoluntario) return null;

        return {
          key: minVoluntario.id,
          title: getFirstAndLastName(minVoluntario.voluntario?.nome),
          checked: participante.selected,
          image:
            minVoluntario.voluntario?.fotoUrl || minVoluntario.voluntario?.fotoThumbUrl
              ? {
                  uri:
                    minVoluntario.voluntario?.fotoThumbUrl ||
                    minVoluntario.voluntario?.fotoUrl ||
                    '',
                }
              : AppImages.emptyProfile,
          selected: participante.selected,
          linkedData: minVoluntario,
        } as DataType<'check'>;
      })
      .filter((item): item is DataType<'check'> => item !== null);
  }, [participantes, voluntariosComFuncaoAtiva]);

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

  if (isLoadingMinisterioVoluntarios || isLoadingMinisterioVoluntariosMutation) {
    return (
      <View style={styles.loadingContainer}>
        <FancyLoading />
      </View>
    );
  }

  const hasParticipantesAptos = voluntariosComFuncaoAtiva.length > 0;

  return (
    <View style={styles.container}>
      <View style={{ gap: 12 }}>
        <FancyText size={'extraSmall'} type='semiBold'>
          Selecione os 'voluntários' que farão parte da escala:
        </FancyText>
        {hasParticipantesAptos ? (
          <Pressable
            style={{ flexDirection: 'row', gap: 7 }}
            onPress={() => {
              form.setValue('markParticipantsAll', !markAll);
              executeMarkAll(!markAll);
            }}
          >
            <DefaultIcons.Custom
              library='Octicons'
              name={markAll ? 'circle' : 'check-circle'}
              size={18}
              color={Pallete.primary}
            />
            <FancyText size={'small'} type='semiBold' style={{ color: Pallete.primary }}>
              {!markAll ? 'Marcar todos' : 'Desmarcar todos'}
            </FancyText>
          </Pressable>
        ) : (
          <View style={styles.emptyEligibleHint}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='alert-circle-outline'
              size={16}
              color={Pallete.warning}
            />
            <FancyText size='small' type='medium' color={Pallete.warning} style={{ flex: 1 }}>
              Nenhum participante com função ativa no ministério.
            </FancyText>
          </View>
        )}
      </View>
      {hasParticipantesAptos ? (
        <FancyVerticalContainerCard
          contentContainerStyle={{ paddingHorizontal: 0 }}
          numColumns={3}
          columnSpacing={8}
          rowSpacing={8}
          data={voluntariosList}
          topElementType='check'
          onChangeValue={handleChangeValue}
        />
      ) : (
        <View style={styles.emptyEligibleContainer}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='account-off-outline'
            size={34}
            color={Pallete.fonts.inactive}
          />
          <FancyText size='small' type='semiBold' color={Pallete.fonts.dark}>
            Sem participantes aptos
          </FancyText>
          <FancyText size='small' color={Pallete.fonts.inactive} style={{ textAlign: 'center' }}>
            Cadastre pelo menos uma função para algum voluntário deste ministério para continuar.
          </FancyText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, flex: 1 },
  emptyEligibleHint: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  emptyEligibleContainer: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Pallete.borderCard,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: Pallete.backgroundColor2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
