import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import FancyAvatarImage from '../../../images/FancyImage';
import FancyActionsList from '../../../list/FancyActionsList';
import { Pallete } from '../../../../constants/colors';
import FancyText from '../../../FancyText';
import { router } from 'expo-router';
import { AppImages } from '../../../../assets/app_images';

export default function DadosTab({
  onChangePasswordButtonPress,
  onDeleteAccountButtonPress,
}: {
  onChangePasswordButtonPress?: () => void;
  onDeleteAccountButtonPress?: () => void;
}) {
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
            style={{ backgroundColor: 'white', borderRadius: 100 }}
          />
          <View style={{ height: 5 }} />
          <FancyText type='semiBold' size='large'>
            {user?.user?.nome}
          </FancyText>
          <FancyText size='small' style={{ color: Pallete.fonts.inactive }}>
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
                color: Pallete.icons.dark,
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
                color: Pallete.icons.inactive,
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
                color: Pallete.icons.inactive,
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
