import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { View } from 'react-native';
import { DefaultIconsNames } from '../../../../constants/icons';
import {
  MinVoluntarioFormData,
  MinVoluntarioFuncaoFormData,
  minVoluntarioFuncaoSchema,
} from '../../../../domain/schemas/ministerioVoluntariosSchema';
import { useMemo, useState } from 'react';
import IntegranteFormModal from './FormModal';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { zodResolver } from '@hookform/resolvers/zod';
import FancyContainerList from '../../../container_list/FancyContainerList';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { MinisterioFuncao } from '../../../../domain/models/MinisterioFuncao';
import { Pallete } from '../../../../constants/colors';
import { EscalaTemplateExperienciaLabel } from '../../../../domain/models/EscalaTemplate';
import { FancyAlert } from '../../../modal/FancyAlert';

export interface IntegranteFormFieldsProps {
  mode: 'add' | 'edit';
  voluntariosDropDownList?: DropDownItemProps<string>[];
  funcoesDropDownList?: DropDownItemProps<string>[];
  funcoesList: MinisterioFuncao[];
}

export default function IntegranteFormFields({
  voluntariosDropDownList,
  funcoesDropDownList,
  funcoesList,
  mode,
}: IntegranteFormFieldsProps) {
  const [formModalOptions, setFormModalOptions] = useState<{
    visible: boolean;
    mode: 'add' | 'edit';
  }>({
    visible: false,
    mode: 'add',
  });

  const { control, getValues, watch } = useFormContext<MinVoluntarioFormData>();

  const {
    fields: fieldsFuncao,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: 'funcoes',
    keyName: 'fieldId',
  });

  const formModal = useForm({
    resolver: zodResolver(minVoluntarioFuncaoSchema),
  });

  const handleSave = formModal.handleSubmit(data => {
    const findedFuncao = funcoesList.find(f => f.id === data.id);
    const current = getValues('funcoes') as MinVoluntarioFuncaoFormData[];

    const existingIndex = current.findIndex(f => f.id === data.id);

    const newItem: MinVoluntarioFuncaoFormData = {
      id: data.id,
      experiencia: data.experiencia,
      nome: findedFuncao?.nome || 'Nome não encontrado',
    };

    if (existingIndex === -1) append(newItem);
    else update(existingIndex, newItem);

    handleClearForm();
    setFormModalOptions({ visible: false, mode: 'add' });
  });

  const handleEdit = (data: MinVoluntarioFuncaoFormData) => {
    formModal.reset(data);
    setFormModalOptions({ visible: true, mode: 'edit' });
  };

  const handleDelete = (id: string) => {
    const funcao = funcoesList.find(f => f.id === id);

    FancyAlert.alert(`Confirmação`, `Tem certeza que deseja remover a função "${funcao?.nome}"?`, [
      {
        text: 'Não',
        style: 'destructive',
      },
      {
        text: 'Sim',
        onPress: () => {
          const index = fieldsFuncao.findIndex(f => f.id === id);
          if (index !== -1) remove(index);
        },
      },
    ]);
  };

  const handleClearForm = () => {
    formModal.reset({ id: undefined, experiencia: undefined, nome: '' });
  };

  const notUsedFuncoesList = useMemo(() => {
    return funcoesDropDownList?.filter(v => !fieldsFuncao.some(f => f.id === v.value)) || [];
  }, [funcoesDropDownList, fieldsFuncao]);

  const sortedFuncoesList = useMemo(() => {
    return [...fieldsFuncao].sort((a, b) => {
      const nomeA = a.nome?.toUpperCase() || '';
      const nomeB = b.nome?.toUpperCase() || '';
      return nomeA.localeCompare(nomeB);
    });
  }, [fieldsFuncao]);

  return (
    <View style={{ flex: 1, gap: 25 }}>
      <ControlledDropDown
        control={control}
        name="voluntarioId"
        label="Voluntário"
        listItems={voluntariosDropDownList}
        disabled={mode === 'edit'}
      />

      <FancyContainerList
        title="Funções"
        contentContainerStyle={{ paddingTop: 5 }}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 19 },
            onPress: () => {
              handleClearForm();
              setFormModalOptions({ visible: true, mode: 'add' });
            },
          },
        ]}
        data={sortedFuncoesList}
        renderItem={({ item }) => (
          <FancyCard.Image
            key={item.fieldId}
            type="icon"
            props={{
              title: item.nome,
              subtitle: EscalaTemplateExperienciaLabel[item.experiencia!],
              cardIcon: {
                library: 'FontAwesome6',
                name: 'person-rays',
                size: 18,
              },
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 17 },
                  onPress: () => handleEdit(item),
                },
                {
                  icon: {
                    ...DefaultIconsNames.delete,
                    size: 18,
                    backgroundColor: Pallete.error,
                  },
                  onPress: () => handleDelete(item.id),
                },
              ],
            }}
          />
        )}
      />

      {formModalOptions.visible && (
        <FormProvider {...formModal}>
          <IntegranteFormModal
            mode={formModalOptions.mode}
            title={formModalOptions.mode === 'add' ? 'Adicionar Função' : 'Editar Função'}
            funcoesDropDownList={notUsedFuncoesList}
            onConfirm={() => handleSave()}
            onClose={() => {
              setFormModalOptions({ visible: false, mode: 'add' });
            }}
          />
        </FormProvider>
      )}
    </View>
  );
}
