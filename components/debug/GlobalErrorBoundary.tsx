import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';

type GlobalErrorBoundaryProps = {
  children: React.ReactNode;
};

type GlobalErrorBoundaryState = {
  error: Error | null;
};

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
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
          <Text style={styles.title}>O app encontrou um erro nesta tela</Text>
          <Text style={styles.subtitle}>
            A exceção foi capturada antes de derrubar toda a navegação. Se continuar acontecendo,
            use o logcat para ver a stack nativa.
          </Text>
          <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorBoxContent}>
            <Text style={styles.errorName}>{this.state.error.name || 'Error'}</Text>
            <Text style={styles.errorMessage}>
              {this.state.error.message || 'Erro sem mensagem'}
            </Text>
            {this.state.error.stack ? (
              <Text style={styles.errorStack}>{this.state.error.stack}</Text>
            ) : null}
          </ScrollView>
          <Pressable
            onPress={this.handleRetry}
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.buttonText}>Tentar novamente</Text>
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
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#374151',
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
  errorName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111827',
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  errorStack: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#374151',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
