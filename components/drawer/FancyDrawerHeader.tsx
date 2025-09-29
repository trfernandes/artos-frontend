import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StyleProp, ImageStyle, TouchableOpacity } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import DefaultIcons from '../FancyIcons';
import { router } from 'expo-router';
import { calculateProfileCompletion } from '../../domain/models/Voluntario';
import FancyImage from '../images/FancyImage';

export default function FancyDrawerHeader() {
  const auth = useAuth();

  const profileCompletion = calculateProfileCompletion(auth.user!);

  return (
    <LinearGradient colors={['#3B82F6', '#234C90']} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.container}>
      <TouchableOpacity onPress={() => router.push('pessoal/perfil')} style={styles.contentContainer}>
        <View style={styles.dataContainer}>
          <View style={styles.infoContainer}>
            <FancyText size={'small'} type="medium" color={Pallete.fonts.light}>
              Olá,
            </FancyText>
            <FancyText size={'medium'} type="bold" color={Pallete.fonts.light}>
              {auth.user?.nome}
            </FancyText>
            <FancyText size={'small'} type="semiBoldItalic" color={Pallete.fonts.light}>
              {auth.user?.email}
            </FancyText>
          </View>
          <View style={styles.avatarContainer}>
            <FancyImage
              source={auth.user?.foto ? { uri: auth.user?.foto } : require('../../assets/images/empty_profile_image.png')}
              size={50}
              style={styles.avatar as StyleProp<ImageStyle>}
            />
          </View>
          <DefaultIcons.Custom library="Feather" name="chevron-right" size={28} color={Pallete.fonts.light} />
        </View>
        <View style={{ paddingRight: 2 }}>
          <FancyText type="medium" size={'small'} color={Pallete.fonts.light} style={{ lineHeight: 18 }}>
            {`⚠️ O seu perfil está ${profileCompletion}% completo, clique aqui para editar`}
          </FancyText>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderColor: 'red',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    paddingTop: 16,
    paddingBottom: 26,
  },
  contentContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
  },
  dataContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  infoContainer: {
    flex: 1,
    borderColor: 'rgb(255, 0, 204)',
    gap: 3,
    justifyContent: 'center',
  },
  avatarContainer: {
    borderColor: 'rgb(0, 255, 34)',
    justifyContent: 'center',
  },
  buttonContainer: {
    borderColor: 'rgb(0, 225, 255)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: { borderWidth: 0, maxHeight: 'auto', minHeight: 'auto', padding: 0, gap: 5 },
  avatar: {
    backgroundColor: 'white',
    height: 50,
    aspectRatio: 1,
    borderRadius: 100,
  },
});
