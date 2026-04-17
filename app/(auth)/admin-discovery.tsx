import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AuthScreen from '../../components/pages/login/AuthScreen';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import DefaultIcons from '../../components/FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { EXTRA_LARGE_SIZE_FONT, MEDIUM_SIZE_FONT } from '../../constants/font';
import {
  AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
  AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
} from '../../constants/authTypography';

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
    <AuthScreen
      showBackButton
      centerWithinBackButtonArea
      scrollContainerStyle={styles.scrollContainer}
      fieldsContainerStyle={[
        styles.fieldsContainer,
        {
          backgroundColor: palette.backgroundColor,
          ...palette.shadows[200],
        },
      ]}
      header={() => (
        <View style={styles.header}>
          <FancyText
            size='extraLarge'
            type='bold'
            color='white'
            style={{ lineHeight: EXTRA_LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER }}
          >
            Organize a igreja sem ruído
          </FancyText>
          <FancyText
            size='medium'
            type='medium'
            color='white'
            style={{ lineHeight: MEDIUM_SIZE_FONT * AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER }}
          >
            Antes de cobrar, o app te deixa montar a base e sentir o fluxo funcionando.
          </FancyText>
        </View>
      )}
    >
      <View style={styles.content}>
        <View style={styles.benefitsList}>
          {BENEFITS.map((item) => (
            <View
              key={item.title}
              style={[
                styles.benefitRow,
                { borderBottomColor: palette.borderCard, backgroundColor: palette.backgroundColor4 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: palette.backgroundColor3 }]}>
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
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fieldsContainer: {
    borderRadius: 18,
    padding: 24,
    gap: 22,
  },
  header: {
    gap: 8,
  },
  content: {
    gap: 22,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
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
