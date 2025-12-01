import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Pallete } from '../constants/colors';
import FancyText from '../components/FancyText';

type LoadingContextProps = {
  showLoading: (label?: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextProps>({
  showLoading: () => {},
  hideLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('Carregando...');

  const showLoading = useCallback((text?: string) => {
    setLabel(text ?? 'Carregando...');
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}

      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.box}>
            <ActivityIndicator size="large" color={Pallete.primary} />
            <FancyText size={'medium'} type="semiBold" color={Pallete.fonts.inactive}>
              {label}
            </FancyText>
          </View>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 6,
    gap: 20,
  },
  label: {
    marginTop: 12,
    color: Pallete.fonts.dark,
    fontWeight: '600',
    fontSize: 15,
  },
});
