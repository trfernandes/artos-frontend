import { View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Pallete } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import FancyButton from '../buttons/FancyButton';
import FancyAvatarImage from './FancyImage';
import DefaultIcons from '../FancyIcons';

export interface FancyImagePickerProps {
  value?: string | null; // pode ser URL (Cloudinary) ou uri local (file:///)
  size?: number;
  disabled?: boolean;
  onChange?: (image: ImagePicker.ImagePickerAsset | undefined) => void;
}

export default function FancyImagePicker({
  value,
  size = 120,
  disabled,
  onChange,
}: FancyImagePickerProps) {
  const palette = usePallete();
  const ensureMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      return false;
    }
    return true;
  };

  const ensureCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para usar a câmera.');
      return false;
    }
    return true;
  };

  const handlePickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      onChange?.(undefined);
      return;
    }

    onChange?.(result.assets[0]);
  };

  const pickImageFromLibrary = async () => {
    try {
      const hasPermission = await ensureMediaLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      handlePickerResult(result);
    } catch (error) {
      console.log('Erro ao selecionar imagem da galeria:', error);
      onChange?.(undefined);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      handlePickerResult(result);
    } catch (error) {
      console.log('Erro ao capturar imagem:', error);
      onChange?.(undefined);
    }
  };

  const pickImage = () => {
    Alert.alert('Selecionar foto', 'Escolha como deseja atualizar sua foto de perfil.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: pickImageFromCamera },
      { text: 'Galeria', onPress: pickImageFromLibrary },
    ]);
  };

  const removeImage = () => {
    onChange?.(undefined);
  };

  return (
    <View style={[styles.container, Pallete.shadows[100]]}>
      <View
        style={{
          ...Pallete.shadows[200],
          borderWidth: 0.5,
          borderColor: palette.border,
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
          backgroundColor: palette.backgroundColor2,
        }}
      >
        {/* IMPORTANTE: avatar e ícone "camera-off" ficam SEMPRE montados; só a
            opacity alterna. Montar/desmontar (ou trocar o tipo) deste slot ao
            remover a foto faz o Android crashar com "addViewAt: failed to insert
            view into parent at index", especialmente quando a tela é desmontada
            logo depois (router.back() após salvar). */}
        <FancyAvatarImage
          source={{ uri: value ?? '' }}
          size={size}
          style={{ opacity: value ? 1 : 0 }}
        />
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: value ? 0 : 1,
          }}
        >
          <DefaultIcons.Custom
            library='Feather'
            name='camera-off'
            color={palette.icons.inactive}
            size={45}
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <FancyButton
          icon={{ library: 'Entypo', name: 'images', size: 15 }}
          containerStyle={{
            minWidth: 26,
            minHeight: 26,
            width: 35,
            height: 35,
            padding: 0,
            paddingHorizontal: 0,
          }}
          onPress={pickImage}
          disabled={disabled}
        />
        <FancyButton
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'image-remove',
            color: !value && !disabled ? palette.icons.light : palette.icons.inactive,
            size: 15,
          }}
          disabled={!value || disabled}
          containerStyle={[
            {
              paddingHorizontal: 0,
              minWidth: 26,
              minHeight: 26,
              width: 35,
              height: 35,
              borderWidth: 0,
            },
            !value && !disabled
              ? { backgroundColor: palette.terciary }
              : { backgroundColor: palette.buttons.inactive },
          ]}
          onPress={removeImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonsContainer: {
    justifyContent: 'center',
    gap: 8,
  },
});
