import { StyleSheet } from 'react-native';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyImage from '../../../images/FancyImage';
import FancyScrollView from '../../../FancyScrollView';
import FancyToggle from '../../../fields/FancyToggle';
import { Voluntario } from '../../../../domain/models/Voluntario';
import DateUtils from '../../../../utils/data_utils';

export default function VoluntarioDadosTab(props: { voluntario: Voluntario }) {
  // console.log('VoluntarioDadosTab', strfyObj(props.voluntario));

  if (!props.voluntario) {
    return;
  }

  return (
    <FancyScrollView contentContainerStyle={styles.container}>
      <FancyImage
        source={
          props.voluntario.foto
            ? { uri: props.voluntario.foto }
            : require('../../../../assets/images/empty_profile_image.png')
        }
        disabled
        size={150}
        style={{ alignSelf: 'center' }}
      />
      <FancyTextInput label="Nome" value={props.voluntario.nome} disabled />
      <FancyTextInput label="E-mail" value={props.voluntario.email} disabled />
      <FancyTextInput
        label="Data de Nascimento"
        value={
          props.voluntario.dataNascimento ? DateUtils.formatToBrDate(new Date(props.voluntario.dataNascimento)) : ''
        }
        disabled
      />
      <FancyTextInput label="Telefone" disabled value={props.voluntario.telefone} />
      <FancyTextInput label="Endereço" disabled value={props.voluntario.endereco} />
      <FancyToggle
        option1={{ title: 'Masculino', value: 'M' }}
        option2={{ title: 'Feminino', value: 'F' }}
        label="Sexo"
        onChange={() => {}}
        value={props.voluntario.sexo}
        disabled
      />
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, paddingHorizontal: 20, paddingTop: 10, flex: 1 },
});
