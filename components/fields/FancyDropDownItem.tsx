import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import FancyChips from '../FancyChips';
import { usePallete } from '../../hooks/usePallete';
import { Image } from 'expo-image';
import { AppImages } from '../../assets/app_images';

export interface DropDownItemTag {
  label: string;
  color: string;
}

export interface DropDownItemProps<ValueType> {
  title: string;
  subtitle?: string;
  value: ValueType;
  selected?: boolean;
  left?: { type: 'image'; source: string } | { type: 'icon'; icon: CustomIconProps } | undefined;
  /** Tags de status abaixo do título (ex: "Possui função" / "Indisponível"). */
  tags?: DropDownItemTag[];
  onPress?: () => void;
}

export default function FancyDropDownItem<ValueItem>(props: DropDownItemProps<ValueItem>) {
  const Pallete = usePallete();
  return (
    <TouchableOpacity
      style={[styles.container, props.selected && styles.selected]}
      onPress={props.onPress}
    >
      {props.left &&
        (props.left?.type === 'icon' ? (
          <DefaultIcons.Custom
            color={Pallete.fonts.dark}
            {...(props.left.icon as CustomIconProps)}
          />
        ) : (
          <Image
            source={props.left.source ? { uri: props.left.source || '' } : AppImages.emptyProfile}
            style={{ width: 30, height: 30, borderRadius: 100 }}
          />
        ))}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
          <FancyText size={'small'} type={!props.selected ? 'medium' : 'bold'}>
            {props.title}
          </FancyText>
          {props.subtitle && (
            <FancyText size={'extraSmall'} type={'mediumItalic'} color={Pallete.fonts.inactive}>
              {props.subtitle}
            </FancyText>
          )}
        </View>
        {props.tags && props.tags.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {props.tags.map((tag, index) => (
              <FancyChips key={index} label={tag.label} color={tag.color} size='small' />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  selected: { backgroundColor: 'rgba(59, 130, 246, 0.16)' },
});
