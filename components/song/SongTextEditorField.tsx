import { StyleSheet, View } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import FancyTextInput from '../fields/FancyTextInput';
import { FancyAlert } from '../modal/FancyAlert';

type Props = {
  label?: string;
  value?: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function SongTextEditorField({ label, value = '', placeholder, onChange, disabled }: Props) {
  const handleClear = () => {
    if (!value?.trim()) return;
    const contentLabel = label ? label.toLowerCase() : 'este conteúdo';
    FancyAlert.alert('Limpar conteúdo', `Deseja apagar todo o conteúdo de ${contentLabel}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => onChange('') },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FancyTextInput
          placeholder={placeholder}
          value={value}
          readonly={disabled}
          containerStyle={styles.editorField}
          inputContainerStyle={styles.editorInputContainer}
          inputProps={{
            onChangeText: onChange,
            multiline: true,
            style: styles.editorInput,
          }}
        />
        <View style={styles.footer}>
          <FancyButton
            label='Limpar tudo'
            type='text'
            size={28}
            disabled={disabled || !value?.trim()}
            labelProps={{ size: 'extraSmall' }}
            containerStyle={styles.clearAction}
            onPress={handleClear}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 14, paddingTop: 8, paddingBottom: 8 },
  content: { flex: 1, gap: 12 },
  editorField: { flex: 1 },
  editorInputContainer: { flex: 1, alignItems: 'flex-start' },
  editorInput: {
    minHeight: 360,
    height: '100%',
    paddingTop: 8,
    paddingBottom: 18,
  },
  footer: { alignItems: 'flex-end', paddingRight: 2 },
  clearAction: { minWidth: 0, paddingHorizontal: 0 },
});
