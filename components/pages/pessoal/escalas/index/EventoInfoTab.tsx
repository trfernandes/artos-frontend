import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import { format } from 'date-fns';
import FancySeparator from '../../../../FancySeparator';
import { EscalaResultado } from '../../../../../domain/models/EscalaResultado';
import DefaultIcons, { CustomIconProps } from '../../../../FancyIcons';
import { Pallete } from '../../../../../constants/colors';
import FancyImage from '../../../../images/FancyImage';

export default function EventoInfoTab({ data }: { data: EscalaResultado }) {
  if (data.evento)
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          {data.voluntario.ministerio?.logo && <FancyImage source={{ uri: data.voluntario.ministerio.logo }} size={80} />}
          <FancyText size="large" type="bold" color={Pallete.fonts.inactive}>
            {data.voluntario.ministerio?.nome}
          </FancyText>
        </View>
        <View style={styles.lines}>
          <FancyValueLineDisplay
            icon={{ library: 'MaterialCommunityIcons', name: 'format-text', size: 14, color: Pallete.icons.inactive }}
            title="Nome"
            value={data.evento.nome}
          />
          {data.evento.descricao && <FancyValueLineDisplay title="Descrição" value={data.evento.descricao} />}
          <FancyValueLineDisplay
            icon={{ library: 'MaterialCommunityIcons', name: 'calendar-today', size: 14, color: Pallete.icons.inactive }}
            title="Data/Hora"
            value={data.dataOcorrencia ? format(data.dataOcorrencia, 'dd/MM/yyyy HH:mm') : '(Vazio)'}
            showBottomLine={true}
          />
          <FancyValueLineDisplay
            icon={{ library: 'MaterialCommunityIcons', name: 'map-marker', size: 14, color: Pallete.icons.inactive }}
            title="Local"
            value={data.evento.local || '(Nenhum)'}
            showBottomLine={true}
          />
          <FancyValueLineDisplay
            icon={{ library: 'MaterialCommunityIcons', name: 'tools', size: 13, color: Pallete.icons.inactive }}
            title="Função"
            value={data.funcao?.nome || '(Vazio)'}
            showBottomLine={false}
          />
        </View>
      </View>
    );
  else
    return (
      <View>
        <FancyText>Nenhum evento selecionado.</FancyText>
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
          <FancyText size="small" type="bold" style={{opacity:0.8}}>
            {title}
          </FancyText>
        </View>
        <FancyText size="small" type="mediumItalic">
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
