import { useFormContext } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { addMonths } from 'date-fns';
import { EscalaFormData } from '../../../../../domain/schemas/escalaSchema';
import ControlledDateInput from '../../../../forms/ControlledDateInput';
import ControlledTextInput from '../../../../forms/ControlledTextInput';
import { usePallete } from '../../../../../hooks/usePallete';

type AssistenteParametrosStepProps = {
  isCheckingName?: boolean;
  onNomeBlur?: (nome: string) => void | Promise<void>;
};

export default function AssistenteParametrosStep({
  isCheckingName = false,
  onNomeBlur,
}: AssistenteParametrosStepProps) {
  const palette = usePallete();
  const form = useFormContext<EscalaFormData>();
  const nome = form.watch('nome');
  const dataInicio = form.watch('dataInicio');
  const prevDataInicioRef = useRef<number | null>(
    dataInicio ? new Date(dataInicio).getTime() : null,
  );

  useEffect(() => {
    if (!dataInicio) return;
    const inicio = new Date(dataInicio);
    const ts = inicio.getTime();
    if (isNaN(ts)) return;
    if (ts !== prevDataInicioRef.current) {
      prevDataInicioRef.current = ts;
      form.setValue('dataTermino', addMonths(inicio, 1));
    }
  }, [dataInicio]);

  return (
    <View style={styles.container}>
      <ControlledTextInput
        control={form.control}
        name='nome'
        label='Como quer chamar essa escala?'
        inputProps={{
          onBlur: () => onNomeBlur?.(nome || ''),
        }}
        rightContainer={
          isCheckingName ? (
            <ActivityIndicator size='small' color={palette.primary} style={{ marginRight: 10 }} />
          ) : null
        }
      />
      <ControlledDateInput control={form.control} name='dataInicio' label='Data de Início' />
      <ControlledDateInput control={form.control} name='dataTermino' label='Data de Término' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
});
