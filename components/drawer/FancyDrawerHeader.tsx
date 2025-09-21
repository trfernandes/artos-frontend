import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Image, StyleProp, ImageStyle } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import FancyButton from '../buttons/FancyButton';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function FancyDrawerHeader() {
  const auth = useAuth();
  return (
    <LinearGradient colors={['#3B82F6', '#234C90']} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.dataContainer}>
          <View style={styles.infoContainer}>
            <FancyText size={'small'} type="medium" color={Pallete.fonts.light}>
              Olá,
            </FancyText>
            <FancyText size={'medium'} type="bold" color={Pallete.fonts.light}>
              {auth.user?.nome}
            </FancyText>
            <FancyText size={'small'} type="semiBold" color={Pallete.fonts.light}>
              {auth.user?.email}
            </FancyText>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww',
              }}
              style={styles.avatar as StyleProp<ImageStyle>}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <FancyButton
            containerStyle={styles.button}
            icon={{ name: 'edit', library: 'MaterialIcons', color: Pallete.fonts.light, size: 16 }}
            label="Editar Perfil"
            type="text"
            labelProps={{ size: 'extraSmall', type: 'semiBold' }}
            labelStyle={{ color: Pallete.fonts.light }}
            onPress={() => router.push('pessoal/perfil')}
          />
          {/* <FancyButton
            containerStyle={styles.button}
            icon={{ name: 'settings', library: 'MaterialIcons', color: Pallete.fonts.light, size: 16 }}
            label="Configurações"
            type="text"
            labelProps={{ size: 'extraSmall', type: 'semiBold' }}
            labelStyle={{ color: Pallete.fonts.light }}
          /> */}
          <FancyButton
            containerStyle={styles.button}
            icon={{ name: 'logout', library: 'MaterialIcons', color: Pallete.fonts.light, size: 16 }}
            label="Sair"
            type="text"
            onPress={() => auth.signOut()}
            labelProps={{ size: 'extraSmall', type: 'semiBold' }}
            labelStyle={{ color: Pallete.fonts.light }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderColor: 'red',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    flexDirection: 'column',
    paddingLeft: 15,
    paddingRight: 18,
    paddingTop: 16,
    paddingBottom: 22,
    gap: 18,
  },
  dataContainer: { flexDirection: 'row' },
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
    height: 50,
    aspectRatio: 1,
    borderRadius: 100,
  },
});
