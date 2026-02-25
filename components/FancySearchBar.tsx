import { View, StyleSheet, StyleProp, ViewStyle, ActivityIndicator, TouchableOpacity } from 'react-native';
import FancyTextInput from './fields/FancyTextInput';
import DefaultIcons from './FancyIcons';
import { useEffect, useRef, useState } from 'react';
import { DefaultIconsNames } from '../constants/icons';
import { usePallete } from '../hooks/usePallete';

export type FancySearchBarProps = {
  value?: string; // 🔥 novo
  onSearch?: (text: string) => void;
  onOptionsButtonPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancySearchBar(props: FancySearchBarProps) {
  const Pallete = usePallete();
  const [internalValue, setInternalValue] = useState(props.value ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(internalValue);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEmittedInitialEmpty, setHasEmittedInitialEmpty] = useState(false);
  const onSearchRef = useRef<FancySearchBarProps['onSearch']>(props.onSearch);
  const hadNonEmptySearchRef = useRef(false);

  useEffect(() => {
    onSearchRef.current = props.onSearch;
  }, [props.onSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setIsLoading(false);
      setDebouncedSearch(internalValue);
    }, 800);

    return () => {
      clearTimeout(handler);
      setIsLoading(true);
    };
  }, [internalValue]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();

    // Ignora apenas o primeiro disparo vazio (estado inicial) para nao refazer a busca ao montar
    if (!hasEmittedInitialEmpty && trimmed.length === 0) {
      setHasEmittedInitialEmpty(true);
      return;
    }

    // Se ainda nao houve busca com valor preenchido, evita disparar vazio na montagem
    if (trimmed.length === 0 && !hadNonEmptySearchRef.current) {
      return;
    }

    onSearchRef.current?.(trimmed); // 🔥 agora passa o valor debounced correto
    if (trimmed.length > 0) hadNonEmptySearchRef.current = true;
    if (!hasEmittedInitialEmpty) setHasEmittedInitialEmpty(true);
  }, [debouncedSearch, hasEmittedInitialEmpty]);

  // 🔥 sincroniza quando valor externo mudar
  useEffect(() => {
    if (props.value !== undefined && props.value !== internalValue) {
      setInternalValue(props.value);
    }
  }, [props.value]);

  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={styles.inputContainer}>
        <FancyTextInput
          placeholder='Digite aqui para pesquisar....'
          inputProps={{
            onChangeText: setInternalValue,
            style: {
              paddingVertical: 0,
              textAlignVertical: 'center',
            },
          }}
          value={internalValue} // 🔥 agora usa controlado
          leftContainer={
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <DefaultIcons.Custom library='Feather' name='search' size={20} color={Pallete.icons.inactive} key='left' />
            </View>
          }
          rightContainer={
            isLoading ? (
              <View style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 10 }}>
                <ActivityIndicator size={'small'} />
              </View>
            ) : (
              <TouchableOpacity
                style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 8 }}
                onPress={() => setInternalValue('')}
              >
                <DefaultIcons.Custom {...DefaultIconsNames.cancel} size={22} color={Pallete.icons.inactive} key='right' />
              </TouchableOpacity>
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, borderWidth: 0, borderColor: 'gold' },
  inputContainer: { flex: 1, borderWidth: 0, borderColor: 'gold' },
  buttonContainer: {},
  button: { borderRadius: 100, width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
});
