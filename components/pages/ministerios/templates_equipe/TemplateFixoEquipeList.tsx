import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DefaultIconsNames } from '../../../../constants/icons';
import TemplateFixoEquipeForm from './TemplateFixoEquipeForm';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import {
  EscalaTemplateFormData,
  EscalaTemplateVoluntarioFormData,
  escalaTemplateVoluntarioSchema,
} from '../../../../domain/schemas/escalaTemplateSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FancyAlert } from '../../../modal/FancyAlert';
import Toast from 'react-native-toast-message';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { ResponseMinisterioFuncaoDto } from '../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import { AppImages } from '../../../../assets/app_images';
import { usePallete } from '../../../../hooks/usePallete';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import FancyListItemCard from '../../../cards/FancyListItemCard';
import FancyListEmpty from '../../../list/FancyListEmpty';
import FancyActionSheet from '../../../actions/FancyActionSheet';

interface TemplateFixoEquipeListProps {
  disabled?: boolean;
  voluntariosList: ResponseMinisterioVoluntarioDto[] | [];
  funcoesList: ResponseMinisterioFuncaoDto[] | [];
  voluntariosDropDownList?: DropDownItemProps<string>[];
  funcoesDropDownList: DropDownItemProps<string>[];
}

export default function TemplateFixoEquipeList({
  disabled = false,
  voluntariosList = [] as ResponseMinisterioVoluntarioDto[],
  funcoesList = [] as ResponseMinisterioFuncaoDto[],
  voluntariosDropDownList,
  funcoesDropDownList,
}: TemplateFixoEquipeListProps) {
  const palette = usePallete();
  const { control, watch } = useFormContext<EscalaTemplateFormData>();
  const formAdd = useForm({ resolver: zodResolver(escalaTemplateVoluntarioSchema) });
  const { append, remove } = useFieldArray({
    control,
    name: 'voluntarios',
  });
  const voluntariosWatch = watch('voluntarios');

  const voluntariosData = (voluntariosWatch ?? []).slice().sort((a, b) => {
    const voluntarioA = voluntariosList.find((v) => v.id === a.voluntarioId);
    const voluntarioB = voluntariosList.find((v) => v.id === b.voluntarioId);
    const nomeA = voluntarioA?.voluntario?.nome?.toLowerCase() || '';
    const nomeB = voluntarioB?.voluntario?.nome?.toLowerCase() || '';
    if (nomeA < nomeB) return -1;
    if (nomeA > nomeB) return 1;

    const funcaoA = funcoesList.find((f) => f.id === a.funcaoId);
    const funcaoB = funcoesList.find((f) => f.id === b.funcaoId);
    const funcaoNomeA = funcaoA?.nome?.toLowerCase() || '';
    const funcaoNomeB = funcaoB?.nome?.toLowerCase() || '';
    if (funcaoNomeA < funcaoNomeB) return -1;
    if (funcaoNomeA > funcaoNomeB) return 1;

    return 0;
  });

  const [formVisible, setFormVisible] = useState(false);
  const [actionsIndex, setActionsIndex] = useState<number | null>(null);

  const handleConfirm = useCallback(() => {
    if (disabled) {
      return;
    }
    formAdd.handleSubmit((data) => {
      const alreadyExists = voluntariosData.some(
        (v) => v.voluntarioId === data.voluntarioId && v.funcaoId === data.funcaoId,
      );

      if (alreadyExists) {
        formAdd.setError('voluntarioId', { message: 'Voluntário já adicionado.' });
        return;
      }

      append({
        voluntarioId: data.voluntarioId,
        funcaoId: data.funcaoId,
      });

      formAdd.reset();
      setFormVisible(false);

      Toast.show({
        type: 'success',
        text1: 'Voluntário adicionado com sucesso!',
      });
    })();
  }, [append, disabled, formAdd, voluntariosData]);

  const handleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    formAdd.reset({ voluntarioId: undefined, funcaoId: undefined, id: undefined });
    setFormVisible(true);
  }, [disabled, formAdd]);

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
    [disabled, remove, voluntariosData],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <FancyText size='medium' type='bold' style={styles.headerTitle}>
          Formação da Equipe ({voluntariosData.length})
        </FancyText>
        {!disabled && (
          <FancyButton
            mode='icon'
            type='contained'
            icon={{ ...DefaultIconsNames.add, size: 19, color: palette.icons.light }}
            onPress={handleOpen}
            containerStyle={styles.addButton}
          />
        )}
      </View>

      {voluntariosData.length > 0 ? (
        <View style={styles.listContent}>
          {voluntariosData.map((item, index) => {
            const voluntarioInfo = voluntariosList.find(
              (option) => option.id === item.voluntarioId,
            );
            const funcaoInfo = funcoesList.find((option) => option.id === item.funcaoId);
            return (
              <FancyListItemCard
                key={`${item.voluntarioId}-${item.funcaoId}`}
                title={voluntarioInfo?.voluntario?.nome || ''}
                subtitle={funcaoInfo?.nome}
                leading={{
                  type: 'image',
                  size: 46,
                  source:
                    voluntarioInfo?.voluntario?.fotoThumbUrl || voluntarioInfo?.voluntario?.fotoUrl
                      ? {
                          uri:
                            voluntarioInfo?.voluntario?.fotoThumbUrl ||
                            voluntarioInfo?.voluntario?.fotoUrl ||
                            '',
                        }
                      : AppImages.emptyProfile,
                }}
                trailing={
                  disabled ? undefined : { type: 'menu', onPress: () => setActionsIndex(index) }
                }
              />
            );
          })}
        </View>
      ) : (
        <FancyListEmpty label='Nenhum voluntário cadastrado' />
      )}

      <FancyActionSheet
        visible={actionsIndex !== null}
        onClose={() => setActionsIndex(null)}
        actions={[
          {
            label: 'Remover',
            destructive: true,
            icon: { ...DefaultIconsNames.delete, size: 18 },
            onPress: () => {
              if (actionsIndex !== null) handleRemove(actionsIndex);
            },
          },
        ]}
      />

      <FormProvider {...formAdd}>
        {formVisible && (
          <TemplateFixoEquipeForm
            visible={formVisible}
            onClose={() => setFormVisible(false)}
            onConfirm={handleConfirm}
            voluntarioList={voluntariosDropDownList}
            funcoesList={funcoesDropDownList}
          />
        )}
      </FormProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    opacity: 0.7,
  },
  addButton: {
    minHeight: 25,
    height: 25,
    minWidth: 25,
    width: 25,
  },
  listContent: {
    gap: 8,
  },
});
