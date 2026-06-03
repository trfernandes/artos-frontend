import { StyleSheet, View } from 'react-native';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import FancyImage from '../images/FancyImage';
import DefaultIcons from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

interface ConviteIgrejaCardProps {
  igreja: { nome: string; logoUrl?: string | null };
  autoApprove?: boolean;
  expiresAt?: string | null;
  /** Quando definido, mostra o botão X para o usuário trocar de código. */
  onRemove?: () => void;
}

export default function ConviteIgrejaCard({
  igreja,
  autoApprove,
  expiresAt,
  onRemove,
}: ConviteIgrejaCardProps) {
  const Pallete = usePallete();

  const expiresText = expiresAt
    ? formatInTimeZone(new Date(expiresAt), 'America/Sao_Paulo', "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : null;

  return (
    <View
      style={[
        styles.card,
        Pallete.shadows[200],
        {
          backgroundColor: Pallete.backgroundColor,
          borderWidth: 1.5,
          borderColor: Pallete.primary,
        },
      ]}
    >
      <View style={styles.row}>
        {igreja.logoUrl ? (
          <FancyImage source={{ uri: igreja.logoUrl }} size={48} style={styles.logo} />
        ) : (
          <View
            style={[
              styles.logoFallback,
              { backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.12) },
            ]}
          >
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='church'
              size={24}
              color={Pallete.primary}
            />
          </View>
        )}

        <View style={styles.textColumn}>
          <FancyText type='semiBold' size='small' color={Pallete.fonts.dark}>
            {igreja.nome}
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={Pallete.primary}>
            Você foi convidado!
          </FancyText>
          <FancyText
            size='extraSmall'
            style={{ color: autoApprove ? Pallete.confirm : Pallete.warning }}
          >
            {autoApprove ? 'Aprovação automática' : 'Requer aprovação da liderança'}
          </FancyText>
          {expiresText && (
            <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
              Válido até: {expiresText}
            </FancyText>
          )}
        </View>

        {onRemove && (
          <FancyButton
            type='text'
            onPress={onRemove}
            icon={{ library: 'Ionicons', name: 'close', size: 18 }}
            containerStyle={styles.removeButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    borderRadius: 24,
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  removeButton: {
    minHeight: 44,
    minWidth: 44,
    alignSelf: 'center',
    marginRight: -8,
  },
});
