import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import FancyText from '../../../FancyText';
import FancyAvatarImage from '../../../images/FancyImage';
import { Pallete } from '../../../../constants/colors';

export default function DadosTab() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: 20, gap: 30, flex: 1 }}>
        <View style={styles.center}>
          <FancyAvatarImage
            source={user?.foto ? { uri: user?.foto } : require('../../../../assets/images/empty_profile_image.png')}
            size={120}
            style={{ backgroundColor: 'white', borderRadius: 100 }}
          />
          <View style={{ height: 5 }} />
          <FancyText type="semiBold" size="large">
            {user.nome}
          </FancyText>
          <FancyText size="small" style={{ color: Pallete.fonts.inactive }}>
            {user.email}
          </FancyText>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <FancyText type="semiBold" size="medium" style={styles.label}>
              Data de Nascimento
            </FancyText>
            <FancyText style={styles.value}>{user.dataNascimento || 'N/A'}</FancyText>
          </View>

          <View style={styles.row}>
            <FancyText type="semiBold" size="medium" style={styles.label}>
              Endereço
            </FancyText>
            <FancyText style={styles.value}>{user.endereco || 'N/A'}</FancyText>
          </View>

          <View style={styles.row}>
            <FancyText type="semiBold" size="medium" style={styles.label}>
              Telefone
            </FancyText>
            <FancyText style={styles.value}>{user.telefone || 'N/A'}</FancyText>
          </View>

          <View style={styles.row}>
            <FancyText type="semiBold" size="medium" style={styles.label}>
              Sexo
            </FancyText>
            <FancyText style={styles.value}>
              {user.sexo === 'M' ? 'Masculino' : user.sexo === 'F' ? 'Feminino' : 'N/A'}
            </FancyText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  label: {
    flex: 2,
    color: '#555',
  },
  value: {
    flex: 3,
    color: '#333',
    textAlign: 'right',
  },
});
