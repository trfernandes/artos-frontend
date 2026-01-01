import { StyleSheet, View } from 'react-native';
import FancyAvatarImage from '../../../images/FancyImage';
import FancyScrollView from '../../../FancyScrollView';
import { VoluntarioModel } from '../../../../domain/models/Voluntario';
import FancyText from '../../../FancyText';
import { format } from 'date-fns';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';
import FancyValueLine from '../../../fields/FancyValueLine';

export default function VoluntarioDadosTab(props: { voluntario: VoluntarioModel }) {
  if (!props.voluntario) {
    return;
  }

  return (
    <FancyScrollView contentContainerStyle={styles.container}>
      <View style={{ gap: 20 }}>
        <FancyAvatarImage
          source={props.voluntario.foto ? { uri: props.voluntario.foto } : require('../../../../assets/images/empty_profile_image.png')}
          disabled
          size={100}
          style={{ alignSelf: 'center' }}
        />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <FancyText size={'large'} type="bold" style={{ opacity: 0.8 }}>
            {props.voluntario.nome}
          </FancyText>
          <FancyText size={'medium'} type="normalItalic">
            {props.voluntario.email}
          </FancyText>
        </View>
      </View>
      <FancyVerticalSpacer height={40} />
      <View style={{ gap: 15 }}>
        <FancyValueLine title="Data de Nascimento:" value={format(new Date(props.voluntario.dataNascimento), 'dd/MM/yyyy')} showSeparator={true} />
        <FancyValueLine title="Telefone:" value={props.voluntario.telefone || 'Não definido'} showSeparator={true} />
        <FancyValueLine title="Endereço:" value={props.voluntario.endereco || 'Não definido'} showSeparator={true} />
        <FancyValueLine title="Sexo:" value={props.voluntario.sexo === 'M' ? 'Masculino' : props.voluntario.sexo === 'F' ? 'Feminino' : 'N/A'} />
      </View>
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 20, flex: 1, borderWidth: 0, borderColor: 'red' },
  dataDisplay: { width: '100%', justifyContent: 'space-between' },
});
