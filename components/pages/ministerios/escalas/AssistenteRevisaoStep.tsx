import { useFormContext } from 'react-hook-form';
import { View } from 'react-native';
import { EscalaFormData } from '../../../../domain/schemas/escalaSchema';
import { strfyObj } from '../../../../utils/text_utils';

export default function AssistenteRevisaoStep() {
  const form = useFormContext<EscalaFormData>();

  console.log(
    `\n\nFORM\nPARAMETROS:${strfyObj({
      dataInicio: form.getValues('dataInicio'),
      dataTermino: form.getValues('dataTermino'),
    })}\nEVENTOS:\n${strfyObj(form.getValues('eventos').filter(e => e.selected))}\nPARTICIPANTES:${strfyObj(
      form.getValues('participantes').filter(p => p.selected)
    )}`
  );

  return <View></View>;
}
