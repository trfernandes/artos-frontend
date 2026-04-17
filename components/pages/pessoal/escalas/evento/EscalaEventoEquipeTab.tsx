import EquipeOcorrenciaView from '../../../common/EquipeOcorrenciaView';

export default function EscalaEventoEquipeTab({
  eventoId,
  dataOcorrencia,
  ministerioId,
}: {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
}) {
  return (
    <EquipeOcorrenciaView
      eventoId={eventoId}
      dataOcorrencia={dataOcorrencia}
      ministerioId={ministerioId}
      modo='voluntario'
    />
  );
}
