import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import FancyText from '../FancyText';

type GlobalErrorBoundaryProps = {
  children: React.ReactNode;
};

type GlobalErrorBoundaryState = {
  error: Error | null;
};

export class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary] render crash', error, errorInfo);
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <FancyText size='largeMedium' type='bold'>
            O app encontrou um erro nesta tela
          </FancyText>
          <FancyText size='small' type='medium' style={styles.subtitle}>
            A exceção foi capturada antes de derrubar toda a navegação. Se continuar acontecendo, use o logcat para ver a stack nativa.
          </FancyText>
          <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorBoxContent}>
            <FancyText size='extraSmall' type='semiBold'>
              {this.state.error.name || 'Error'}
            </FancyText>
            <FancyText size='extraSmall' type='medium'>
              {this.state.error.message || 'Erro sem mensagem'}
            </FancyText>
            {this.state.error.stack ? (
              <FancyText size='extraSmall' type='medium'>
                {this.state.error.stack}
              </FancyText>
            ) : null}
          </ScrollView>
          <Pressable onPress={this.handleRetry} style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <FancyText size='small' type='bold' color='white'>
              Tentar novamente
            </FancyText>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  subtitle: {
    lineHeight: 18,
    opacity: 0.85,
  },
  errorBox: {
    maxHeight: 260,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  errorBoxContent: {
    gap: 8,
    padding: 12,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
