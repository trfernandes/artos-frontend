import { StyleSheet, TouchableOpacity, View, ImageSourcePropType } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { Image } from 'expo-image';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type FancyVerticalImageCardProps = {
  source?: ImageSourcePropType;
  selected?: boolean;
  imageSize?: number;
  highlighted?: boolean;
  topRightIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
  topLeftIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle' | 'containerStyle' | 'additionalElement'>;

export default function FancyVerticalImageCard({
  selected = false,
  source,
  imageSize,
  topRightIcon,
  topLeftIcon,
  containerStyle,
  highlighted = false,
  ...props
}: FancyVerticalImageCardProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <FancyVerticalCard
      cardHeight={125}
      topElement={source && <ImageComponent source={source} highlighted={highlighted} />}
      contentContainerStyle={{}}
      {...props}
      containerStyle={[containerStyle, selected && styles.selected]}
    />
  );
}

export function ImageComponent({
  source,
  highlighted = false,
}: {
  source: ImageSourcePropType;
  highlighted?: boolean;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 9999,
        ...palette.shadows[200],
      }}
    >
      {source ? <Image source={source} style={styles.image} contentFit='fill' /> : null}
    </View>
  );
}

export function TopLeftMenuButton({
  customIcon,
  onPress,
}: {
  customIcon?: CustomIconProps;
  onPress?: () => void;
}) {
  const palette = usePallete();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: `100%`,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
      }}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='dots-vertical'
        {...customIcon}
        size={customIcon?.size || 18}
        color={customIcon?.color || palette.icons.dark}
      />
    </TouchableOpacity>
  );
}

export function TopRightMenuButton({
  customIcon,
  onPress,
}: {
  customIcon?: CustomIconProps;
  onPress?: () => void;
}) {
  const palette = usePallete();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: `100%`,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
      }}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='dots-vertical'
        {...customIcon}
        size={customIcon?.size || 18}
        color={customIcon?.color || palette.icons.dark}
      />
    </TouchableOpacity>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    selected: { backgroundColor: palette.selected },
    image: {
      borderRadius: 9999,
      aspectRatio: 1,
      width: '50%',
    },
  });
}
