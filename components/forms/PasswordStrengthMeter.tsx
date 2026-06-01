import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type StrengthLevel = 'fraca' | 'média' | 'forte';

type StrengthResult = {
  level: StrengthLevel;
  /** Quantos dos 3 segmentos ficam preenchidos. */
  filled: number;
};

/**
 * Heurística simples de força de senha, alinhada à regra do site público
 * (mín. 8 caracteres com letra e número). Não bloqueia por símbolo — apenas
 * recompensa quem usa. Retorna o nível e quantas barras acender.
 */
function evaluateStrength(password: string): StrengthResult {
  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (len >= 8) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  // Senhas muito curtas são sempre fracas, independentemente da composição.
  if (len < 6) score = 0;

  if (score <= 1) return { level: 'fraca', filled: 1 };
  if (score === 2) return { level: 'média', filled: 2 };
  return { level: 'forte', filled: 3 };
}

type PasswordStrengthMeterProps = {
  password: string;
};

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const Pallete = usePallete();

  if (!password) return null;

  const { level, filled } = evaluateStrength(password);

  const levelColor =
    level === 'fraca' ? Pallete.error : level === 'média' ? Pallete.warning : Pallete.confirm;
  const emptyColor = ColorUtils.withAlpha(Pallete.fonts.inactive, 0.2);

  return (
    <View
      style={styles.container}
      accessibilityRole='text'
      accessibilityLabel={`Força da senha: ${level}`}
    >
      <View style={styles.bars}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[styles.bar, { backgroundColor: index < filled ? levelColor : emptyColor }]}
          />
        ))}
      </View>
      <FancyText size='extraSmall' type='medium' color={levelColor}>
        Senha {level}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  bars: {
    flexDirection: 'row',
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
