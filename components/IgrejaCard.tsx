import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Importe seus componentes de design system aqui
import FancyText from './FancyText';
import FancyPopup from './popup/FancyPopup';
import { ThemePalette } from '../constants/colors';
import { usePallete } from '../hooks/usePallete';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useSairDaIgreja } from '../hooks/useSairDaIgreja';
import { IgrejaVoluntarioRoleEnum } from '../domain/enums/Igreja/voluntario-role.enum';
import { FancyAlert } from './modal/FancyAlert';

interface Igreja {
  id: string;
  nome: string;
  role: IgrejaVoluntarioRoleEnum;
  imagemUrl?: string;
}

interface IgrejaCardProps {
  igreja: Igreja;
  onPress: () => void;
}

export const IgrejaCard = ({ igreja, onPress }: IgrejaCardProps) => {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const { sairDaIgreja, validateRole, isPending } = useSairDaIgreja();

  const handleSair = () => {
    if (!validateRole(igreja.role)) return;

    FancyAlert.alert('Sair da Igreja', `Tem certeza que deseja sair de "${igreja.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => sairDaIgreja({ igrejaId: igreja.id, role: igreja.role }),
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar / Ícone */}
      <View style={styles.avatar}>
        <Feather name='home' size={24} color={Pallete.primary} />
      </View>

      {/* Informações */}
      <View style={styles.info}>
        <FancyText type='bold' size='medium' numberOfLines={1}>
          {igreja.nome}
        </FancyText>
        <FancyText size='small' color={Pallete.fonts.inactive}>
          {igreja.role}
        </FancyText>
      </View>

      {/* Menu de Contexto (3 pontinhos) */}
      <FancyPopup
        disabled={isPending}
        items={[
          {
            label: 'Sair da igreja',
            onPress: handleSair,
            icon: { library: 'Feather', name: 'log-out', size: 18, color: Pallete.fonts.dark },
          },
        ]}
        triggerComponent={
          <View style={styles.menuTrigger}>
            <Feather name='more-vertical' size={24} color={Pallete.fonts.dark} />
          </View>
        }
      />
    </TouchableOpacity>
  );
};

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.backgroundColor,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      // Sombra estilo iOS/Apple
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      // Sombra Android
      elevation: 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.backgroundColor2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    info: {
      flex: 1,
    },
    menuTrigger: {
      padding: 8,
    },
  });
}
