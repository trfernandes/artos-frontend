import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CustomIconProps } from '../FancyIcons';
import { ThemePalette } from '../../constants/colors';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import FancyVerticalContainerCard, { FancyVerticalContainerCardProps } from '../cards/Vertical/FancyVerticalContainerCard';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface FancyContainerVerticalListProps {
  title: string;
  buttons?: { icon: CustomIconProps; onPress?: () => void }[];
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  listProps?: FancyVerticalContainerCardProps<any>;
}

export default function FancyContainerVerticalList({ ...props }: FancyContainerVerticalListProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <FancyText size={'small'} type='semiBold' style={styles.headerTitle}>
            {props.title}
          </FancyText>
        </View>

        {props.buttons && (
          <View style={styles.headerButtonsContainer}>
            {props.buttons.map((button, index) => (
              <FancyButton
                key={index}
                mode='icon'
                type='contained'
                icon={{ ...button.icon, color: palette.icons.light }}
                onPress={button.onPress}
                containerStyle={{ minHeight: 24, height: 24, minWidth: 24, width: 24 }}
                iconStyle={button.icon.style}
              />
            ))}
          </View>
        )}
      </View>
      <View style={styles.divider} />
      <View style={[styles.contentContainer, props.contentContainerStyle]}>
        <FancyVerticalContainerCard {...props.listProps!} />
      </View>
    </View>
  );
}

const DESIGN_MODE = 0;

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      // ...palette.shadows[200],
      backgroundColor: palette.backgroundColor,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 10,
      flex: 1,
    },
    headerContainer: {
      paddingLeft: 15,
      paddingRight: 12,
      paddingVertical: 8,
      borderWidth: DESIGN_MODE,
      borderColor: 'coral',
      gap: 10,
      flexDirection: 'row',
    },
    headerTitleContainer: { flex: 1, borderWidth: DESIGN_MODE, borderColor: 'pink', justifyContent: 'center' },
    headerTitle: { borderWidth: 0, borderColor: 'red' },
    headerButtonsContainer: {
      gap: 5,
      flexDirection: 'row',
      borderWidth: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    contentContainer: {
      borderWidth: DESIGN_MODE,
      borderColor: 'greenyellow',
      paddingHorizontal: 10,
      gap: 10,
      flex: 1,
    },
    listContentStyle: { gap: 10, borderWidth: 0, borderColor: 'magenta', paddingBottom: 10 },
    listContainerStyle: { borderWidth: 0, borderColor: 'gold', flex: 1 },
    divider: { height: 0.3, borderTopWidth: 1, borderColor: palette.border },
  });
}
