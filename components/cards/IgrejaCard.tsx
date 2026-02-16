import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { Feather } from '@expo/vector-icons';
import FancyText from '../FancyText';
import FancyImage from '../images/FancyImage';
import { Pallete } from '../../constants/colors';
import { ResponseLoginIgrejaDto } from '../../domain/dtos/login/login.response';
import { IgrejaVoluntarioRoleEnum } from '../../domain/enums/Igreja/voluntario-role.enum';
import { useSairDaIgreja } from '../../hooks/useSairDaIgreja';

type IgrejaCardProps = {
  igreja: ResponseLoginIgrejaDto;
  onPress?: () => void;
};

const ROLE_LABELS: Record<IgrejaVoluntarioRoleEnum, string> = {
  ADMIN: 'Admin',
  LIDER: 'Lider',
  VOLUNTARIO: 'Voluntario',
};

export default function IgrejaCard({ igreja, onPress }: IgrejaCardProps) {
  const { sairDaIgreja, validateRole, isPending } = useSairDaIgreja();

  const initials = igreja.nome
    ? igreja.nome
        .split(' ')
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
    : 'IG';

  const handleSairConfirm = () => {
    if (!validateRole(igreja.role)) return;
    Alert.alert(
      'Sair da igreja',
      'Tem certeza que deseja sair desta igreja? Voce perdera acesso aos conteudos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => sairDaIgreja({ igrejaId: igreja.id, role: igreja.role }),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
      >
        {igreja.logoThumbUrl || igreja.logoUrl ? (
          <FancyImage
            source={{ uri: (igreja.logoThumbUrl || igreja.logoUrl) as string }}
            size={48}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <FancyText size='small' type='semiBold' style={styles.avatarText}>
              {initials}
            </FancyText>
          </View>
        )}

        <View style={styles.info}>
          <FancyText size='medium' type='semiBold' numberOfLines={1} style={styles.title}>
            {igreja.nome}
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
            {ROLE_LABELS[igreja.role] || 'Voluntario'}
          </FancyText>
        </View>
      </TouchableOpacity>

      <Menu>
        <MenuTrigger customStyles={{ triggerWrapper: styles.menuTrigger }}>
          <Feather name='more-vertical' size={18} color={Pallete.icons.inactive} />
        </MenuTrigger>
        <MenuOptions optionsContainerStyle={styles.menuOptions}>
          <MenuOption onSelect={handleSairConfirm} disabled={isPending}>
            <View style={styles.menuItem}>
              <Feather name='log-out' size={16} color={Pallete.error} />
              <FancyText size='small' type='medium' style={styles.menuTextDanger}>
                Sair da Igreja
              </FancyText>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Pallete.backgroundColor,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    borderRadius: 12,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Pallete.backgroundColor2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Pallete.primary,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Pallete.fonts.dark,
  },
  menuTrigger: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
  menuOptions: {
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Pallete.border,
    backgroundColor: Pallete.backgroundColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuTextDanger: {
    color: Pallete.error,
  },
});
