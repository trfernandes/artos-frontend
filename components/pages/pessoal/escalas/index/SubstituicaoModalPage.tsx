import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { useCallback, useMemo, useState } from 'react';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import FancyGroup from '../../../../list/FancyGroup';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import { format } from 'date-fns';
import { EscalaResultado } from '../../../../../domain/models/EscalaResultado';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledDropDown from '../../../../forms/ControlledDropDown';
import ControlledTextArea from '../../../../forms/ControlledTextArea';

const schema = z.object({
  substitutoId: z.string('Campo obrigatório'),
  motivo: z.string('Campo obrigatório').min(5, 'O motivo deve ter ao menos 10 caracteres'),
});

export type FormData = z.infer<typeof schema>;

export default function SubstituicaoModalPage({ data, ...props }: { data: EscalaResultado } & FancyModalDialogProps<FormData>) {
  const initialParams: DynamicQuery = {
    where: {
      conditions: [
        {
          path: 'ministerio.id',
          operator: Operator.EQUALS,
          value: { type: ValueType.LITERAL, value: data.voluntario?.ministerio?.id! },
        },
      ],
    },
    relations: ['funcoes', 'voluntario'],
  };

  const { data: possiveisSubstitutos, isLoading } = useMinisterioVoluntariosCrud({ initialParams });

  const possiveisSubstitutosList = useMemo<DropDownItemProps<string>[]>(() => {
    return possiveisSubstitutos
      .map(
        minVoluntario =>
          ({
            title: minVoluntario.voluntario?.nome,
            left: {
              type: 'image',
              source: minVoluntario.voluntario?.foto || require('../../../../../assets/images/empty_profile_image.png'),
            },
            value: minVoluntario.id,
          } as DropDownItemProps<string>)
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
  }, [possiveisSubstitutos]);

  const [substitutoSelecionado, setSubstitutoSelecionado] = useState<string | undefined>();

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { motivo: undefined, substitutoId: undefined } });

  const handleConfirm = useCallback(
    async (data: FormData) => {
      console.log('handleConfirm');
      form.handleSubmit(async () => {
        console.log('Validado');
        props.OnButton2Press?.(data);
      })();
    },
    [form.handleSubmit, props.OnButton2Press, substitutoSelecionado]
  );

  return (
    <FancyModalDialog<FormData>
      {...props}
      title="Solicitar substituição:"
      centerContainerStyle={{ gap: 16 }}
      button1={{ disabled: isLoading || undefined, textProps: { adjustsFontSizeToFit: false } }}
      button2={{ disabled: isLoading || undefined, textProps: { adjustsFontSizeToFit: false } }}
      OnButton2Press={() => handleConfirm(form.getValues())}
    >
      <FancyGroup title="Informações" contentContainerStyle={{ gap: 8 }}>
        <FancyTextDisplay title="Ministério:" value={data.voluntario?.ministerio?.nome} />
        <FancyTextDisplay title="Evento:" value={data.evento?.nome} />
        <FancyTextDisplay title="Data e Hora:" value={format(data.dataOcorrencia, 'dd/MM/yyyy - HH:mm')} />
        <FancyTextDisplay title="Função:" value={data.funcao?.nome} />
      </FancyGroup>
      <ControlledDropDown
        control={form.control}
        name="substitutoId"
        showSelectedImage
        label={'Selecione um substituto:'}
        listItems={possiveisSubstitutosList}
        onChange={setSubstitutoSelecionado}
        isLoading={isLoading}
      />
      <ControlledTextArea control={form.control} name="motivo" label="Motivo" />
    </FancyModalDialog>
  );
}
