import { ResponseSetlistResumoDto } from '../../../../../domain/dtos/Evento/setlists-resumo.dto';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { ColorUtils } from '../../../../../utils/color_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyListItemCard from '../../../../cards/FancyListItemCard';
import FancyChips from '../../../../FancyChips';

type Props = {
  data: ResponseSetlistResumoDto;
  onPress: () => void;
};

export default function SetlistResumoCard({ data, onPress }: Props) {
  const palette = usePallete();
  const isCancelled = data.cancelada === true;
  const ocorrenciaDate = DateUtilsApi.dateOnlyFromApi(data.dataOcorrencia);
  const responsavelLabel = data.responsavelSetlistVoluntario?.nome || 'Sem responsável definido';
  const statusLabel = isCancelled
    ? 'Cancelado'
    : data.totalMusicas === 0
      ? 'SetList vazio'
      : `${data.totalMusicas} ${data.totalMusicas === 1 ? 'música' : 'músicas'}`;
  const statusColor = isCancelled
    ? palette.fonts.inactive
    : data.totalMusicas === 0
      ? palette.warning
      : palette.primary;

  return (
    <FancyListItemCard
      onPress={onPress}
      containerStyle={isCancelled && { opacity: 0.6 }}
      leading={{
        type: 'date',
        day: String(ocorrenciaDate.getDate()).padStart(2, '0'),
        month: ocorrenciaDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        color: palette.primary,
        backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
      }}
      title={data.nome}
      titleProps={
        isCancelled
          ? { style: { textDecorationLine: 'line-through' }, color: palette.fonts.inactive }
          : undefined
      }
      subtitle={responsavelLabel}
      status={<FancyChips size='small' label={statusLabel} color={statusColor} />}
      trailing={{ type: 'chevron' }}
    />
  );
}
