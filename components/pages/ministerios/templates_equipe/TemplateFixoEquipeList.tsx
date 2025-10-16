import { useCallback, useState } from 'react';
import { DefaultIconsNames } from '../../../../constants/icons';
import TemplateFixoEquipeForm from './TemplateFixoEquipeForm';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { EscalaTemplateFormData, escalaTemplateVoluntarioSchema } from '../../../../domain/schemas/escalaTemplateSchema';
import { Voluntario } from '../../../../domain/models/Voluntario';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pallete } from '../../../../constants/colors';
import { MinisterioFuncao } from '../../../../domain/models/MinisterioFuncao';
import { FancyAlert } from '../../../modal/FancyAlert';
import Toast from 'react-native-toast-message';
import { EscalaTemplateVoluntario } from '../../../../domain/models/EscalaTemplate';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyContainerList from '../../../container_list/FancyContainerList';

const EMPTY_PROFILE_IMAGE = require('../../../../assets/images/empty_profile_image.png');

interface TemplateFixoEquipeListProps {
  disabled?: boolean;
  voluntariosList: Voluntario[] | [];
  funcoesList: MinisterioFuncao[] | [];
  voluntariosDropDownList?: DropDownItemProps<string>[];
  funcoesDropDownList: DropDownItemProps<string>[];
}

export default function TemplateFixoEquipeList({
  disabled = false,
  voluntariosList = [] as Voluntario[],
  funcoesList = [] as MinisterioFuncao[],
  voluntariosDropDownList,
  funcoesDropDownList,
}: TemplateFixoEquipeListProps) {
  const { control, watch } = useFormContext<EscalaTemplateFormData>();
  const formAdd = useForm({ resolver: zodResolver(escalaTemplateVoluntarioSchema) });
  const { append, remove } = useFieldArray({
    control,
    name: 'voluntarios',
  });

  const voluntariosData = (watch('voluntarios') ?? []).slice().sort((a, b) => {
    const voluntarioA = voluntariosList.find(v => v.id === a.voluntarioId);
    const voluntarioB = voluntariosList.find(v => v.id === b.voluntarioId);
    const nomeA = voluntarioA?.nome?.toLowerCase() || '';
    const nomeB = voluntarioB?.nome?.toLowerCase() || '';
    if (nomeA < nomeB) return -1;
    if (nomeA > nomeB) return 1;

    const funcaoA = funcoesList.find(f => f.id === a.funcaoId);
    const funcaoB = funcoesList.find(f => f.id === b.funcaoId);
    const funcaoNomeA = funcaoA?.nome?.toLowerCase() || '';
    const funcaoNomeB = funcaoB?.nome?.toLowerCase() || '';
    if (funcaoNomeA < funcaoNomeB) return -1;
    if (funcaoNomeA > funcaoNomeB) return 1;

    return 0;
  });

  const [formParams, setFormParams] = useState<{ visible: boolean; mode: 'add' | 'edit' }>();

  const handleConfirm = useCallback(() => {
    if (disabled) {
      return;
    }
    formAdd.handleSubmit(data => {
      const alreadyExists = voluntariosData.some(v => v.voluntarioId === data.voluntarioId && v.funcaoId === data.funcaoId);

      if (alreadyExists) {
        formAdd.setError('voluntarioId', { message: 'Voluntário já adicionado.' });
        return;
      }

      append({
        voluntarioId: data.voluntarioId,
        funcaoId: data.funcaoId,
      });

      formAdd.reset();
      setFormParams({ visible: false, mode: 'add' });

      Toast.show({
        type: 'success',
        text1: 'Voluntário adicionado com sucesso!',
      });
    })();
  }, [append, disabled, formAdd, voluntariosData]);

  const handleOpen = useCallback(
    (mode: 'add' | 'edit') => {
      if (disabled) {
        return;
      }
      formAdd.reset({ voluntarioId: undefined, funcaoId: undefined, id: undefined });
      setFormParams({ visible: true, mode });
    },
    [disabled, formAdd]
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (disabled) {
        return;
      }
      const entry = voluntariosData[index];
      if (!entry) {
        return;
      }

      FancyAlert.alert('Confirmar remoção', 'Tem certeza que deseja remover este voluntário?', [
        { text: 'Não', style: 'destructive' },
        {
          text: 'Sim',
          onPress: () => {
            remove(index);
            Toast.show({
              type: 'success',
              text1: 'Voluntário removido com sucesso!',
            });
          },
        },
      ]);
    },
    [disabled, remove, voluntariosData]
  );

  return (
    <>
      <FancyContainerList
        title={'Formação da Equipe'}
        data={voluntariosData}
        virtualized={false}
        contentContainerStyle={{ paddingTop: 6 }}
        disabled={disabled}
        renderItem={({ item, index }: { item: EscalaTemplateVoluntario; index: number }) => {
          const voluntarioInfo = voluntariosList.find(option => option.id === item.voluntarioId);
          const funcaoInfo = funcoesList.find(option => option.id === item.funcaoId);
          return (
            <FancyCard.Image
              type="image"
              props={{
                title: voluntarioInfo?.nome,
                subtitle: funcaoInfo?.nome,
                source: voluntarioInfo?.foto ? { uri: voluntarioInfo?.foto } : EMPTY_PROFILE_IMAGE,
                actionButtons: [
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
          <TemplateFixoEquipeForm
            modalProps={{ visible: formParams.visible }}
            onClose={() => {
              setFormParams({ visible: false, mode: 'add' });
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

