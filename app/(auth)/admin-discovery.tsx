import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import DefaultIcons from '../../components/FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type AccentKey = 'primary' | 'secondary';

const ROLES: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  icon: string;
  accent: AccentKey;
  route: string;
  iosHidden: boolean;
}[] = [
  {
    eyebrow: 'Para quem serve',
    title: 'Sou voluntário',
    description: 'Já recebi convite ou código da minha igreja. Quero entrar na equipe.',
    cta: 'Entrar com código ou convite',
    icon: 'account-group-outline',
    accent: 'primary',
    route: '/(auth)/create-voluntario-account',
    iosHidden: false,
  },
  {
    // iOS: Apple Guideline 3.1.1 — cadastro de organização pagante não
    // pode acontecer dentro do app.
    eyebrow: 'Para quem lidera',
    title: 'Sou responsável pela igreja',
    description: 'Quero organizar voluntários, ministérios e escalas no app.',
    cta: 'Conhecer e criar minha igreja',
    icon: 'crown-outline',
    accent: 'secondary',
    route: '/(auth)/create-igreja-account',
    iosHidden: true,
  },
];

export default function AdminDiscoveryPage() {
  const Pallete = usePallete();
  const insets = useSafeAreaInsets();

  const visibleRoles = ROLES.filter((r) => !r.iosHidden || Platform.OS !== 'ios');

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
              borderRadius: 22,
              width: 44,
              height: 44,
            }}
          />
        </View>

        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 68, paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
        >
          <View style={styles.headerGroup}>
            <FancyText size={28} type='bold' color={Pallete.fonts.dark} style={styles.title}>
              Como você vai entrar?
            </FancyText>
            <FancyText size='small' color={Pallete.fonts.inactive}>
              Você pode mudar isso depois.
            </FancyText>
          </View>

          <View style={styles.cardsList}>
            {visibleRoles.map((role) => {
              const accent = Pallete[role.accent];
              return (
                <Pressable
                  key={role.title}
                  style={({ pressed }) => [
                    styles.card,
                    Pallete.shadows[200],
                    {
                      backgroundColor: ColorUtils.blendOver(
                        accent,
                        pressed ? 0.14 : 0.09,
                        Pallete.backgroundColor,
                      ),
                      borderColor: ColorUtils.withAlpha(accent, pressed ? 0.5 : 0.32),
                    },
                  ]}
                  onPress={() => router.push(role.route as never)}
                >
                  <View
                    style={[
                      styles.cardIconZone,
                      { backgroundColor: ColorUtils.withAlpha(accent, 0.1) },
                    ]}
                  >
                    <DefaultIcons.Custom
                      library='MaterialCommunityIcons'
                      name={role.icon}
                      size={36}
                      color={ColorUtils.withAlpha(accent, 0.72)}
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <FancyText
                      size='extraSmall'
                      type='bold'
                      color={ColorUtils.withAlpha(accent, 0.65)}
                      style={styles.cardEyebrow}
                    >
                      {role.eyebrow.toUpperCase()}
                    </FancyText>

                    <FancyText
                      size='large'
                      type='bold'
                      color={Pallete.fonts.dark}
                      style={styles.cardTitle}
                    >
                      {role.title}
                    </FancyText>

                    <FancyText size='small' color={Pallete.fonts.inactive} style={styles.cardDesc}>
                      {role.description}
                    </FancyText>

                    <View style={styles.cardCta}>
                      <FancyText size='small' type='semiBold' color={accent}>
                        {role.cta}
                      </FancyText>
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name='arrow-right'
                        size={14}
                        color={accent}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <FancyButton
              type='text'
              label='Já tenho conta'
              onPress={() => router.push('/(auth)/login')}
              labelStyle={{ color: Pallete.fonts.link }}
            />
            <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.helpText}>
              {'Não sabe qual escolher? Peça o convite ao seu líder — ele chega por e-mail.'}
            </FancyText>
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
    paddingHorizontal: 20,
  },
  headerGroup: {
    gap: 4,
    marginBottom: 20,
  },
  title: {
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  cardsList: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardIconZone: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 2,
  },
  cardEyebrow: {
    letterSpacing: 2,
    marginBottom: 1,
  },
  cardTitle: {
    lineHeight: 20,
  },
  cardDesc: {
    lineHeight: 17,
  },
  cardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  footer: {
    gap: 10,
    marginTop: 'auto',
  },
  helpText: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});
