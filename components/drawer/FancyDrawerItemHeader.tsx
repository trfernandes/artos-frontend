import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import DefaultIcons from '../FancyIcons';
import { DrawerItemData } from './FancyDrawer';

export default function FancyDrawerItemHeader(
  props: { isCollapsed: boolean; onCollapsePress: () => void } & DrawerItemData
) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        props.items && props.items.length > 0 ? props.onCollapsePress() : props.onPress?.();
      }}
    >
      <View style={styles.iconContainer}>
        {props.icon && (
          <View style={{ alignItems: 'flex-start' }}>
            <DefaultIcons.Custom
              {...props.icon!}
              size={props.icon?.size || 20}
              color={props.icon?.color || Pallete.fonts.dark}
              style={styles.icon}
            />
          </View>
        )}
      </View>
      <View style={styles.headerContainer}>
        <FancyText
          size={'small'}
          type="semiBold"
          color={Pallete.fonts.dark}
          style={{ borderWidth: 0, lineHeight: undefined, paddingBottom: 1 }}
        >
          {props.label}
        </FancyText>
      </View>
      {props.items && props.items.length > 0 && (
        <View style={styles.collapseContainer}>
          {/* <TouchableOpacity onPress={() => props.onCollapsePress()}> */}
          <DefaultIcons.Custom
            name={props.isCollapsed ? 'chevron-down' : 'chevron-up'}
            library="MaterialCommunityIcons"
            size={24}
            color={Pallete.fonts.dark}
          />
          {/* </TouchableOpacity> */}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: { borderWidth: 0, borderColor: 'blue' },
  icon: { textAlign: 'center', alignSelf: 'flex-start', width: 25 },
  headerContainer: { flex: 1, justifyContent: 'center', paddingTop: 2, borderWidth: 0, borderColor: 'red' },
  collapseContainer: {},
});
