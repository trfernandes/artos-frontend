import { StyleSheet, View } from 'react-native';
import FancyAvatarImage from '../../../images/FancyImage';
import FancyScrollView from '../../../FancyScrollView';
import FancyText from '../../../FancyText';
import { format } from 'date-fns';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';
import FancyValueLine from '../../../fields/FancyValueLine';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { AppImages } from '../../../../assets/app_images';

export default function VoluntarioDadosTab(props: { voluntario: ResponseVoluntarioDto }) {
  if (!props.voluntario) {
    return;
  }

  return (
    <FancyScrollView contentContainerStyle={styles.container} fill> 
      <View style={{ gap: 20 }}>
        <FancyAvatarImage
          source={
            props.voluntario.fotoUrl || props.voluntario.fotoThumbUrl
              ? { uri: props.voluntario.fotoThumbUrl || props.voluntario.fotoUrl || '' }
              : AppImages.emptyProfile
          }
          disabled
          size={100}
          style={{ alignSelf: 'center' }}
        />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <FancyText size={'large'} type='bold' style={{ opacity: 0.8 }}>
            {props.voluntario.nome}
          </FancyText>
          <FancyText size={'medium'} type='normalItalic'>
            {props.voluntario.email}
          </FancyText>
        </View>
      </View>
      <FancyVerticalSpacer height={40} />
      <View style={{ gap: 15 }}>
        <FancyValueLine
          title='Data de Nascimento:'
          value={
            props.voluntario.dataNascimento
              ? format(DateUtilsApi.dateOnlyFromApi(props.voluntario.dataNascimento), 'dd/MM/yyyy')
              : 'Não definido'
          }
          showSeparator={true}
        />
        <FancyValueLine title='Telefone:' value={props.voluntario.telefone || 'Não definido'} showSeparator={true} />
        <FancyValueLine title='Endereço:' value={props.voluntario.endereco || 'Não definido'} showSeparator={true} />
        <FancyValueLine title='Sexo:' value={props.voluntario.sexo === 'M' ? 'Masculino' : props.voluntario.sexo === 'F' ? 'Feminino' : 'N/A'} />
      </View>
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 20, flex: 1, borderWidth: 0, borderColor: 'red' },
  dataDisplay: { width: '100%', justifyContent: 'space-between' },
});
