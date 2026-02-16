import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import FancyText from '../../FancyText';
import FancyAvatarImage from '../../images/FancyImage';
import { Pallete } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { AppImages } from '../../../assets/app_images';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DashboardGreetingProps = {
  nome: string;
  subtitulo?: string;
};

export default function DashboardGreeting({ nome, subtitulo }: DashboardGreetingProps) {
  const { user } = useAuth();
  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });
  const hojeCapitalizado = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  const fotoUrl = user?.user?.fotoThumbUrl || user?.user?.fotoUrl;
  const source = fotoUrl ? { uri: fotoUrl } : AppImages.emptyProfile;

  return (
    <LinearGradient
      colors={['#3B82F6', '#234C90']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.row}>
        <View style={styles.textGroup}>
          <FancyText size="extraSmall" type="mediumItalic" color="rgba(255,255,255,0.65)">
            {hojeCapitalizado}
          </FancyText>

          <View style={styles.nameGroup}>
            <FancyText
              size="large"
              type="bold"
              color={Pallete.fonts.light}
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.nameText}
            >
              {nome}
            </FancyText>
            {subtitulo && (
              <FancyText
                size="extraSmall"
                type="medium"
                color="rgba(255,255,255,0.8)"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.subtitleText}
              >
                {subtitulo}
              </FancyText>
            )}
          </View>
        </View>

        <Pressable onPress={() => router.push('pessoal/perfil')}>
          <FancyAvatarImage
            source={source}
            size={36}
            style={styles.avatar}
          />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Pallete.shadows[200],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    gap: 5,
    marginRight: 10,
  },
  nameGroup: {
    minWidth: 0,
    flexShrink: 1,
    gap: 2,
  },
  nameText: {
    flexShrink: 1,
  },
  subtitleText: {
    flexShrink: 1,
  },
  avatar: {
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
});
