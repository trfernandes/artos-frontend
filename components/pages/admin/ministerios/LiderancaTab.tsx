import { View, StyleSheet, Alert } from 'react-native';
import FancyFab from '../../../buttons/FancyFab';
import { useState } from 'react';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import FancyList from '../../../list/FancyList';
import { Pallete } from '../../../../constants/colors';
import { ImageUtils } from '../../../../utils/image_utils';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { FancyActionButtons } from '../../../cards/Horizontal/FancyCardActionButtons';
import { HierarquiaEnum, HierarquiaEnumLabel } from '../../../../domain/models/MinisterioVoluntario';
import { MinisterioFormData, MinisterioLiderancaFormData } from '../../../../app/(app)/(drawer)/admin/ministerios/add';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { VoluntariosRepository } from '../../../../domain/services/VoluntariosRepository';
import LiderancaFormModal from './LiderancaFormModal';
import FancyLoading from '../../../FancyLoading';
import FancyScreenErrorHandler from '../../../error/FancyScreenErrorHandler';
import FancyListEmpty from '../../../list/FancyListEmpty';
import z, { ZodObject } from 'zod';

export const baseLiderSchema = z.object({
  id: z.uuidv4('O Id do voluntário deve ser válido').optional(),
  voluntarioId: z.uuidv4('Campo Obrigatório'),
  voluntarioNome: z.string().min(1, { message: 'Campo obrigatório' }),
  hierarquia: z.enum(HierarquiaEnum, { message: 'Campo obrigatório' }),
  foto: z.string().nullable().optional(),
});

export type BaseLiderancaFormData = z.infer<typeof baseLiderSchema>;

export default function LiderancaTab(props: {
  options: { mode: 'add' } | { mode: 'edit'; id: string };
  onAddLider?: (data: MinisterioLiderancaFormData) => void;
  onEditLider?: (data: MinisterioLiderancaFormData) => void;
  onDeleteLider?: (id: string) => void;
  validationSchema: ZodObject;
}) {
  const ministerioForm = useFormContext<MinisterioFormData>();

  const { append, remove, fields, update } = useFieldArray({
    control: ministerioForm.control,
    name: 'voluntarios',
    keyName: 'fieldId',
  });

  const [formOptions, setFormOptions] = useState<{
    show: boolean;
    params?: { mode: 'add' } | { mode: 'edit'; id: string };
  }>({
    show: false,
  });

  const liderForm = useForm<BaseLiderancaFormData>({
    resolver: zodResolver(props.validationSchema as any),
  });

  const handleSubmit = async (data: MinisterioLiderancaFormData) => {
    const lider = {
      id: data.id,
      voluntarioId: data.voluntarioId,
      voluntarioNome: data.voluntarioNome,
      hierarquia: data.hierarquia,
      foto: data.foto,
    };

    if (formOptions.params?.mode === 'add') {
      append(lider);

      const isValid = await ministerioForm.trigger('voluntarios');

      if (isValid) {
        liderForm.reset();
        props.onAddLider?.(data);
        setFormOptions(prev => ({ ...prev, show: false }));
      } else {
        const locatedIndex = fields.findIndex(
          f =>
            f.id === lider.id &&
            f.voluntarioId === lider.voluntarioId &&
            f.voluntarioNome === lider.voluntarioNome &&
            f.hierarquia === lider.hierarquia
        );
        remove(locatedIndex);
        const errors = ministerioForm.formState.errors.voluntarios;
        if (errors) {
          liderForm.setError('voluntarioId', errors!);
        }
      }
    } else {
      const liderIndex = fields.findIndex(lider => lider.voluntarioId === data.voluntarioId);
      update(liderIndex, lider);
      liderForm.reset();
      props.onEditLider?.(data);
      setFormOptions(prev => ({ ...prev, show: false }));
    }
  };

  const voluntariosQuery = useQuery({
    queryKey: ['voluntarios'],
    queryFn: async () => VoluntariosRepository.getAll(),
    retry: false,
  });

  if (voluntariosQuery.isError) {
    return <FancyScreenErrorHandler error={voluntariosQuery.error} onTryAgrainPress={voluntariosQuery.refetch} />;
  }

  if (voluntariosQuery.isLoading) {
    return <FancyLoading />;
  }

  const getVoluntarioList = (): { title: string; value: string; foto?: string }[] | undefined => {
    return voluntariosQuery?.data
      ?.filter(item => typeof item.id === 'string')
      .map(item => ({
        title: item.nome,
        value: item.id!,
        foto: item.foto ? ImageUtils.rawToDataUri(item.foto) ?? item.foto : undefined,
      }));
  };

  return (
    <View style={styles.container}>
      {ministerioForm.getValues('voluntarios')?.sort((a, b) => a.voluntarioNome.localeCompare(b.voluntarioNome)).length > 0 ? (
        <FancyList
          data={fields.sort((a, b) => a.voluntarioNome.localeCompare(b.voluntarioNome))}
          style={styles.containerList}
          contentContainerStyle={styles.contentList}
          renderItem={({ item, index }) => {
            const commonProps = {
              source:
                item.foto
                  ? ImageUtils.rawToDataUri(item.foto) ?? item.foto
                  : require('../../../../assets/images/empty_profile_image.png'),
              title: item.voluntarioNome,
              subtitle: HierarquiaEnumLabel[item.hierarquia],
              actionButtons: (
                <FancyActionButtons
                  actions={[
                    {
                      icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                      onPress: () => {
                        liderForm.setValue('id', item.id!);
                        liderForm.setValue('voluntarioId', item.voluntarioId);
                        liderForm.setValue('voluntarioNome', item.voluntarioNome);
                        liderForm.setValue('hierarquia', item.hierarquia);
                        setFormOptions({ params: { mode: 'edit', id: item.id! }, show: true });
                      },
                    },
                    {
                      icon: {
                        library: 'MaterialIcons',
                        name: 'delete',
                        size: 18,
                        backgroundColor: Pallete.error,
                      },
                      onPress: () => {
                        if (ministerioForm.getValues('voluntarios').length > 1) {
                          Alert.alert('Exclusão de líder', `Tem certeza que deseja remover o líder "${item.voluntarioNome}?"`, [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Remover',
                              style: 'destructive',
                              onPress: () => {
                                remove(index);
                                props.onDeleteLider?.(item.id!);
                              },
                            },
                          ]);
                        } else {
                          Alert.alert('Exclusão de Líder', 'É necessário ter pelo menos um líder, a exclusão será cancelada!');
                        }
                      },
                    },
                  ]}
                />
              ),
            };
            return <FancyCard.Image key={item.fieldId} type={'image'} props={commonProps} />;
          }}
        />
      ) : (
        <FancyListEmpty />
      )}

      {formOptions.show && (
        <LiderancaFormModal
          form={liderForm}
          initialValues={liderForm.getValues()}
          onClose={() => {
            liderForm.reset();
            setFormOptions(prev => ({ ...prev, show: false }));
          }}
          voluntarioList={getVoluntarioList()}
          onSave={handleSubmit}
          mode={formOptions.params?.mode || 'add'}
        />
      )}
      <FancyFab
        onPress={() => {
          liderForm.reset();
          setFormOptions(prev => ({ ...prev, show: true, params: { mode: 'add' } }));
        }}
        right={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerList: { height: '100%' },
  contentList: { gap: 10 },
});



