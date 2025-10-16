import FancyModalDialog from '../../../modal/FancyModalDialog';
import { UseFormReturn } from 'react-hook-form';
import { HierarquiaEnum, HierarquiaEnumLabel, HierarquiaEnumMap } from '../../../../domain/models/MinisterioVoluntario';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { BaseLiderancaFormData } from './LiderancaTab';
import { ZodObject } from 'zod';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { ImageUtils } from '../../../../utils/image_utils';

interface LiderFormModalProps<Schema extends ZodObject> {
  onClose: () => void;
  form: UseFormReturn<BaseLiderancaFormData>;
  initialValues: BaseLiderancaFormData;
  onSave: (data: BaseLiderancaFormData) => void;
  voluntarioList?: { title: string; value: string; foto?: string }[];
  mode: 'add' | 'edit';
}

export default function LiderancaFormModal<Schema extends ZodObject>({
  onClose,
  form,
  voluntarioList,
  onSave,
  mode,
}: LiderFormModalProps<Schema>) {
  const handleSubmit = () => {
    form.handleSubmit(async data => {
      onSave(data);
    })();
  };

  return (
    <FancyModalDialog
      centerContainerStyle={{ gap: 15 }}
      modalProps={{ visible: true }}
      title={mode === 'edit' ? 'Editar Lider' : 'Novo Lider'}
      onClose={onClose}
      onConfirm={handleSubmit}
    >
      <ControlledDropDown
        control={form.control}
        name="voluntarioId"
        label="Voluntario"
        disabled={mode === 'edit'}
        listItems={
          voluntarioList?.map(
            item =>
              ({
                title: item.title,
                value: item.value,
                left: {
                  type: 'image',
                  source: item.foto ? ImageUtils.rawToDataUri(item.foto) ?? item.foto : undefined,
                },
              } as DropDownItemProps<string>)
          ) || []
        }
        onChange={async value => {
          form.setValue('voluntarioId', value);
          form.setValue('voluntarioNome', voluntarioList!.find(item => item.value === value)!.title);
          form.setValue('foto', voluntarioList!.find(item => item.value === value)?.foto);
          await form.trigger('voluntarioId');
        }}
      />
      <ControlledDropDown
        control={form.control}
        name="hierarquia"
        label="Funcao"
        listItems={[
          { title: HierarquiaEnumLabel[HierarquiaEnum.Lider], value: HierarquiaEnum.Lider },
          { title: HierarquiaEnumLabel[HierarquiaEnum.Auxiliar], value: HierarquiaEnum.Auxiliar },
        ]}
        onChange={async value => {
          form.setValue('hierarquia', HierarquiaEnumMap[+value]);
          await form.trigger('hierarquia');
        }}
      />
    </FancyModalDialog>
  );
}
