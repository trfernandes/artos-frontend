import { View } from 'react-native';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';
import FancyText from '../../../../FancyText';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import FancyGroup from '../../../../list/FancyGroup';
import { TimeUtils } from '../../../../../utils/timer_util';
import FancyChips from '../../../../FancyChips';
import { useMemo } from 'react';
import { strfyObj } from '../../../../../utils/text_utils';
import { format } from 'date-fns';
import { DateUtilsApi } from '../../../../../utils/date_utils';

export default function AssistenteResultadoStep() {
  const { resultado, tempoGeracaoEscala } = useAssistenteEscala();

  const quantEventos = useMemo(() => {
    const set = new Set<string>();

    for (const item of resultado.itens) {
      const key = `${item.evento.id}-${new Date(item.dataOcorrencia).toISOString()}`;
      set.add(key);
    }

    return set.size;
  }, [resultado.itens]);

  const quantParticipantes = useMemo(() => {
    const set = new Set<string>();

    for (const item of resultado.itens) {
      if (!item.voluntario?.id) continue;
      const key = item.voluntario?.id;
      set.add(key);
    }

    return set.size;
  }, [resultado.itens]);

  console.log('resultado', strfyObj(resultado));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'space-around', flex: 1, gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 16, borderWidth: 0 }}>
        <DefaultIcons.Custom library='FontAwesome6' name='circle-check' size={80} color='green' />
        <FancyText size={'large'} type='bold'>
          Sua escala está pronta!
        </FancyText>
      </View>
      <FancyGroup title='Resumo do processamento' contentContainerStyle={{ padding: 20, gap: 6 }}>
        <FancyTextDisplay
          title='Período:'
          value={
            <FancyChips
              size={'small'}
              label={`${format(DateUtilsApi.dateOnlyFromApi(resultado.dataInicio), 'dd/MM/yyyy')} à ${format(
                DateUtilsApi.dateOnlyFromApi(resultado.dataTermino),
                'dd/MM/yyyy',
              )}`}
            />
          }
          titleStyle={{ size: 'small', type: 'semiBold' }}
        />
        <FancyTextDisplay
          title='Qtd. de eventos:'
          value={<FancyChips size={'small'} label={`${quantEventos}`} />}
          titleStyle={{ size: 'small', type: 'semiBold' }}
        />
        <FancyTextDisplay
          title='Qtd. de voluntários:'
          value={<FancyChips size={'small'} label={`${quantParticipantes}`} />}
          titleStyle={{ size: 'small', type: 'semiBold' }}
        />
        <FancyTextDisplay
          title='Tempo gasto:'
          value={<FancyChips size={'small'} label={`${TimeUtils.formatMillis(tempoGeracaoEscala ?? 0)}`} />}
          titleStyle={{ size: 'small', type: 'semiBold' }}
        />
      </FancyGroup>
    </View>
  );
}
