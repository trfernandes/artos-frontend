import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AuthLayout from '../../components/pages/login/AuthLayout';
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
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  return (
    <AuthLayout
      showBackButton
      title='Como você vai entrar?'
      subtitle='Escolha uma opção. Você pode voltar e trocar depois.'
    >
      <View style={styles.content}>
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/create-voluntario-account')}
            style={styles.cardWrapper}
          >
            <FancyCard.Image
              type='icon'
              props={{
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
                  <FancyText size='extraSmall' type='semiBold' color={Pallete.primary}>
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
                containerStyle: [styles.card, styles.cardHighlight],
                contentContainerStyle: styles.cardContent,
                centerContainerStyle: { gap: 6, paddingBottom: 5 },
                backgroundColor: Pallete.backgroundColor4,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/admin-discovery')}
            style={styles.cardWrapper}
          >
            <FancyCard.Image
              type='icon'
              props={{
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
                  <FancyText size='extraSmall' type='semiBold' color={Pallete.secondary}>
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
            type='outlined'
            label='Já tenho conta'
            onPress={() => router.push('/(auth)/login')}
            containerStyle={styles.loginButton}
          />
          <FancyButton
            type='text'
            label='Não sabe qual escolher?'
            onPress={() => setIsHelpModalVisible(true)}
            labelStyle={styles.footerLink}
            containerStyle={styles.footerLinkContainer}
          />
          <FancyText size='small' color={Pallete.fonts.inactive} style={styles.footerHint}>
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
    </AuthLayout>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    content: {
      width: '100%',
      gap: 18,
    },
    cardsContainer: {
      gap: 16,
    },
    cardWrapper: {
      position: 'relative',
      minHeight: 110,
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
    cardContent: {
      paddingTop: 10,
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      alignItems: 'center',
      gap: 8,
    },
    loginButton: {
      alignSelf: 'stretch',
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
