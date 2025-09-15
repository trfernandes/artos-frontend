import { StyleSheet, View } from 'react-native';
import LoginBase from '../../components/pages/login/LoginBase';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import FancyTextInput from '../../components/fields/FancyTextInput';
import { Pallete } from '../../constants/colors';
import { DefaultIconsNames } from '../../constants/icons';
import { router } from 'expo-router';
import FancyPasswordInput from '../../components/fields/FancyPasswordInput';

export default function CreateAccountPage() {
  return (
    <LoginBase>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FancyButton
            icon={{ ...DefaultIconsNames['chevron-left'], color: Pallete.icons.dark }}
            size={30}
            onPress={() => router.back()}
            containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
          />
        </View>
        <View style={styles.topContainer}>
          <View style={styles.titleContainer}>
            <FancyText size={'extraLarge'} type="semiBold" color="white" style={{ fontSize: 17 }}>
              Criação de Conta
            </FancyText>
            <FancyText size={'medium'} type="medium" color="white" style={{ fontSize: 12, lineHeight: 18 }}>
              Crie uma contae aproveite todas as funcionalidades
            </FancyText>
          </View>

          <View style={styles.centerContainer}>
            <View style={styles.fieldsContainer}>
              <FancyTextInput label="Nome" />
              <FancyTextInput label="E-mail" />
              <FancyPasswordInput label="Senha" />
              <FancyPasswordInput label="Confirmar a Senha" />
              <View />
              <FancyButton label="Criar" />
            </View>
          </View>
        </View>
      </View>
    </LoginBase>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    borderWidth: DESIGN_MODE,
    borderColor: 'gold',
    paddingHorizontal: 40,
    paddingVertical: 20,
    justifyContent: 'flex-start',
    gap: 20,
  },
  topContainer: { flex: 1, gap: 30, justifyContent: 'center' },
  centerContainer: {
    flex: 0,
    // flexGrow: 10,
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
    justifyContent: 'center',
  },
  bottomSpacer: { flex: 0, borderWidth: DESIGN_MODE, borderColor: 'deepskyblue' },
  logoContainer: {
    position: 'absolute',
    left: 40,
    top: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    gap: 2,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    justifyContent: 'center',
  },

  fieldsContainer: {
    borderWidth: DESIGN_MODE,
    borderRadius: 15,
    borderColor: 'firebrick',
    padding: 25,
    gap: 15,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
});
