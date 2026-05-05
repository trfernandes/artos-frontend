import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import FancyAvatarImage from '../../../images/FancyImage';
import FancyActionsList from '../../../list/FancyActionsList';
import FancyText from '../../../FancyText';
import { router } from 'expo-router';
import { AppImages } from '../../../../assets/app_images';
import { usePallete } from '../../../../hooks/usePallete';

export default function DadosTab({
  onChangePasswordButtonPress,
  onDeleteAccountButtonPress,
}: {
  onChangePasswordButtonPress?: () => void;
  onDeleteAccountButtonPress?: () => void;
}) {
  const palette = usePallete();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: 20, gap: 30, flex: 1 }}>
        <View style={styles.center}>
          <FancyAvatarImage
            source={
              user?.user?.fotoThumbUrl || user?.user?.fotoUrl
                ? { uri: user?.user?.fotoThumbUrl || user?.user?.fotoUrl || '' }
                : AppImages.emptyProfile
            }
            size={120}
            style={{ backgroundColor: palette.backgroundColor3, borderRadius: 100 }}
          />
          <View style={{ height: 5 }} />
          <FancyText type='semiBold' size='large'>
            {user?.user?.nome}
          </FancyText>
          <FancyText size='small' style={{ color: palette.fonts.inactive }}>
            {user?.user?.email}
          </FancyText>
        </View>

        <FancyActionsList
          actions={[
            {
              icon: {
                library: 'FontAwesome6',
                name: 'user-pen',
                size: 13,
                color: palette.icons.dark,
                style: { borderWidth: 0, marginTop: -1 },
              },
              label: 'Editar perfil',
              onPress: () => router.push('/pessoal/perfil/edit'),
            },
            {
              icon: {
                library: 'FontAwesome6',
                name: 'user-lock',
                size: 13,
                color: palette.icons.inactive,
                style: { borderWidth: 0, marginTop: -1 },
              },
              label: 'Alterar senha',
              onPress: onChangePasswordButtonPress,
            },
            {
              icon: {
                library: 'FontAwesome6',
                name: 'user-xmark',
                size: 13,
                color: palette.icons.inactive,
                style: { borderWidth: 0, marginTop: -1 },
              },
              label: 'Excluir conta',
              onPress: onDeleteAccountButtonPress,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    gap: 6,
  },
});
