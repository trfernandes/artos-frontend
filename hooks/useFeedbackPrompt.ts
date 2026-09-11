import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { feedbacksApi } from '../domain/api/FeedbacksApi';

const FEEDBACK_PROMPT_KEY = 'feedback_prompt_state';

interface FeedbackPromptState {
  igrejaId: string;
  lastShownAt: number;
  dismissedCount: number;
}

export function useFeedbackPrompt(igrejaId: string | null, userCreatedAtDaysAgo: number = 0) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedNota, setSelectedNota] = useState<'RUIM' | 'BOM' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPrompt = async () => {
      try {
        if (!igrejaId) {
          setShowPrompt(false);
          setIsLoading(false);
          return;
        }

        // Só mostra prompt se o usuário tem 15+ dias de uso
        if (userCreatedAtDaysAgo < 15) {
          setShowPrompt(false);
          setIsLoading(false);
          return;
        }

        const stored = await AsyncStorage.getItem(FEEDBACK_PROMPT_KEY);
        const state = stored ? (JSON.parse(stored) as FeedbackPromptState) : null;

        // Se nunca foi mostrado ou passaram 7 dias desde a última vez
        const shouldShow =
          !state ||
          state.igrejaId !== igrejaId ||
          Date.now() - state.lastShownAt > 7 * 24 * 60 * 60 * 1000;

        setShowPrompt(shouldShow);
      } catch (error) {
        console.error('Error checking feedback prompt:', error);
        setShowPrompt(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPrompt();
  }, [igrejaId, userCreatedAtDaysAgo]);

  const handlePromptShown = async () => {
    try {
      const state: FeedbackPromptState = {
        igrejaId: igrejaId!,
        lastShownAt: Date.now(),
        dismissedCount: (
          (JSON.parse(
            (await AsyncStorage.getItem(FEEDBACK_PROMPT_KEY)) || '{}',
          ) as Partial<FeedbackPromptState>).dismissedCount || 0
        ) + 1,
      };
      await AsyncStorage.setItem(FEEDBACK_PROMPT_KEY, JSON.stringify(state));
      setShowPrompt(false);
      setSelectedNota(null);
    } catch (error) {
      console.error('Error storing feedback prompt state:', error);
    }
  };

  const handleSelectNota = (nota: 'RUIM' | 'BOM' | 'EXCELENTE') => {
    if (nota === 'EXCELENTE') {
      handleSubmitFeedback(nota, '');
    } else {
      setSelectedNota(nota);
    }
  };

  const handleSubmitFeedback = async (nota: 'RUIM' | 'BOM' | 'EXCELENTE', texto?: string) => {
    try {
      await feedbacksApi.createFeedback({ nota, texto }, igrejaId!);
      await handlePromptShown();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  return {
    showPrompt,
    selectedNota,
    isLoading,
    onSelectNota: handleSelectNota,
    onSubmitFeedback: handleSubmitFeedback,
    onDismiss: handlePromptShown,
  };
}
