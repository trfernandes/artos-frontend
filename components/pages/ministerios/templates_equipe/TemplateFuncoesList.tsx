import { useCallback, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { DefaultIconsNames } from '../../../../constants/icons';

import { EscalaTemplateFormData, EscalaTemplateFuncaoFormData, escalaTemplateFuncaoSchema } from '../../../../domain/schemas/escalaTemplateSchema';
import FancyContainerList from '../../../container_list/FancyContainerList';
import { zodResolver } from '@hookform/resolvers/zod';
import TemplateFuncoesForm from './TemplateFuncoesForm';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { Pallete } from '../../../../constants/colors';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../modal/FancyAlert';
import {
    EscalaTemplateExperienciaEnum,
    EscalaTemplateExperienciaLabel,
} from '../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { useFuncoesDoMinisterio } from '../../../../hooks/useFuncoesDoMinisterio';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import FancyLoading from '../../../FancyLoading';

interface TemplateFuncoesListProps {
  disabled?: boolean;
  funcoesList?: DropDownItemProps<string>[];
  ministerioId: string;
}

const FORM_DEFAULT_VALUES: Partial<EscalaTemplateFuncaoFormData> = {
  experiencia: EscalaTemplateExperienciaEnum.Iniciante,
  quantidade: 1,
};

export default function TemplateFuncoesList({
  disabled = false,
  funcoesList = [] as DropDownItemProps<string>[],
  ministerioId,
}: TemplateFuncoesListProps) {
  const { control, watch, setValue } = useFormContext<EscalaTemplateFormData>();
  const { append: addFuncao, update: updateFuncao, remove: removeFuncao } = useFieldArray({ control, name: 'funcoes' });
  const funcoesWatch = watch('funcoes') ?? [];

  const [formParams, setFormParams] = useState<{ visible: boolean; mode: 'add' | 'edit' }>();
  const formAdd = useForm<EscalaTemplateFuncaoFormData>({
    resolver: zodResolver(escalaTemplateFuncaoSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const { funcoesList: funcoesDataList, isLoading: isLoadingFuncoes } = useFuncoesDoMinisterio(ministerioId);

  const handleOpen = useCallback(
    (mode: 'add' | 'edit') => {
      if (disabled) {
        return;
      }
      formAdd.reset(FORM_DEFAULT_VALUES);
      setFormParams({ visible: true, mode });
    },
    [disabled, formAdd],
  );

  const handleConfirm = useCallback(
    (mode: 'add' | 'edit') => {
      if (disabled) {
        return;
      }
      formAdd.handleSubmit((data) => {
        if (mode === 'add') {
          const alreadyExists = funcoesWatch.some((item) => item.funcaoId === data.funcaoId && item.experiencia === data.experiencia);
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
          const index = funcoesWatch.findIndex((item) => item.funcaoId === data.funcaoId);
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
    [addFuncao, disabled, formAdd, funcoesWatch, setValue, updateFuncao],
  );

  const handleEdit = useCallback(
    (index: number) => {
      if (disabled) {
        return;
      }
      const entry = funcoesWatch[index];
      if (!entry) {
        return;
      }

      formAdd.reset({ ...entry });
      setFormParams({ visible: true, mode: 'edit' });
    },
    [disabled, formAdd, funcoesWatch],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (disabled) {
        return;
      }
      const entry = funcoesWatch[index];
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
    },
    [disabled, funcoesWatch, removeFuncao],
  );

  if(isLoadingFuncoes) return <FancyLoading />;

  return (
    <>
      <FancyContainerList
        title={'Formação da Equipe'}
        data={funcoesWatch}
        contentContainerStyle={{ paddingTop: 6 }}
        disabled={disabled}
        renderItem={({ item, index }: { item: EscalaTemplateFuncaoFormData; index: number }) => {
          const matchedOption = funcoesDataList.find((funcao) => funcao.id === item.funcaoId);
          const funcaoNome = matchedOption?.nome || item.funcao?.nome || 'Função não encontrada';
          const experienciaLabel = EscalaTemplateExperienciaLabel[item.experiencia];
          return (
            <FancyCard.Simple
              title={funcaoNome}
              subtitle={<FancyTextDisplayCard icon={{ library: 'MaterialCommunityIcons', name: 'star-outline', size: 12, color: Pallete.primary }} value={experienciaLabel} />}
              additionalData1={<FancyTextDisplayCard icon={{ library: 'MaterialCommunityIcons', name: 'account-multiple-outline', size: 12, color: Pallete.primary }} value={item.quantidade.toString()} />}
              letter={funcaoNome.charAt(0)}
              actionButtons={[
                {
                  icon: {
                    ...DefaultIconsNames.edit,
                    backgroundColor: Pallete.primary,
                    size: 16,
                  },
                  onPress: disabled ? undefined : () => handleEdit(index),
                },
                {
                  icon: {
                    ...DefaultIconsNames.delete,
                    size: 16,
                    backgroundColor: Pallete.error,
                  },
                  onPress: disabled ? undefined : () => handleRemove(index),
                },
              ]}
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
            onButton1Press={() => {
              formAdd.reset(FORM_DEFAULT_VALUES);
              setFormParams({ visible: false, mode: 'add' });
            }}
            onButton2Press={() => handleConfirm(formParams.mode)}
            funcoesList={funcoesList}
          />
        )}
      </FormProvider>
    </>
  );
}
