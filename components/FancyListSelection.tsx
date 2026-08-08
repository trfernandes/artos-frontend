import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import FancyText from './FancyText';
import DefaultIcons from './FancyIcons';
import { ThemePalette } from '../constants/colors';
import { usePallete } from '../hooks/usePallete';
import { useThemedStyles } from '../hooks/useThemedStyles';

export type FancyListSelectionProps = {
  items: { index: number; label: string; checked: boolean }[];
  showDividers?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  onPress: (index: number) => void;
};

export default function FancyListSelection({
  items,
  onPress,
  showDividers,
  containerStyle,
}: FancyListSelectionProps) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.container, containerStyle]}>
      {items &&
        items.map((item, index) => (
          <Pressable
            style={[
              styles.item,
              { borderTopWidth: showDividers && index > 0 && index < items.length ? 0.5 : 0 },
            ]}
            key={index}
            onPress={() => {
              onPress(item.index);
            }}
          >
            <FancyText
              size='small'
              type='medium'
              style={{ lineHeight: 18 }}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {item.label}
            </FancyText>
            {item.checked && (
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='check-bold'
                size={20}
                color={Pallete.primary}
              />
            )}
          </Pressable>
        ))}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { paddingHorizontal: 0 },
    item: {
      borderColor: palette.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingRight: 18,
      paddingVertical: 10,
    },
  });
}
