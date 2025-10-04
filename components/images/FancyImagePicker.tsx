import { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Pallete } from '../../constants/colors';
import FancyButton from '../buttons/FancyButton';
import FancyImage from './FancyImage';
import DefaultIcons from '../FancyIcons';

export interface FancyImagePickerProps {
  value?: string | null;
  size?: number;
  disabled?: boolean;
  onChange?: (image: ImagePicker.ImagePickerAsset | undefined) => void;
}

export default function FancyImagePicker({ value, size = 120, disabled, onChange }: FancyImagePickerProps) {
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        onChange?.(result.assets[0]);
      }
    } catch (error) {
      console.log('Erro ao selecionar imagem:', error);
    }
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
          borderColor: Pallete.border,
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
          backgroundColor: Pallete.backgroundColor2,
        }}
      >
        {value ? (
          <FancyImage source={{ uri: value }} size={size} />
        ) : (
          <DefaultIcons.Custom library="Feather" name="camera-off" color={Pallete.icons.inactive} size={45} />
        )}
      </View>
      <View style={styles.buttonsContainer}>
        <FancyButton
          icon={{ library: 'Entypo', name: 'images', size: 18 }}
          containerStyle={{ minWidth: 26, minHeight: 26, width: 35, height: 35 }}
          iconStyle={{ marginLeft: -1, marginTop: 0 }}
          onPress={pickImage}
          disabled={disabled}
        />
        <FancyButton
          icon={{
            library: 'MaterialCommunityIcons',
            name: 'image-remove',
            color: !value && !disabled ? Pallete.icons.light : Pallete.icons.inactive,
            size: 18,
          }}
          iconStyle={{ marginLeft: -1, marginTop: -1 }}
          disabled={!value || disabled}
          containerStyle={[
            {
              minWidth: 26,
              minHeight: 26,
              width: 35,
              height: 35,
              borderWidth: 0,
            },
            !value && !disabled ? { backgroundColor: Pallete.terciary } : { backgroundColor: Pallete.buttons.inactive },
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
