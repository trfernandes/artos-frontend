import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemePalette } from '../../constants/colors';
import { FancyCard } from '../../components/cards/Horizontal/FancyCard';
import DefaultIcons from '../../components/FancyIcons';
import { useState } from 'react';
import FancyModalDialog from '../../components/modal/FancyModalDialog';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ColorUtils } from '../../utils/color_utils';
import { router } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';

export default function ComecarScreen() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  return (
    <View style={styles.root}>
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

        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
          <View style={styles.centerGroup}>
            <View style={styles.headerGroup}>
              <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                Como você vai entrar?
              </FancyText>
              <FancyText size='small' color={Pallete.fonts.inactive}>
                Escolha uma opção. Você pode voltar e trocar depois.
              </FancyText>
            </View>

            <View style={styles.cardsContainer}>
              <FancyCard.Image
                type='icon'
                props={{
                  onPress: () => router.push('/(auth)/create-voluntario-account'),
                  accessibilityRole: 'button',
                  accessibilityLabel: 'Sou voluntário',
                  title: 'Sou voluntário',
                  subtitle: (
                    <FancyText
                      size='extraSmall'
                      type='medium'
                      color={Pallete.fonts.inactive}
                      numberOfLines={3}
                    >
                      Já tenho convite ou código da igreja para entrar na equipe.
                    </FancyText>
                  ),
                  additionalData1: (
                    <FancyText
                      size='extraSmall'
                      type='semiBold'
                      color={Pallete.fonts.link}
                      style={{ textDecorationLine: 'underline' }}
                    >
                      Entrar com código ou convite
                    </FancyText>
                  ),
                  cardIcon: {
                    library: 'MaterialCommunityIcons',
                    name: 'account-group-outline',
                    size: 20,
                    backgroundColor: Pallete.primary,
                    color: Pallete.fonts.light,
                  },
                  actionButtons: (
                    <View style={styles.chevronContainer}>
                      <DefaultIcons.Custom
                        library='Entypo'
                        name='chevron-right'
                        size={22}
                        color={Pallete.icons.inactive}
                      />
                    </View>
                  ),
                  containerStyle: [styles.card, styles.cardVoluntario],
                  contentContainerStyle: styles.cardContent,
                  centerContainerStyle: { gap: 6 },
                  titleProps: { color: Pallete.fonts.dark },
                  backgroundColor: ColorUtils.blendOver(
                    Pallete.primary,
                    0.07,
                    Pallete.backgroundColor,
                  ),
                }}
              />

              <FancyCard.Image
                type='icon'
                props={{
                  onPress: () => router.push('/(auth)/admin-discovery'),
                  accessibilityRole: 'button',
                  accessibilityLabel: 'Sou responsável pela igreja',
                  title: 'Sou responsável pela igreja',
                  subtitle: (
                    <FancyText
                      size='extraSmall'
                      type='medium'
                      color={Pallete.fonts.inactive}
                      numberOfLines={3}
                    >
                      Quero organizar ministérios, voluntários e escalas no app.
                    </FancyText>
                  ),
                  additionalData1: (
                    <FancyText
                      size='extraSmall'
                      type='semiBold'
                      color={Pallete.fonts.link}
                      style={{ textDecorationLine: 'underline' }}
                    >
                      Conhecer e criar minha igreja
                    </FancyText>
                  ),
                  cardIcon: {
                    library: 'MaterialCommunityIcons',
                    name: 'church',
                    size: 20,
                    backgroundColor: Pallete.secondary,
                    color: Pallete.fonts.light,
                  },
                  actionButtons: (
                    <View style={styles.chevronContainer}>
                      <DefaultIcons.Custom
                        library='Entypo'
                        name='chevron-right'
                        size={22}
                        color={Pallete.icons.inactive}
                      />
                    </View>
                  ),
                  containerStyle: [styles.card, styles.cardResponsavel],
                  contentContainerStyle: styles.cardContent,
                  centerContainerStyle: { gap: 6 },
                  titleProps: { color: Pallete.fonts.dark },
                  backgroundColor: ColorUtils.blendOver(
                    Pallete.secondary,
                    0.07,
                    Pallete.backgroundColor,
                  ),
                }}
              />
            </View>

            <View style={styles.footer}>
              <FancyButton
                type='outlined'
                label='Já tenho conta'
                onPress={() => router.push('/(auth)/login')}
                containerStyle={[styles.loginButton, { borderColor: Pallete.primary }]}
                labelStyle={{ color: Pallete.primary }}
              />
              <View style={styles.footerLinks}>
                <FancyButton
                  type='text'
                  label='Não sabe qual escolher?'
                  onPress={() => setIsHelpModalVisible(true)}
                  labelStyle={[styles.footerLink, { color: Pallete.fonts.link }]}
                  containerStyle={styles.footerLinkContainer}
                />
                <FancyText size='small' color={Pallete.fonts.inactive} style={styles.footerHint}>
                  Ainda não recebeu convite? Peça ao seu líder para enviar.
                </FancyText>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {isHelpModalVisible && (
        <FancyModalDialog
          title='Não sabe qual escolher?'
          modalProps={{ visible: isHelpModalVisible }}
          onButton1Press={() => setIsHelpModalVisible(false)}
          button1={{ label: 'Fechar' }}
          button2={{ visible: false }}
          centerContainerStyle={styles.modalContent}
        >
          <View style={styles.modalSection}>
            <FancyText size='small' type='semiBold'>
              Sou voluntário
            </FancyText>
            <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
              Se você participa de escalas, use o código ou convite enviado pela igreja.
            </FancyText>
          </View>
          <View style={styles.modalSection}>
            <FancyText size='small' type='semiBold'>
              Sou responsável pela igreja
            </FancyText>
            <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
              Se você organiza equipes, primeiro conhece o fluxo e depois cria a igreja.
            </FancyText>
          </View>
        </FancyModalDialog>
      )}
    </View>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: Pallete.backgroundColor,
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
      gap: 14,
    },
    headerGroup: {
      gap: 2,
    },
    cardsContainer: {
      gap: 16,
    },
    card: {
      width: '100%',
      borderRadius: 30,
      borderWidth: 1,
      borderColor: Pallete.borderCard,
      ...Pallete.shadows[200],
    },
    // Bordas tingidas com a cor de cada escolha (accent wash) — override do borderColor do card.
    cardVoluntario: {
      borderColor: ColorUtils.withAlpha(Pallete.primary, 0.25),
    },
    cardResponsavel: {
      borderColor: ColorUtils.withAlpha(Pallete.secondary, 0.25),
    },
    cardContent: {
      paddingVertical: 8,
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      alignItems: 'center',
      gap: 12,
    },
    footerLinks: {
      alignItems: 'center',
      gap: 2,
    },
    loginButton: {
      alignSelf: 'stretch',
    },
    footerLink: {
      fontSize: 12,
    },
    footerLinkContainer: {
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerHint: {
      textAlign: 'center',
    },
    modalContent: {
      gap: 16,
    },
    modalSection: {
      gap: 6,
    },
  });
}
