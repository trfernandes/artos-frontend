import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import FancyTextInput from '../../components/fields/FancyTextInput';
import LoginBase from '../../components/pages/login/LoginBase';
import { Pallete } from '../../constants/colors';
import { DefaultIconsNames } from '../../constants/icons';

export default function ForgotPasswordPage() {
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
              Recuperação de Senha
            </FancyText>
            <FancyText
              size={'medium'}
              type="medium"
              color="white"
              style={{ width: 220, borderWidth: 0, fontSize: 12, lineHeight: 18 }}
            >
              Informe seu e‑mail para receber as instruções de recuperação
            </FancyText>
          </View>

          <View style={styles.centerContainer}>
            <View style={styles.fieldsContainer}>
              <FancyTextInput label="E-mail" />
              <FancyButton label="Enviar" />
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
  topContainer: { flex: 1, gap: 40, justifyContent: 'center' },
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
    gap: 25,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
});
