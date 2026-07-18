import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'artos_tutorial_state';

type TutorialStatus = { seen: boolean; seenAt?: string; skippedAt?: string };
type TutorialState = Record<string, TutorialStatus>;

export type TutorialCatalogEntry = { id: string; title: string };

interface TutorialCatalogContextData {
  tours: TutorialCatalogEntry[];
  registerTour: (entry: TutorialCatalogEntry) => void;
  isSeen: (tourId: string) => boolean;
  markSeen: (tourId: string) => void;
  markSkipped: (tourId: string) => void;
  loading: boolean;
}

const TutorialCatalogContext = createContext<TutorialCatalogContextData>(
  {} as TutorialCatalogContextData,
);

async function getState(): Promise<TutorialState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveState(state: TutorialState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignora falha de persistência — pior caso, banner reaparece
  }
}

type TutorialCatalogProviderProps = { children: React.ReactNode };

export function TutorialCatalogProvider({ children }: TutorialCatalogProviderProps) {
  const [tours, setTours] = useState<TutorialCatalogEntry[]>([]);
  const [state, setState] = useState<TutorialState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getState().then((loaded) => {
      setState(loaded);
      setLoading(false);
    });
  }, []);

  const registerTour = (entry: TutorialCatalogEntry) => {
    setTours((prev) => (prev.some((t) => t.id === entry.id) ? prev : [...prev, entry]));
  };

  const isSeen = (tourId: string) => !!state[tourId]?.seen;

  const persistStatus = (tourId: string, status: TutorialStatus) => {
    setState((prev) => {
      const next = { ...prev, [tourId]: status };
      saveState(next);
      return next;
    });
  };

  const markSeen = (tourId: string) =>
    persistStatus(tourId, { seen: true, seenAt: new Date().toISOString() });
  const markSkipped = (tourId: string) =>
    persistStatus(tourId, { seen: true, skippedAt: new Date().toISOString() });

  const value = useMemo(
    () => ({ tours, registerTour, isSeen, markSeen, markSkipped, loading }),
    [tours, state, loading],
  );

  return (
    <TutorialCatalogContext.Provider value={value}>{children}</TutorialCatalogContext.Provider>
  );
}

export const useTutorialCatalog = () => useContext(TutorialCatalogContext);
