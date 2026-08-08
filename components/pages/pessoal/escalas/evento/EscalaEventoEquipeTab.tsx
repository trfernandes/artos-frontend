import EquipeOcorrenciaView from '../../../common/EquipeOcorrenciaView';

export default function EscalaEventoEquipeTab({
  eventoId,
  dataOcorrencia,
  ministerioId,
  responsavelSetlistVoluntarioId,
  responsavelSetlistNome,
}: {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  responsavelSetlistVoluntarioId?: string;
  responsavelSetlistNome?: string;
}) {
  return (
    <EquipeOcorrenciaView
      eventoId={eventoId}
      dataOcorrencia={dataOcorrencia}
      ministerioId={ministerioId}
      responsavelSetlistVoluntarioIdFallback={responsavelSetlistVoluntarioId}
      responsavelSetlistVoluntarioNomeFallback={responsavelSetlistNome}
      modo='voluntario'
    />
  );
}
