import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
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
import FancyImage from '../../../images/FancyImage';
import FancyText from '../../../FancyText';

import FancyChips from '../../../FancyChips';
import { ResponseMinisterioFuncaoDto } from '../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import { EscalaTemplateExperienciaLabel } from '../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import {
  MinisterioVoluntarioStatusEnumLabel,
  MinisterioVoluntarioStatusEnumMap,
  MinisterioVoluntarioStatusEnum,
} from '../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { AppImages } from '../../../../assets/app_images';
import { usePallete } from '../../../../hooks/usePallete';

export interface IntegranteFormFieldsProps {
  mode: 'add' | 'edit';
  voluntariosDropDownList?: DropDownItemProps<string>[];
  funcoesDropDownList?: DropDownItemProps<string>[];
  funcoesList: ResponseMinisterioFuncaoDto[];
}

export default function IntegranteFormFields({
  voluntariosDropDownList,
  funcoesDropDownList,
  funcoesList,
  mode,
}: IntegranteFormFieldsProps) {
  const palette = usePallete();
  //   console.log('IntegranteFormFields render', strfyObj({ voluntariosDropDownList, funcoesDropDownList, funcoesList, mode }));

  const [formModalOptions, setFormModalOptions] = useState<{
    visible: boolean;
    mode: 'add' | 'edit';
  }>({
    visible: false,
    mode: 'add',
  });

  const { control, getValues } = useFormContext<MinVoluntarioFormData>();

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

  const handleSave = formModal.handleSubmit((data) => {
    // console.log('Saving funcao data:', strfyObj({ data, funcoesList }));

    const findedFuncao = funcoesList.find((f) => f.id === data.id);
    const current = getValues('funcoes') as MinVoluntarioFuncaoFormData[];

    const existingIndex = current.findIndex((f) => f.id === data.id);

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
    const index = fieldsFuncao.findIndex((f) => f.id === id);
    if (index !== -1) remove(index);
  };

  const handleClearForm = () => {
    formModal.reset({ id: undefined, experiencia: undefined, nome: '' });
  };

  const notUsedFuncoesList = useMemo(() => {
    const funcoes =
      funcoesDropDownList?.filter((v) => !fieldsFuncao.some((f) => f.id === v.value)) || [];
    return funcoes;
  }, [funcoesDropDownList, fieldsFuncao]);

  const sortedFuncoesList = useMemo<MinVoluntarioFuncaoFormData[]>(() => {
    return [...fieldsFuncao].sort((a, b) => {
      const nomeA = a.nome?.toUpperCase() || '';
      const nomeB = b.nome?.toUpperCase() || '';
      return nomeA.localeCompare(nomeB, 'pt-BR', { sensitivity: 'base' });
    });
  }, [fieldsFuncao]);

  return (
    <View style={{ flex: 1, gap: 20 }}>
      {mode === 'add' ? (
        <ControlledSearchSelect
          control={control}
          name='voluntarioId'
          label='Voluntário'
          listItems={voluntariosDropDownList}
          searchPlaceholder='Buscar voluntário...'
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <FancyImage
            source={
              getValues('voluntarioFoto')
                ? { uri: getValues('voluntarioFoto') }
                : AppImages.emptyProfile
            }
            size={50}
          />
          <View style={{ gap: 2, flex: 1, minWidth: 0 }}>
            <FancyText size='largeMedium' type='bold' style={{ opacity: 0.8 }}>
              {getValues('voluntarioNome')}
            </FancyText>
            <FancyText
              size='small'
              type='medium'
              style={{ opacity: 0.8 }}
              numberOfLines={1}
              ellipsizeMode='middle'
            >
              {getValues('voluntarioEmail')}
            </FancyText>
            {getValues('voluntarioStatus') && (
              <FancyChips
                size='small'
                style={{ marginTop: 3 }}
                label={
                  MinisterioVoluntarioStatusEnumLabel[
                    MinisterioVoluntarioStatusEnumMap[getValues('voluntarioStatus')!]
                  ]
                }
                color={
                  MinisterioVoluntarioStatusEnumMap[getValues('voluntarioStatus')!] ===
                  MinisterioVoluntarioStatusEnum.Ativo
                    ? palette.primary
                    : palette.error
                }
              />
            )}
          </View>
        </View>
      )}

      <FancyContainerList
        title='Funções'
        contentContainerStyle={{ paddingTop: 10 }}
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
            key={item.id}
            type='icon'
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
                    backgroundColor: palette.error,
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
            funcoesDropDownList={
              formModalOptions.mode === 'edit' ? funcoesDropDownList : notUsedFuncoesList
            }
            onButton2Press={() => handleSave()}
            onButton1Press={() => {
              setFormModalOptions({ visible: false, mode: 'add' });
            }}
          />
        </FormProvider>
      )}
    </View>
  );
}
