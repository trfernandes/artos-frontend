import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySeparator from '../../../../FancySeparator';
import DefaultIcons, { CustomIconProps } from '../../../../FancyIcons';
import { Pallete } from '../../../../../constants/colors';
import FancyImage from '../../../../images/FancyImage';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { formatAppDateTime } from '../../../../../utils/date_utils';

export interface EventoInfoTabProps {
  ministerioNome: string;
  ministerioLogo: string;
  eventoNome: string;
  eventoDescricao?: string;
  dataOcorrencia: Date;
  local: string;
  funcoes: ResponseEscalaItemDto[];
}

export default function EventoInfoTab({
  ministerioNome,
  ministerioLogo,
  eventoNome,
  eventoDescricao,
  dataOcorrencia,
  local,
  funcoes,
}: EventoInfoTabProps) {
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        {ministerioLogo && <FancyImage source={{ uri: ministerioLogo }} size={80} />}
        <FancyText size='large' type='bold' color={Pallete.fonts.inactive}>
          {ministerioNome}
        </FancyText>
      </View>
      <View style={styles.lines}>
        <FancyValueLineDisplay
          icon={{ library: 'MaterialCommunityIcons', name: 'format-text', size: 14, color: Pallete.icons.inactive }}
          title='Nome'
          value={eventoNome}
        />
        {eventoDescricao && <FancyValueLineDisplay title='Descrição' value={eventoDescricao} />}
        <FancyValueLineDisplay
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-today', size: 14, color: Pallete.icons.inactive }}
          title='Data/Hora'
          value={dataOcorrencia ? (formatAppDateTime(dataOcorrencia, 'dd/MM/yyyy HH:mm') ?? '(Vazio)') : '(Vazio)'}
          showBottomLine={true}
        />
        <FancyValueLineDisplay
          icon={{ library: 'MaterialCommunityIcons', name: 'map-marker', size: 14, color: Pallete.icons.inactive }}
          title='Local'
          value={local || '(Nenhum)'}
          showBottomLine={true}
        />
        <FancyValueLineDisplay
          icon={{ library: 'MaterialCommunityIcons', name: 'tools', size: 13, color: Pallete.icons.inactive }}
          title='Função'
          value={
            funcoes
              .map((f) => f.funcao?.nome)
              .sort((a, b) => (a && b ? a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }) : 0))
              .join(', ') || '(Vazio)'
          }
          showBottomLine={false}
        />
      </View>
    </View>
  );
}

function FancyValueLineDisplay({
  icon,
  title,
  value,
  showBottomLine = true,
}: {
  icon?: CustomIconProps;
  title: string;
  value: string;
  showBottomLine?: boolean;
}) {
  return (
    <View style={styles.lineContainer}>
      <View style={styles.displayContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {icon && <DefaultIcons.Custom {...icon} style={{ borderWidth: 0 }} color={Pallete.icons.inactive2} />}
          <FancyText size='small' type='bold' style={{ opacity: 0.8 }}>
            {title}
          </FancyText>
        </View>
        <FancyText size='small' type='mediumItalic'>
          {value}
        </FancyText>
      </View>
      {showBottomLine && <FancySeparator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 40 },
  lines: { gap: 10 },
  title: { flexDirection: 'column', alignItems: 'center', gap: 12 },
  lineContainer: { borderWidth: 0, gap: 12, paddingBottom: 4 },
  displayContainer: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', borderWidth: 0 },
});
