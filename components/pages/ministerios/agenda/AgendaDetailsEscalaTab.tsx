import EquipeOcorrenciaView from '../../common/EquipeOcorrenciaView';

export default function AgendaDetailsEscalaTab({
  eventoId,
  dataOcorrencia,
  ministerioId,
  modo = 'voluntario',
}: {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  modo?: 'lider' | 'voluntario';
}) {
  return (
    <EquipeOcorrenciaView
      eventoId={eventoId}
      dataOcorrencia={dataOcorrencia}
      ministerioId={ministerioId}
      modo={modo}
    />
  );
}
