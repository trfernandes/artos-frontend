import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { useCallback, useMemo, useState } from 'react';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import FancyGroup from '../../../../list/FancyGroup';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import { format } from 'date-fns';
import { EscalaItemModel } from '../../../../../domain/models/EscalaItem';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledDropDown from '../../../../forms/ControlledDropDown';
import ControlledTextArea from '../../../../forms/ControlledTextArea';
import { useAuth } from '../../../../../contexts/AuthContext';

const schema = z.object({
  eventoId: z.string(),
  solicitanteId: z.string(),
  substitutoId: z.string('Campo obrigatório'),
  escalaItemId: z.string('Campo obrigatório'),
  motivo: z.string('Campo obrigatório').min(5, 'O motivo deve ter ao menos 10 caracteres'),
});

export type FormData = z.infer<typeof schema>;

export default function SubstituicaoModalPage({
  dadosEscala,
  ...props
}: { dadosEscala: EscalaItemModel } & FancyModalDialogProps<FormData>) {
  const { user } = useAuth();

  const initialParams: DynamicQuery = {
    where: {
      conditions: [
        {
          path: 'ministerio.id',
          operator: Operator.EQUALS,
          value: {
            type: ValueType.LITERAL,
            value: dadosEscala.voluntario?.ministerio?.id! || dadosEscala.voluntario?.ministerioId!,
          },
        },
        {
          path: 'voluntario.id',
          operator: Operator.NOT_EQUALS,
          value: { type: ValueType.LITERAL, value: user?.id! },
        },
      ],
    },
    relations: ['funcoes', 'voluntario'],
  };

  const { data: possiveisSubstitutos, isLoading } = useMinisterioVoluntariosCrud({ initialParams, autoFetch: true });

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

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      escalaItemId: dadosEscala.id,
      eventoId: dadosEscala.evento?.id,
      solicitanteId: dadosEscala.voluntario?.id,
      motivo: undefined,
      substitutoId: undefined,
    },
  });

  const handleConfirm = useCallback(
    async (data: FormData) => {
      form.handleSubmit(
        async () => {
          props.onButton2Press?.(data);
        },
        errors => console.log('Erro ao validar formulário de substituição', errors)
      )();
    },
    [form.handleSubmit, props.onButton2Press, substitutoSelecionado]
  );

  return (
    <FancyModalDialog<FormData>
      {...props}
      title="Solicitar substituição:"
      centerContainerStyle={{ gap: 16 }}
      button1={{ disabled: isLoading || undefined, textProps: { adjustsFontSizeToFit: false } }}
      button2={{ disabled: isLoading || undefined, textProps: { adjustsFontSizeToFit: false } }}
      onButton2Press={() => handleConfirm(form.getValues())}
    >
      <FancyGroup title="Informações" contentContainerStyle={{ gap: 8 }}>
        <FancyTextDisplay title="Ministério:" value={dadosEscala.voluntario?.ministerio?.nome} />
        <FancyTextDisplay title="Evento:" value={dadosEscala.evento?.nome} />
        <FancyTextDisplay title="Data e Hora:" value={format(dadosEscala.dataOcorrencia, 'dd/MM/yyyy - HH:mm')} />
        <FancyTextDisplay title="Função:" value={dadosEscala.funcao?.nome} />
      </FancyGroup>
      <ControlledDropDown
        control={form.control}
        name="substitutoId"
        label={'Quem será seu substituto?'}
        listItems={possiveisSubstitutosList}
        onChange={setSubstitutoSelecionado}
        disabled={isLoading}
        isLoading={isLoading}
      />
      <ControlledTextArea control={form.control} name="motivo" label="Qual o motivo da substituição?" />
    </FancyModalDialog>
  );
}
