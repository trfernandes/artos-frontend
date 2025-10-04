import { useCallback, useMemo, useState } from 'react';
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
import { StyleSheet } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';

interface TemplateFuncoesListProps {
  funcoesList?: DropDownItemProps<string>[];
}

const FORM_DEFAULT_VALUES: Partial<EscalaTemplateFuncaoFormData> = {
  experiencia: EscalaTemplateExperienciaEnum.Iniciante,
  quantidade: 1,
};

export default function TemplateFuncoesList({
  funcoesList = [] as DropDownItemProps<string>[],
}: TemplateFuncoesListProps) {
  const { control, watch, setValue } = useFormContext<EscalaTemplateFormData>();
  const { append, remove } = useFieldArray({ control, name: 'funcoes' });
  const funcoesData = watch('funcoes') ?? [];
  const respSetListFuncoes = watch('respSetListFuncoes') ?? [];

  const [formParams, setFormParams] = useState<{ visible: boolean }>();
  const formAdd = useForm<EscalaTemplateFuncaoFormData>({
    resolver: zodResolver(escalaTemplateFuncaoSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const handleOpen = useCallback(() => {
    formAdd.reset(FORM_DEFAULT_VALUES);
    setFormParams({ visible: true });
  }, [formAdd]);

  const handleConfirm = useCallback(() => {
    formAdd.handleSubmit(data => {
      const alreadyExists = funcoesData.some(item => item.funcaoId === data.funcaoId);
      if (alreadyExists) {
        formAdd.setError('funcaoId', { message: 'Essa função já foi adicionada.' });
        return;
      }

      append({ ...data });
      setFormParams({ visible: false });
      formAdd.reset(FORM_DEFAULT_VALUES);
    })();
  }, [append, formAdd, funcoesData]);

  const handleRemove = useCallback(
    (index: number) => {
      const entry = funcoesData[index];
      if (!entry) {
        return;
      }

      remove(index);
      if (respSetListFuncoes.includes(entry.funcaoId)) {
        const next = respSetListFuncoes.filter(id => id !== entry.funcaoId);
        setValue('respSetListFuncoes', next, { shouldDirty: true, shouldValidate: true });
      }
    },
    [remove, setValue, respSetListFuncoes, funcoesData]
  );

  const listData = useMemo(() => funcoesData, [funcoesData]);

  return (
    <>
      <FancyContainerList
        title={'Formação da Equipe'}
        data={listData}
        contentContainerStyle={{ paddingTop: 6 }}
        renderItem={({ item, index }: { item: EscalaTemplateFuncao; index: number }) => {
          const matchedOption = funcoesList.find(option => option.value === item.funcaoId);
          const funcaoNome = matchedOption?.title || item.funcao?.nome || 'Função não encontrada';
          const experienciaLabel = EscalaTemplateExperienciaLabel[item.experiencia];
          return (
            <FancyCard.Image
              type="letter"
              props={{
                title: funcaoNome,
                subtitle: `Experiência mínima: ${experienciaLabel}`,
                additionalData1: `Quantidade: ${item.quantidade}`,
                letter: funcaoNome.charAt(0),
                actionButtons: [
                  {
                    icon: {
                      ...DefaultIconsNames.edit,
                      size: 16,
                    },
                    onPress: () => handleRemove(index),
                  },
                  {
                    icon: {
                      ...DefaultIconsNames.delete,
                      size: 16,
                      backgroundColor: Pallete.error,
                    },
                    onPress: () => handleRemove(index),
                  },
                ],
              }}
            />
          );
        }}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 20, style: { width: 20, height: 20 } },
            onPress: handleOpen,
          },
        ]}
      />
      <FormProvider {...formAdd}>
        {formParams?.visible && (
          <TemplateFuncoesForm
            modalProps={{ visible: formParams.visible }}
            onClose={() => {
              formAdd.reset(FORM_DEFAULT_VALUES);
              setFormParams({ visible: false });
            }}
            onConfirm={handleConfirm}
            funcoesList={funcoesList}
          />
        )}
      </FormProvider>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 0,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  quantityContainer: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Pallete.backgroundColor2,
    borderWidth: 1,
    borderColor: Pallete.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
