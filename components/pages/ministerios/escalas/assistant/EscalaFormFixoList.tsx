import { FieldArrayWithId, useFieldArray, useFormContext } from 'react-hook-form';
import {
    EscalaEventoTemplateFixoFormData,
    EscalaEventoTemplateFormData,
} from '../../../../../domain/schemas/escalaSchema';
import { DefaultIconsNames } from '../../../../../constants/icons';
import React, { useCallback, useMemo, useState } from 'react';
import EscalaFormFixoModal from './EscalaFormFixoModal';
import FancyContainerList from '../../../../container_list/FancyContainerList';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { FancyAlert } from '../../../../modal/FancyAlert';
import { MinisterioFuncaoModel } from '../../../../../domain/models/MinisterioFuncao';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { MinisterioVoluntarioModel } from '../../../../../domain/models/MinisterioVoluntario';

interface EscalaFormFixoListProps {
  funcoesList: MinisterioFuncaoModel[];
  funcoesDropDownList: DropDownItemProps<string>[];
  ministerioVoluntariosDropDownList: DropDownItemProps<string>[];
  ministerioVoluntariosList: MinisterioVoluntarioModel[];
}

export const EscalaFormFixoList = React.memo(function EscalaFormFixoList({
  funcoesList,
  funcoesDropDownList,
  ministerioVoluntariosDropDownList,
  ministerioVoluntariosList,
}: EscalaFormFixoListProps) {
  const { control } = useFormContext<EscalaEventoTemplateFormData>();

  const fixosArray = useFieldArray({
    control: control,
    name: 'fixos',
    keyName: 'fixKey',
  });

  const [modalProps, setModalProps] = useState<{
    mode?: 'add' | 'edit';
    visible: boolean;
    data?: EscalaEventoTemplateFixoFormData;
  }>();

  const handleAdd = useCallback(
    (item: EscalaEventoTemplateFixoFormData) => {
      fixosArray.append(item);
    },
    [fixosArray]
  );

  const handleEdit = useCallback(
    (item: EscalaEventoTemplateFixoFormData) => {
      const voluntarioIndex = fixosArray.fields.findIndex(f => f.minVolId === item.minVolId);
      fixosArray.update(voluntarioIndex, item);
    },
    [fixosArray]
  );

  const handleDelete = useCallback(
    (item: FieldArrayWithId<EscalaEventoTemplateFormData, 'fixos', 'fixKey'>) => {
      FancyAlert.alert('Exclusão', `Deseja realmente excluir o voluntário?`, [
        {
          text: 'Não',
          style: 'destructive',
        },
        {
          text: 'Sim',
          style: 'default',
          onPress: () => {
            const index = fixosArray.fields.findIndex(f => f.fixKey === item.fixKey);
            fixosArray.remove(index);
          },
        },
      ]);
    },
    [fixosArray]
  );

  const handleReset = useCallback(() => {
    FancyAlert.alert('Exclusão', `Deseja realmente excluir todos voluntários?`, [
      {
        text: 'Não',
        style: 'destructive',
      },
      {
        text: 'Sim',
        style: 'default',
        onPress: () => {
          fixosArray.replace([]);
        },
      },
    ]);
  }, [fixosArray]);

  const voluntariosMap = useMemo(
    () => new Map(ministerioVoluntariosList.map(vol => [vol.id, vol.voluntario?.nome ?? ''])),
    [ministerioVoluntariosList]
  );

  const funcoesMap = useMemo(
    () => new Map(funcoesList.map(funcao => [funcao.id, funcao.nome ?? ''])),
    [funcoesList]
  );

  const sortedFixosFields = useMemo(() => {
    if (!fixosArray.fields.length) return [];

    const resultado = [...fixosArray.fields].sort((a, b) => {
      const voluntarioCompare = (voluntariosMap.get(a.minVolId) ?? '').localeCompare(
        voluntariosMap.get(b.minVolId) ?? '',
        'pt-BR',
        { sensitivity: 'base' }
      );

      if (voluntarioCompare !== 0) return voluntarioCompare;

      return (funcoesMap.get(a.funcaoId) ?? '').localeCompare(funcoesMap.get(b.funcaoId) ?? '', 'pt-BR', {
        sensitivity: 'base',
      });
    });

    return resultado;
  }, [fixosArray.fields, voluntariosMap, funcoesMap]);

  return (
    <>
      <FancyContainerList
        title={'Equipe'}
        contentContainerStyle={{ paddingTop: 5 }}
        data={sortedFixosFields}
        keyExtractor={({ fixKey }) => fixKey}
        renderItem={({ item }) => {
          const voluntarioInfo = ministerioVoluntariosList.find(v => v.id === item.minVolId);
          const funcaoInfo = funcoesList.find(f => f.id === item.funcaoId);

          return (
            <FancyCard.Image
              type="image"
              props={{
                title: voluntarioInfo?.voluntario?.nome,
                subtitle: funcaoInfo?.nome,
                source: voluntarioInfo?.voluntario?.foto
                  ? { uri: voluntarioInfo.voluntario.foto }
                  : require('../../../../../assets/images/empty_profile_image.png'),
                actionButtons: [
                  {
                    icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error },
                    onPress: () => handleDelete(item),
                  },
                ],
              }}
            />
          );
        }}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 18 },
            onPress: () => setModalProps({ visible: true, mode: 'add', data: undefined }),
          },
          {
            icon: { ...DefaultIconsNames['list-clear'], size: 16, style: { paddingLeft: 2 } },
            onPress: handleReset,
          },
        ]}
      />

      {modalProps?.visible && (
        <EscalaFormFixoModal
          mode={modalProps.mode!}
          data={modalProps.data}
          voluntariosSelectionList={ministerioVoluntariosDropDownList}
          funcoesSelectionList={funcoesDropDownList}
          modalProps={{
            onButton1Press: () => setModalProps({ visible: false, mode: undefined, data: undefined }),
            onButton2Press: data => {
              if (!data) return;

              if (modalProps.mode === 'add') handleAdd(data);
              else if (modalProps.mode === 'edit') handleEdit(data);

              setModalProps({ visible: false, mode: undefined, data: undefined });
            },
          }}
          validateUniqueFuncaoOnVoluntario={data => {
            const funcaoAlreadyExists = fixosArray.fields.some(
              v => v.minVolId === data.minVolId && v.funcaoId === data.funcaoId
            );

            return !funcaoAlreadyExists;
          }}
        />
      )}
    </>
  );
});
