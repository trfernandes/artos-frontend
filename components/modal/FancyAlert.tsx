// components/overlays/FancyAlert.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';

type Button = {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'destructive' | 'default';
};

type AlertContextType = {
  show: (title: string, message?: string, buttons?: Button[]) => void;
};

const AlertCtx = createContext<AlertContextType | null>(null);

export function FancyAlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<Button[]>([]);

  const show = (t: string, m?: string, b?: Button[]) => {
    setTitle(t);
    setMessage(m || '');
    setButtons(b || [{ text: 'OK' }]);
    setVisible(true);
  };

  const close = (btn?: Button) => {
    setVisible(false);
    btn?.onPress?.();
  };

  return (
    <AlertCtx.Provider value={{ show }}>
      {children}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View>
              {title ? (
                <FancyText type="bold" size="large" style={styles.title}>
                  {title}
                </FancyText>
              ) : null}
              {message ? (
                <FancyText type="medium" size="medium" style={styles.message}>
                  {message}
                </FancyText>
              ) : null}
            </View>

            <View style={styles.row}>
              {buttons.map((btn, i) => (
                <FancyButton
                  key={i}
                  label={btn.text}
                  onPress={() => close(btn)}
                  containerStyle={[styles.button, btn.style === 'destructive' ? { backgroundColor: Pallete.error } : {}]}
                  type={btn.style === 'default' ? 'outlined' : 'contained'}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertCtx.Provider>
  );
}

// 🔗 hook opcional (não é usado na API estática, mas fica disponível se quiser)
export function useFancyAlert() {
  const ctx = useContext(AlertCtx);
  if (!ctx) throw new Error('useFancyAlert deve estar dentro do FancyAlertProvider');
  return ctx;
}

// API estática igual ao Alert
export const FancyAlert = {
  alert(title: string, message?: string, buttons?: Button[]) {
    globalShow?.(title, message, buttons);
  },
};

let globalShow: AlertContextType['show'] | null = null;

// Conector invisível para expor o show globalmente
export function FancyAlertConnector() {
  const { show } = useFancyAlert();
  globalShow = show;
  return null;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  title: { marginBottom: 10 },
  message: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: { borderRadius: 8, flex: 1, height: 40 },
  btnText: { color: 'white' },
});
