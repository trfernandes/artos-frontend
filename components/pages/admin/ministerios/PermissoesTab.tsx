import { StyleSheet, View } from 'react-native';
import FancyDropDown from '../../../fields/FancyDropDown';
import { PEOPLE_DATA } from '../eventos/EventosEscalaEquipe';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import z from 'zod';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { MinisterioFormData } from '../../../../app/(app)/(drawer)/admin/ministerios/add';
import PermissoesManager from './PermissoesManager';
import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../../../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';
import { useMemo } from 'react';
import { ResponseMinisterioVoluntarioPermissaoDto } from '../../../../domain/dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.response';

export const permissoesSchema = z.object({
  id: z.uuidv4('O Id do voluntário deve ser válido').optional(),
  ministerioVoluntarioId: z.uuidv4('Campo Obrigatório'),
  recurso: z.enum(RecursoPermissaoEnum, { message: 'Campo obrigatório' }),
  permissoes: z.array(z.enum(TipoPermissaoEnum, { message: 'Campo obrigatório' })),
});

export type PermissoesFormData = z.infer<typeof permissoesSchema>;

export default function PermissoesTab() {
  const ministerioForm = useFormContext<MinisterioFormData>();

  const permissoesFieldArray = useFieldArray({
    control: ministerioForm.control,
    name: 'permissoes',
    keyName: 'fieldId',
  });

  const permissoesData = useMemo<ResponseMinisterioVoluntarioPermissaoDto[]>(() => {
    return permissoesFieldArray.fields.map(
      (field) =>
        ({
          id: field.id,
          ministerioVoluntarioId: field.ministerioVoluntarioId,
          recurso: field.recurso,
          permissoes: field.permissoes,
        }) as ResponseMinisterioVoluntarioPermissaoDto,
    );
  }, [permissoesFieldArray.fields]);

  return (
    <View style={styles.container}>
      <FancyDropDown
        label='Líder'
        listItems={PEOPLE_DATA.map(
          (value, index) =>
            ({
              title: value.nome,
              value: index.toString(),
            }) as DropDownItemProps<string>,
        )}
      />
      <PermissoesManager disabled={false} data={permissoesData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 15 },
});
