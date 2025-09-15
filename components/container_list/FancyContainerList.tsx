import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CustomIconProps } from '../FancyIcons';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import FancyList, { FancyListProps } from '../list/FancyList';
import FancySeparator from '../FancySeparator';

export interface FancyContainerListProps<ItemT>
  extends Pick<FancyListProps<ItemT>, 'data' | 'renderItem' | 'containerStyle' | 'contentContainerStyle'> {
  title: string;
  buttons?: { icon: CustomIconProps; onPress?: () => void }[];
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showDivider?: boolean;
}

export default function FancyContainerList<ItemT>({ showDivider = false, ...props }: FancyContainerListProps<ItemT>) {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <FancyText size={'medium'} type="semiBold" style={styles.headerTitle}>
            {props.title}
          </FancyText>
        </View>

        {props.buttons && (
          <View style={styles.headerButtonsContainer}>
            {props.buttons.map((button, index) => (
              <FancyButton
                key={index}
                mode="icon"
                type="contained"
                icon={{ ...button.icon, color: Pallete.icons.light }}
                onPress={button.onPress}
                containerStyle={{ minHeight: 25, height: 25, minWidth: 25, width: 25 }}
                iconStyle={button.icon.style}
              />
            ))}
          </View>
        )}
      </View>
      <View style={styles.divider} />
      <View style={[styles.contentContainer, props.contentContainerStyle]}>
        <FancyList<ItemT>
          {...props}
          contentContainerStyle={[styles.listContentStyle, props.contentContainerStyle]}
          ItemSeparatorComponent={() => showDivider && <FancySeparator style={{ marginTop: 10, borderWidth: 0 }} />}
          containerStyle={[styles.listContainerStyle, props.containerStyle]}
        />
      </View>
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    ...Pallete.shadows[100],
    backgroundColor: Pallete.backgroundColor,
    borderWidth: 1,
    borderColor: Pallete.border,
    borderRadius: 10,
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  divider: { height: 0.3, borderTopWidth: 1, borderColor: Pallete.border },
});
