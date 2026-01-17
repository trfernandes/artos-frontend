import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StyleProp, ImageStyle, TouchableOpacity } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import DefaultIcons from '../FancyIcons';
import { router } from 'expo-router';
import FancyAvatarImage from '../images/FancyImage';
import { useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import { Operator, ValueType } from '../../domain/utils/query_utils';
import { useMemo } from 'react';
import { AppImages } from '../../assets/app_images';
import FancyDrawerIgrejaSelector from './FancyDrawerIgrejaSelector';

export default function FancyDrawerHeader() {
  const auth = useAuth();

  const params = useMemo(() => {
    if (!auth.user?.user?.id) return undefined;

    return {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL as const, value: auth.user.user.id },
          },
        ],
      },
    };
  }, [auth.user?.user?.id]);

  const { data } = useVoluntariosCrud({
    initialParams: params,
    autoFetch: true,
  });

  //   const profileCompletion = data && data.length > 0 ? calculateProfileCompletion(data?.[0]) : 0;

  return (
    <LinearGradient colors={['#3B82F6', '#234C90']} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.container}>
      <TouchableOpacity onPress={() => router.push('pessoal/perfil')} style={styles.contentContainer}>
        <View style={styles.dataContainer}>
          <View style={styles.infoContainer}>
            <FancyText size={'small'} type='medium' color={Pallete.fonts.light}>
              Olá,
            </FancyText>
            <FancyText size={'medium'} type='bold' color={Pallete.fonts.light}>
              {auth.user?.user?.nome}
            </FancyText>
            <FancyText size={'small'} type='semiBoldItalic' color={Pallete.fonts.light}>
              {auth.user?.user?.email}
            </FancyText>
          </View>
          <View style={styles.avatarContainer}>
            <FancyAvatarImage
              size={50}
              source={
                auth.user?.user?.fotoThumbUrl || auth.user?.user?.fotoUrl
                  ? { uri: auth.user?.user?.fotoThumbUrl || auth.user?.user?.fotoUrl || '' }
                  : AppImages.emptyProfile
              }
              style={styles.avatar as StyleProp<ImageStyle>}
            />
          </View>
          <DefaultIcons.Custom library='Feather' name='chevron-right' size={28} color={Pallete.fonts.light} />
        </View>        
        <FancyDrawerIgrejaSelector />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderColor: 'red',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    paddingTop: 16,
    paddingBottom: 26,
  },
  contentContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
    // paddingBottom: 5,
  },
  dataContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  infoContainer: {
    flex: 1,
    borderColor: 'rgb(255, 0, 204)',
    gap: 3,
    justifyContent: 'center',
  },
  avatarContainer: {
    borderColor: 'rgb(0, 255, 34)',
    justifyContent: 'center',
  },
  buttonContainer: {
    borderColor: 'rgb(0, 225, 255)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: { borderWidth: 0, maxHeight: 'auto', minHeight: 'auto', padding: 0, gap: 5 },
  avatar: {
    backgroundColor: 'white',
    height: 50,
    aspectRatio: 1,
    borderRadius: 100,
  },
});
