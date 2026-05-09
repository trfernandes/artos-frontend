import { View, StyleSheet } from 'react-native';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';

type TabValue = 'pendentes' | 'respondidas' | 'todas';

const TEXTS: Record<TabValue, { emoji: string; title: string; subtitle: string }> = {
  pendentes: {
    emoji: '✨',
    title: 'Tudo em dia!',
    subtitle: 'Você não tem solicitações pendentes no momento.',
  },
  respondidas: {
    emoji: '📋',
    title: 'Sem histórico ainda',
    subtitle: 'Solicitações que você respondeu aparecerão aqui.',
  },
  todas: {
    emoji: '📋',
    title: 'Sem solicitações',
    subtitle: 'Quando alguém pedir substituição pra você, aparecerá aqui.',
  },
};

export default function SubstituicoesEmptyState({ tab }: { tab: TabValue }) {
  const palette = usePallete();
  const { emoji, title, subtitle } = TEXTS[tab];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: palette.backgroundColor2 }]}>
        <FancyText size={40}>{emoji}</FancyText>
      </View>
      <FancyText type='bold' size='medium' style={styles.title}>
        {title}
      </FancyText>
      <FancyText size='small' color={palette.fonts.inactive} style={styles.subtitle}>
        {subtitle}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
