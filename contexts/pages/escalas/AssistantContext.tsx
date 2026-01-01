import React, { createContext, useContext, useState, useMemo } from 'react';
import { EscalaModel } from '../../../domain/models/Escala';

export interface AssistenteEscalaContextData {
  ministerioId: string;

  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  nextStep: () => void;
  previousStep: () => void;

  isShouldLoadEvents: boolean;
  setShouldLoadEvents: (v: boolean) => void;

  isShouldLoadMembers: boolean;
  setShouldLoadMembers: (v: boolean) => void;

  resultado: EscalaModel;
  setResultado: (r: any) => void;

  tempoGeracaoEscala?: number;
  setTempoGeracaoEscala?: (t: number) => void;
}

const AssistenteEscalaContext = createContext<AssistenteEscalaContextData>({} as any);

export function AssistenteEscalaProvider({ ministerioId, children }: { ministerioId: string; children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [resultado, setResultado] = useState<any>(null);
  const [isShouldLoadEvents, setShouldLoadEvents] = useState(true);
  const [isShouldLoadMembers, setShouldLoadMembers] = useState(true);
  const [tempoGeracaoEscala, setTempoGeracaoEscala] = useState<number | undefined>(undefined);

  const nextStep = () => setIndex(i => i + 1);
  const previousStep = () => setIndex(i => Math.max(0, i - 1));

  const value = useMemo(
    () => ({
      ministerioId,
      index,
      setIndex,
      nextStep,
      previousStep,
      resultado,
      setResultado,
      isShouldLoadEvents,
      setShouldLoadEvents,
      isShouldLoadMembers,
      setShouldLoadMembers,
      tempoGeracaoEscala,
      setTempoGeracaoEscala,
    }),
    [ministerioId, index, resultado, isShouldLoadEvents, isShouldLoadMembers, tempoGeracaoEscala]
  );

  return <AssistenteEscalaContext.Provider value={value}>{children}</AssistenteEscalaContext.Provider>;
}

export function useAssistenteEscala() {
  return useContext(AssistenteEscalaContext);
}
