import { useCallback, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { DefaultIconsNames } from '../../../../constants/icons';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
  EscalaTemplateFuncao,
} from '../../../../domain/models/EscalaTemplate';
import {
  EscalaTemplateFormData,
  EscalaTemplateFuncaoFormData,
  escalaTemplateFuncaoSchema,
} from '../../../../domain/schemas/escalaTemplateSchema';
import FancyContainerList from '../../../container_list/FancyContainerList';
import { zodResolver } from '@hookform/resolvers/zod';
import TemplateFuncoesForm from './TemplateFuncoesForm';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { Pallete } from '../../../../constants/colors';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../modal/FancyAlert';

interface TemplateFuncoesListProps {
  disabled?: boolean;
  funcoesList?: DropDownItemProps<string>[];
}

const FORM_DEFAULT_VALUES: Partial<EscalaTemplateFuncaoFormData> = {
  experiencia: EscalaTemplateExperienciaEnum.Iniciante,
  quantidade: 1,
};

export default function TemplateFuncoesList({
  disabled = false,
  funcoesList = [] as DropDownItemProps<string>[],
}: TemplateFuncoesListProps) {
  const { control, watch, setValue } = useFormContext<EscalaTemplateFormData>();
  const { append: addFuncao, update: updateFuncao, remove: removeFuncao } = useFieldArray({ control, name: 'funcoes' });
  const funcoesData = watch('funcoes') ?? [];

  const [formParams, setFormParams] = useState<{ visible: boolean; mode: 'add' | 'edit' }>();
  const formAdd = useForm<EscalaTemplateFuncaoFormData>({
    resolver: zodResolver(escalaTemplateFuncaoSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const handleOpen = useCallback(
    (mode: 'add' | 'edit') => {
      if (disabled) {
        return;
      }
      formAdd.reset(FORM_DEFAULT_VALUES);
      setFormParams({ visible: true, mode });
    },
    [disabled, formAdd]
  );

  const handleConfirm = useCallback(
    (mode: 'add' | 'edit') => {
      if (disabled) {
        return;
      }
      formAdd.handleSubmit(data => {
        if (mode === 'add') {
          const alreadyExists = funcoesData.some(
            item => item.funcaoId === data.funcaoId && item.experiencia === data.experiencia
          );
          if (alreadyExists) {
            formAdd.setError('funcaoId', { message: 'Função/Experiência já adicionada.' });
            return;
          }

          addFuncao({
            id: data.id,
            funcaoId: data.funcaoId,
            experiencia: data.experiencia,
            quantidade: data.quantidade,
          });

          Toast.show({
            type: 'success',
            text1: 'Função adicionada com sucesso!',
          });
        } else if (mode === 'edit') {
          const index = funcoesData.findIndex(item => item.funcaoId === data.funcaoId);
          if (index !== -1) {
            setValue(`funcoes.${index}`, data);
          }
          updateFuncao(index, { ...data });

          Toast.show({
            type: 'success',
            text1: 'Função atualizada com sucesso!',
          });
        }

        setFormParams({ visible: false, mode: 'add' });
        formAdd.reset(FORM_DEFAULT_VALUES);
      })();
    },
    [addFuncao, disabled, formAdd, funcoesData, setValue, updateFuncao]
  );

  const handleEdit = useCallback(
    (index: number) => {
      if (disabled) {
        return;
      }
      const entry = funcoesData[index];
      if (!entry) {
        return;
      }

      formAdd.reset({ ...entry });
      setFormParams({ visible: true, mode: 'edit' });
    },
    [disabled, formAdd, funcoesData]
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (disabled) {
        return;
      }
      const entry = funcoesData[index];
      if (!entry) {
        return;
      }

      FancyAlert.alert('Confirmar remoção', `Tem certeza que deseja remover a função?`, [
        { text: 'Não', style: 'destructive' },
        {
          text: 'Sim',
          onPress: () => {
            removeFuncao(index);
            Toast.show({
              type: 'success',
              text1: 'Função removida com sucesso!',
            });
          },
        },
      ]);

      setFormParams({ visible: false, mode: 'edit' });
    },
    [disabled, removeFuncao]
  );

  return (
    <>
      <FancyContainerList
        title={'Formação da Equipe'}
        data={funcoesData}
        virtualized={false}
        contentContainerStyle={{ paddingTop: 6 }}
        disabled={disabled}
        renderItem={({ item, index }: { item: EscalaTemplateFuncao; index: number }) => {
          const matchedOption = funcoesList.find(option => option.value === item.funcaoId);
          const funcaoNome = matchedOption?.title || item.funcao?.nome || 'Fun��o n�o encontrada';
          const experienciaLabel = EscalaTemplateExperienciaLabel[item.experiencia];
          return (
            <FancyCard.Image
              type="letter"
              props={{
                title: funcaoNome,
                subtitle: `Exp. mínima: ${experienciaLabel}`,
                additionalData1: `Quantidade: ${item.quantidade}`,
                letter: funcaoNome.charAt(0),
                actionButtons: [
                  {
                    icon: {
                      ...DefaultIconsNames.edit,
                      backgroundColor: disabled ? Pallete.disabled : Pallete.primary,
                      size: 16,
                    },
                    onPress: disabled ? undefined : () => handleEdit(index),
                  },
                  {
                    icon: {
                      ...DefaultIconsNames.delete,
                      size: 16,
                      backgroundColor: disabled ? Pallete.disabled : Pallete.error,
                    },
                    onPress: disabled ? undefined : () => handleRemove(index),
                  },
                ],
              }}
            />
          );
        }}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 20, style: { width: 20, height: 20 } },
            onPress: disabled ? undefined : () => handleOpen('add'),
          },
        ]}
      />
      <FormProvider {...formAdd}>
        {formParams?.visible && (
          <TemplateFuncoesForm
            mode={formParams.mode}
            modalProps={{ visible: formParams.visible }}
            onClose={() => {
              formAdd.reset(FORM_DEFAULT_VALUES);
              setFormParams({ visible: false, mode: 'add' });
            }}
            onConfirm={() => handleConfirm(formParams.mode)}
            funcoesList={funcoesList}
          />
        )}
      </FormProvider>
    </>
  );
}
