import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TabItem } from './FancyTabs';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export type FancyTabHeaderItemProps = {
  status: 'active' | 'inactive';
  onPress?: () => void;
  multiRow?: boolean;
} & TabItem;

export default function FancyTabHeaderItem({ status = 'active', multiRow, ...props }: FancyTabHeaderItemProps) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        status === 'active' ? styles.containerActive : styles.containerInactive,
        multiRow && styles.containerMultiRow,
      ]}
      onPress={props.onPress}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {props.icon && (
          <View style={styles.iconContainer}>
            <DefaultIcons.Custom
              {...props.icon}
              size={props.icon.size || 18}
              color={props.icon.color || (status === 'active' ? Pallete.fonts.light : Pallete.fonts.inactive)}
            />
          </View>
        )}
        <View style={styles.titleContaner}>
          <FancyText
            type={status === 'active' ? 'semiBold' : 'semiBoldItalic'}
            size={'extraSmall'}
            numberOfLines={1}
            style={{
              borderWidth: 0,
              lineHeight: 17,
              color: status === 'active' ? Pallete.fonts.light : Pallete.fonts.inactive,
            }}
          >
            {props.title}
          </FancyText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    container: {
      borderRadius: 50,
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto',
      minWidth: 80,
      gap: 6,
    },
    containerMultiRow: {
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: '48%',
      maxWidth: '48%',
      minWidth: 0,
    },
    containerActive: { backgroundColor: Pallete.primary },
    containerInactive: {
      borderWidth: 0.2,
      borderColor: Pallete.border,
      backgroundColor: Pallete.backgroundColor2,
    },
    iconContainer: { justifyContent: 'center', alignItems: 'center' },
    titleContaner: { justifyContent: 'center' },
  });
}
