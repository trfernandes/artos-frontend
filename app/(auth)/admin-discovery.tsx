import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
    accent: 'primary',
  },
  {
    title: 'Equipe alinhada',
    description: 'Voluntários entram com código ou convite e recebem o contexto certo.',
    icon: 'account-multiple-check-outline',
    accent: 'secondary',
  },
  {
    title: 'Louvor e repertório no mesmo fluxo',
    description: 'Setlist, repertório e operação do evento ficam no mesmo lugar.',
    icon: 'music-clef-treble',
    accent: 'terciary',
  },
] as const;

export default function AdminDiscoveryPage() {
  const Pallete = usePallete();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <View style={[styles.backButtonRow, { top: insets.top + 8 }]}>
          <FancyButton
            mode='icon'
            type='text'
            onPress={() => router.back()}
            icon={{ library: 'Feather', name: 'arrow-left', size: 18 }}
            iconStyle={{ color: Pallete.icons.dark }}
            containerStyle={{
              backgroundColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.08),
              borderRadius: 20,
              width: 40,
              height: 40,
            }}
          />
        </View>

        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
          <View style={styles.centerGroup}>
            <View style={styles.headerGroup}>
              <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                Organize a igreja sem ruído
              </FancyText>
              <FancyText size='small' color={Pallete.fonts.inactive} style={styles.subtitle}>
                Antes de cobrar, o app te deixa montar a base e sentir o fluxo funcionando.
              </FancyText>
            </View>

            <View style={styles.benefitsList}>
              {BENEFITS.map((item) => {
                const accent = Pallete[item.accent];
                return (
                  <View
                    key={item.title}
                    style={[
                      styles.benefitRow,
                      Pallete.shadows[200],
                      {
                        backgroundColor: ColorUtils.blendOver(
                          accent,
                          0.07,
                          Pallete.backgroundColor,
                        ),
                        borderColor: ColorUtils.withAlpha(accent, 0.25),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: ColorUtils.withAlpha(accent, 0.12) },
                      ]}
                    >
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name={item.icon}
                        size={20}
                        color={accent}
                      />
                    </View>
                    <View style={styles.benefitText}>
                      <FancyText size='small' type='semiBold' color={Pallete.fonts.dark}>
                        {item.title}
                      </FancyText>
                      <FancyText
                        size='extraSmall'
                        color={Pallete.fonts.inactive}
                        style={styles.benefitDescription}
                      >
                        {item.description}
                      </FancyText>
                    </View>
                  </View>
                );
              })}
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
                labelStyle={{ color: Pallete.fonts.link }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  backButtonRow: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  centerGroup: {
    gap: 22,
  },
  headerGroup: {
    gap: 2,
  },
  subtitle: {
    opacity: 0.85,
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
  benefitDescription: {
    opacity: 0.85,
  },
  footer: {
    gap: 10,
  },
});
