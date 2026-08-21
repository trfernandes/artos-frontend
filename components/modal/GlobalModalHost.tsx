// components/modal/GlobalModalHost.tsx
//
// RN (facebook/react-native#17357, #48611) não apresenta de forma confiável
// um <Modal> irmão (não aninhado) de outro <Modal> já presentado no iOS —
// UIKit resolve "qual view controller está no topo" de forma inconsistente
// quando há múltiplas instâncias de <Modal> montadas paralelamente na árvore.
// Sem fix oficial. Solução: UM único <Modal> nativo pro app inteiro, montado
// aqui, com "nesting" resolvido em JS (empilhamento de Views), nunca via
// apresentação nativa concorrente. Cada componente (FancyAlert,
// FancyBottomSheetModal, FancyModal, FancySearchSelect) empilha/desempilha
// seu conteúdo aqui em vez de renderizar seu próprio <Modal>.
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { usePallete } from '../../hooks/usePallete';
import { createToastConfig } from '../../utils/toast_config';

type StackEntry = {
  id: string;
  node: React.ReactNode;
  onRequestClose?: () => void;
};

let entries: StackEntry[] = [];
let listeners: Array<(next: StackEntry[]) => void> = [];

function notify() {
  listeners.forEach((listener) => listener(entries));
}

export const ModalStack = {
  push(id: string, node: React.ReactNode, onRequestClose?: () => void) {
    entries = [...entries.filter((entry) => entry.id !== id), { id, node, onRequestClose }];
    notify();
  },
  update(id: string, node: React.ReactNode, onRequestClose?: () => void) {
    if (!entries.some((entry) => entry.id === id)) return;
    entries = entries.map((entry) =>
      entry.id === id ? { ...entry, node, onRequestClose: onRequestClose ?? entry.onRequestClose } : entry,
    );
    notify();
  },
  pop(id: string) {
    if (!entries.some((entry) => entry.id === id)) return;
    entries = entries.filter((entry) => entry.id !== id);
    notify();
  },
};

export function GlobalModalHost() {
  const [stack, setStack] = useState<StackEntry[]>(entries);
  const palette = usePallete();
  const toastConfig = useMemo(() => createToastConfig(palette), [palette]);

  useEffect(() => {
    listeners.push(setStack);
    return () => {
      listeners = listeners.filter((listener) => listener !== setStack);
    };
  }, []);

  const visible = stack.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={() => {
        const top = stack[stack.length - 1];
        top?.onRequestClose?.();
      }}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
        {stack.map((entry, index) => (
          <View
            key={entry.id}
            style={[StyleSheet.absoluteFill, { zIndex: index + 1, elevation: index + 1 }]}
            pointerEvents='box-none'
          >
            {entry.node}
          </View>
        ))}
        {visible && <Toast config={toastConfig} position='bottom' visibilityTime={4000} />}
      </View>
    </Modal>
  );
}
