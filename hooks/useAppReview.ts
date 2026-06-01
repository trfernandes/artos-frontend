import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const STORAGE_KEY = 'artos_app_review_state';
const MIN_APP_OPENS = 5;
const MIN_DAYS_BETWEEN_PROMPTS = 30;
const MAX_TOTAL_PROMPTS = 3;

type ReviewState = {
  appOpenCount: number;
  lastPromptDate: string | null;
  totalPrompts: number;
};

const DEFAULT_STATE: ReviewState = {
  appOpenCount: 0,
  lastPromptDate: null,
  totalPrompts: 0,
};

async function getState(): Promise<ReviewState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { ...DEFAULT_STATE };
}

async function saveState(state: ReviewState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function trackAppOpen(): Promise<void> {
  const state = await getState();
  state.appOpenCount += 1;
  await saveState(state);
}

export async function shouldPromptReview(): Promise<boolean> {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) return false;

  const state = await getState();

  if (state.appOpenCount < MIN_APP_OPENS) return false;
  if (state.totalPrompts >= MAX_TOTAL_PROMPTS) return false;

  if (state.lastPromptDate) {
    const daysSince =
      (Date.now() - new Date(state.lastPromptDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < MIN_DAYS_BETWEEN_PROMPTS) return false;
  }

  return true;
}

export async function requestReviewIfEligible(): Promise<boolean> {
  const eligible = await shouldPromptReview();
  if (!eligible) return false;

  try {
    await StoreReview.requestReview();
    const state = await getState();
    state.totalPrompts += 1;
    state.lastPromptDate = new Date().toISOString();
    await saveState(state);
    console.log('[AppReview] Review solicitado com sucesso.');
    return true;
  } catch (error) {
    console.log('[AppReview] Erro ao solicitar review:', error);
    return false;
  }
}
