import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { ThemePalette } from '../../constants/colors';
import FancyButton from '../../components/buttons/FancyButton';
import { EXTRA_LARGE_SIZE_FONT, LARGE_SIZE_FONT } from '../../constants/font';
import FancyText from '../../components/FancyText';
import { router } from 'expo-router';
import { FancyCard } from '../../components/cards/Horizontal/FancyCard';
import DefaultIcons from '../../components/FancyIcons';
import { useState } from 'react';
import FancyModalDialog from '../../components/modal/FancyModalDialog';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ColorUtils } from '../../utils/color_utils';

export default function ComecarScreen() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  return (
    <AuthScreen
      showBackButton
      centerWithinBackButtonArea
      centerContainerStyle={({ keyboardVisible }) =>
        !keyboardVisible ? { paddingTop: 0 } : null
      }
      scrollContainerStyle={styles.scrollContainer}
      fieldsContainerStyle={styles.fieldsContainer}
      alignTopOnKeyboard
      compactTitleOnKeyboard='Como entrar'
      header={({ keyboardVisible }) => (
        <View style={{ gap: 5, borderWidth: 0 }}>
          <FancyText
            size={!keyboardVisible ? 'extraLarge' : 'large'}
            type='bold'
            color='white'
            style={{
              lineHeight: !keyboardVisible ? EXTRA_LARGE_SIZE_FONT * 1.2 : LARGE_SIZE_FONT * 1.2,
            }}
          >
            Como você vai entrar?
          </FancyText>
          <FancyText size={!keyboardVisible ? 'medium' : 'small'} type='medium' color='white'>
            Escolha uma opção. Você pode voltar e trocar depois.
          </FancyText>
        </View>
      )}
    >
      <View style={styles.content}>
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/create-voluntario-account')}
            style={styles.cardWrapper}
          >
            <View style={styles.badge}>
              <FancyText size='extraSmall' type='semiBold' color={Pallete.fonts.light}>
                Recomendado
              </FancyText>
            </View>
            <FancyCard.Image
              type='icon'
              props={{
                title: 'Tenho convite',
                subtitle: (
                  <FancyText
                    size='extraSmall'
                    type='medium'
                    color={Pallete.fonts.inactive}
                    numberOfLines={3}
                  >
                    Recebi um link ou código da minha igreja para entrar como voluntário.
                  </FancyText>
                ),
                additionalData1: (
                  <FancyText size='extraSmall' type='semiBold' color={Pallete.primary}>
                    Entrar em 30 segundos
                  </FancyText>
                ),
                cardIcon: {
                  library: 'MaterialCommunityIcons',
                  name: 'ticket-confirmation-outline',
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
                containerStyle: [styles.card, styles.cardHighlight],
                contentContainerStyle: styles.cardContent,
                centerContainerStyle: { gap: 6, paddingBottom: 5 },
                backgroundColor: Pallete.backgroundColor4,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/create-igreja-account')}
            style={styles.cardWrapper}
          >
            <FancyCard.Image
              type='icon'
              props={{
                title: 'Cadastrar igreja',
                subtitle: (
                  <FancyText
                    size='extraSmall'
                    type='medium'
                    color={Pallete.fonts.inactive}
                    numberOfLines={3}
                  >
                    Sou responsável. Vou configurar a igreja e convidar voluntários.
                  </FancyText>
                ),
                additionalData1: (
                  <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                    Leva ~3 minutos
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
                containerStyle: [styles.card, styles.cardSoftBlueBorder],
                contentContainerStyle: styles.cardContent,
                centerContainerStyle: { gap: 6, paddingBottom: 5 },
                backgroundColor: Pallete.backgroundColor4,
              }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <FancyButton
            type='text'
            label='Não sabe qual escolher?'
            onPress={() => setIsHelpModalVisible(true)}
            labelStyle={styles.footerLink}
            containerStyle={styles.footerLinkContainer}
          />
          <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.footerHint}>
            Ainda não recebeu convite? Peça ao seu líder para enviar.
          </FancyText>
        </View>
      </View>

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
              Tenho convite
            </FancyText>
            <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
              Se você vai participar de escalas, normalmente entra por convite.
            </FancyText>
          </View>
          <View style={styles.modalSection}>
            <FancyText size='small' type='semiBold'>
              Cadastrar igreja
            </FancyText>
            <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
              Se você organiza equipes e quer convidar pessoas, é por aqui.
            </FancyText>
          </View>
        </FancyModalDialog>
      )}
    </AuthScreen>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 0,
      justifyContent: 'center',
      borderColor: 'red',
    },
    fieldsContainer: {
      borderRadius: 15,
      borderColor: 'firebrick',
      padding: 24,
      gap: 20,
      backgroundColor: Pallete.backgroundColor,
      ...Pallete.shadows[200],
      justifyContent: 'center',
    },
    content: {
      width: '100%',
      gap: 18,
    },
    cardsContainer: {
      gap: 16,
    },
    cardWrapper: {
      position: 'relative',
    },
    card: {
      width: '100%',
      borderRadius: 30,
      borderWidth: 1,
      borderColor: Pallete.borderCard,
      ...Pallete.shadows[100],
    },
    cardHighlight: {
      borderColor: Pallete.primary,
      borderWidth: 1,
    },
    cardSoftBlueBorder: {
      borderColor: ColorUtils.withAlpha(Pallete.primary, 0.22),
    },
    badge: {
      position: 'absolute',
      right: 14,
      top: -8,
      backgroundColor: Pallete.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      zIndex: 2,
    },
    cardContent: {
      paddingTop: 10,
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      alignItems: 'center',
      gap: 6,
    },
    footerLink: {
      fontSize: 12,
    },
    footerLinkContainer: {
      height: 20,
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
