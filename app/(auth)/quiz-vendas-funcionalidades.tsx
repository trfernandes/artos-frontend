import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import FancyPageView from '../../components/containers/FancyPageView';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

const FEATURES = [
  {
    title: 'Escala automática',
    description: 'O app monta a escala considerando disponibilidade e função de cada voluntário.',
  },
  {
    title: 'Lembrete automático',
    description: 'Notificações cuidam do lembrete que hoje é feito manualmente por WhatsApp.',
  },
  {
    title: 'Tudo num só lugar',
    description: 'Ministérios, voluntários, escala e repertório no mesmo app.',
  },
  {
    title: 'Cada ministério, seu espaço',
    description: 'Louvor, mídia, recepção — cada um com sua própria organização.',
  },
] as const;

// Scaffold estrutural — carrossel/mockup visual definido na conversa é etapa de UX separada.
export default function QuizVendasFuncionalidadesPage() {
  const Pallete = usePallete();

  return (
    <FancyPageView>
      <View style={styles.content}>
        <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
          O que o Diakonia faz por você
        </FancyText>

        <View style={styles.list}>
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={[styles.card, { borderColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.12) }]}
            >
              <FancyText size='small' type='semiBold' color={Pallete.fonts.dark}>
                {feature.title}
              </FancyText>
              <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                {feature.description}
              </FancyText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <FancyButton
          label='Criar minha conta'
          onPress={() => router.push('/(auth)/create-account')}
        />
        <FancyButton
          type='text'
          label='Já tenho conta'
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
  },
  list: {
    gap: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  footer: {
    gap: 10,
    paddingBottom: 8,
  },
});
