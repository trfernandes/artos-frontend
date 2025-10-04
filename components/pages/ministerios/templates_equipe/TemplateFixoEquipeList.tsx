import { useCallback, useMemo, useState } from 'react';
import FancyContainerVerticalList from '../../../container_list/FancyContainerVerticalList';
import { DataType } from '../../../cards/Vertical/FancyVerticalContainerCard';
import { DefaultIconsNames } from '../../../../constants/icons';
import { ImageUtils } from '../../../../utils/image_utils';
import FancyButton from '../../../buttons/FancyButton';
import { View } from 'react-native';
import TemplateFixoEquipeForm from './TemplateFixoEquipeForm';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import {
  EscalaTemplateFormData,
  escalaTemplateVoluntarioSchema,
} from '../../../../domain/schemas/escalaTemplateSchema';
import { Voluntario } from '../../../../domain/models/Voluntario';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pallete } from '../../../../constants/colors';
import { MinisterioFuncao } from '../../../../domain/models/MinisterioFuncao';

const EMPTY_PROFILE_IMAGE = require('../../../../assets/images/empty_profile_image.png');

interface TemplateFixoEquipeListProps {
  voluntariosList: Voluntario[] | [];
  funcoesList: MinisterioFuncao[] | [];
  voluntariosDropDownList?: DropDownItemProps<string>[];
  funcoesDropDownList: DropDownItemProps<string>[];
}

export default function TemplateFixoEquipeList({
  voluntariosList = [] as Voluntario[],
  funcoesList = [] as MinisterioFuncao[],
  voluntariosDropDownList,
  funcoesDropDownList,
}: TemplateFixoEquipeListProps) {
  const { control, watch, setValue } = useFormContext<EscalaTemplateFormData>();
  const formAdd = useForm({ resolver: zodResolver(escalaTemplateVoluntarioSchema) });
  const { append, remove } = useFieldArray({
    control,
    name: 'voluntarios',
  });

  const voluntariosData = watch('voluntarios') ?? [];
  const respSetListVoluntarios = watch('respSetListVoluntarios') ?? [];

  const convertedData: DataType[] = useMemo(() => {
    return voluntariosData.map(item => {
      const voluntario = voluntariosList.find(v => v.id === item.voluntarioId);
      const funcaoNome = funcoesList.find(f => f.id === item.funcaoId)?.nome;
      const fotoSource = ImageUtils.rawToDataUri(voluntario?.foto);

      return {
        title: voluntario?.nome || '',
        subtitle: funcaoNome,
        topElement: {
          type: 'image',
          imageUrl: fotoSource ?? EMPTY_PROFILE_IMAGE,
        },
      } as DataType;
    });
  }, [voluntariosData, voluntariosList, funcoesList]);

  const [formParams, setFormParams] = useState<{ visible: boolean }>();

  const handleConfirm = useCallback(() => {
    formAdd.handleSubmit(data => {
      const alreadyExists = voluntariosData.some(v => v.voluntarioId === data.voluntarioId);

      if (alreadyExists) {
        formAdd.setError('voluntarioId', { message: 'Voluntário já adicionado.' });
        return;
      }

      append({
        voluntarioId: data.voluntarioId,
        funcaoId: data.funcaoId,
      });

      formAdd.reset();
      setFormParams({ visible: false });
    })();
  }, [append, formAdd, voluntariosData]);

  const handleRemove = useCallback(
    (index: number) => {
      const entry = voluntariosData[index];
      if (!entry) {
        return;
      }

      remove(index);
      if (respSetListVoluntarios.includes(entry.voluntarioId)) {
        const next = respSetListVoluntarios.filter(id => id !== entry.voluntarioId);
        setValue('respSetListVoluntarios', next, { shouldDirty: true, shouldValidate: true });
      }
    },
    [remove, setValue, respSetListVoluntarios, voluntariosData]
  );

  return (
    <>
      <FancyContainerVerticalList
        title={'Equipe'}
        listProps={{
          data: convertedData,
          itemProps: {
            additionalData: ({ index }) => {
              const current = voluntariosData[index];
              if (!current) {
                return null;
              }

              return (
                <View
                  style={{
                    width: '100%',
                    gap: 10,
                    marginVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FancyButton
                    mode="icon"
                    icon={{ ...DefaultIconsNames.edit, size: 18 }}
                    containerStyle={{ width: 32, height: 32 }}
                    onPress={() => {}}
                  />
                  <FancyButton
                    mode="icon"
                    icon={{ ...DefaultIconsNames.delete, size: 18 }}
                    containerStyle={{
                      backgroundColor: Pallete.error,
                      height: 32,
                      width: 32,
                    }}
                    onPress={() => handleRemove(index)}
                  />
                </View>
              );
            },
          },
          itemHeight: 180,
        }}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ flex: 1, paddingTop: 10 }}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 20, style: { width: 20, height: 20 } },
            onPress: () => {
              setFormParams({ visible: true });
            },
          },
        ]}
      />
      <FormProvider {...formAdd}>
        {formParams?.visible && (
          <TemplateFixoEquipeForm
            modalProps={{ visible: formParams.visible }}
            onClose={() => {
              setFormParams({ visible: false });
            }}
            onConfirm={handleConfirm}
            voluntarioList={voluntariosDropDownList}
            funcoesList={funcoesDropDownList}
          />
        )}
      </FormProvider>
    </>
  );
}
