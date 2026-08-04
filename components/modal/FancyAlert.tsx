// components/overlays/FancyAlert.tsx
import React, { createContext, useContext, useState, ReactNode, isValidElement } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';

type Button = {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'destructive' | 'default';
};

type AlertContextType = {
  show: (
    title: string | React.ReactNode,
    message?: string | React.ReactNode,
    buttons?: Button[],
  ) => void;
};

const AlertCtx = createContext<AlertContextType | null>(null);

export function FancyAlertProvider({ children }: { children: ReactNode }) {
  const palette = usePallete();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | React.ReactNode>();
  const [message, setMessage] = useState<string | React.ReactNode>('');
  const [buttons, setButtons] = useState<Button[]>([]);

  const show = (t: string | React.ReactNode, m?: string | React.ReactNode, b?: Button[]) => {
    setTitle(t);
    setMessage(m || '');
    setButtons(b || [{ text: 'OK' }]);
    setVisible(true);
  };

  const close = (btn?: Button) => {
    setVisible(false);
    btn?.onPress?.();
  };

  const shouldStackButtons = buttons.length > 2;

  return (
    <AlertCtx.Provider value={{ show }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType='fade'
        presentationStyle='overFullScreen'
        onRequestClose={() => setVisible(false)}
      >
        <View style={[styles.backdrop, { backgroundColor: palette.overlays.backdrop }]}>
          <View style={[styles.card, { backgroundColor: palette.backgroundColor }]}>
            <View>
              {title ? (
                isValidElement(title) ? (
                  title
                ) : (
                  <FancyText type='bold' size='large' style={styles.title}>
                    {title}
                  </FancyText>
                )
              ) : null}
              {message ? (
                isValidElement(message) ? (
                  message
                ) : (
                  <FancyText type='medium' size='medium' style={styles.message}>
                    {message}
                  </FancyText>
                )
              ) : null}
            </View>

            <View style={[styles.row, shouldStackButtons && styles.rowStacked]}>
              {buttons.map((btn, i) => (
                <FancyButton
                  key={i}
                  label={btn.text}
                  onPress={() => close(btn)}
                  textProps={{
                    adjustsFontSizeToFit: !shouldStackButtons,
                    numberOfLines: shouldStackButtons ? 2 : 1,
                  }}
                  containerStyle={[
                    styles.button,
                    shouldStackButtons && styles.buttonStacked,
                    btn.style === 'destructive' ? { backgroundColor: palette.error } : {},
                  ]}
                  type={btn.style === 'cancel' ? 'text' : btn.style === 'default' ? 'outlined' : 'contained'}
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

export const FancyAlert = {
  alert(title: string | React.ReactNode, message?: string | React.ReactNode, buttons?: Button[]) {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'transparent',
    padding: 22,
    width: '84%',
    borderRadius: 16,
  },
  title: { marginBottom: 10 },
  message: { marginBottom: 20, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  rowStacked: { flexDirection: 'column' },
  button: { flex: 1, height: 44 },
  buttonStacked: { flex: 0, width: '100%', minHeight: 44, height: 44 },
  btnText: { color: 'white' },
});
