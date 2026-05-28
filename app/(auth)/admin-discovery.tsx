import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AuthLayout from '../../components/pages/login/AuthLayout';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import DefaultIcons from '../../components/FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

const BENEFITS = [
  {
    title: 'Escalas mais previsíveis',
    description: 'Centralize ministérios, funções e convites sem depender de planilha.',
    icon: 'calendar-check-outline',
  },
  {
    title: 'Equipe alinhada',
    description: 'Voluntários entram com código ou convite e recebem o contexto certo.',
    icon: 'account-multiple-check-outline',
  },
  {
    title: 'Louvor e repertório no mesmo fluxo',
    description: 'Setlist, repertório e operação do evento ficam no mesmo lugar.',
    icon: 'music-clef-treble',
  },
] as const;

export default function AdminDiscoveryPage() {
  const palette = usePallete();

  return (
    <AuthLayout
      showBackButton
      title='Organize a igreja sem ruído'
      subtitle='Antes de cobrar, o app te deixa montar a base e sentir o fluxo funcionando.'
      hideHeaderOnKeyboard={false}
    >
      <View style={styles.content}>
        <View style={styles.benefitsList}>
          {BENEFITS.map((item) => (
            <View
              key={item.title}
              style={[
                styles.benefitRow,
                { borderColor: palette.borderCard, backgroundColor: palette.backgroundColor4 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.10) }]}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name={item.icon}
                  size={20}
                  color={palette.primary}
                />
              </View>
              <View style={styles.benefitText}>
                <FancyText size='small' type='semiBold'>
                  {item.title}
                </FancyText>
                <FancyText size='extraSmall' color={palette.fonts.inactive}>
                  {item.description}
                </FancyText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <FancyButton
            label='Cadastrar minha igreja'
            onPress={() => router.push('/(auth)/create-igreja-account')}
            icon={{ library: 'MaterialCommunityIcons', name: 'arrow-right', size: 16 }}
            iconPosition='right'
          />
          <FancyButton
            type='text'
            label='Já tenho conta'
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 22,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    gap: 4,
  },
  footer: {
    gap: 10,
  },
});
