import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';
import FancyText from '../components/FancyText';
import { usePallete } from '../hooks/usePallete';

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
  const palette = usePallete();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('Carregando...');

  const showLoading = useCallback((text?: string) => {
    setLabel(text ?? 'Carregando...');
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    setVisible(false);
  }, []);

  const contextValue = useMemo(() => ({ showLoading, hideLoading }), [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}

      <Modal visible={visible} transparent animationType='fade' statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={[styles.box, { backgroundColor: palette.backgroundColor }]}>
            <ActivityIndicator size='large' color={palette.primary} />
            <FancyText size={'medium'} type='semiBold' color={palette.fonts.inactive}>
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
});
