import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import DefaultIcons from '../FancyIcons';
import { DrawerItemData } from './MenuData';
import { router } from 'expo-router';
import { Image } from 'expo-image';

export default function FancyDrawerItemHeader(props: { isCollapsed: boolean; onCollapsePress: () => void } & DrawerItemData) {
  const handleOnItemPress = () => {
    if (props.onPress) {
      if (props.onPress.type === 'GoToRoute' && props.onPress.routeName) {
        router.push(props.onPress.routeName);
      } else if (props.onPress.type === 'RunMethod' && props.onPress.method) {
        props.onPress.method();
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        props.items && props.items.length > 0 ? props.onCollapsePress() : handleOnItemPress();
      }}
    >
      <View style={styles.iconContainer}>
        {props.logo && (
          <View style={{ alignItems: 'flex-start' }}>
            {props.logo.type === 'icon' && props.logo.value && (
              <DefaultIcons.Custom
                {...props.logo.value!}
                size={props.logo?.value.size || 20}
                color={props.logo?.value.color || Pallete.fonts.dark}
                style={styles.icon}
              />
            )}
            {props.logo.type === 'logo' && props.logo.value && (
              <Image source={{ uri: props.logo.value }} style={{ width: 25, height: 25, borderRadius: 999 }} />
            )}
          </View>
        )}
      </View>
      <View style={styles.headerContainer}>
        <FancyText size={'small'} type="semiBold" color={Pallete.fonts.dark}>
          {props.title}
        </FancyText>
        {props.subtitle && (
          <FancyText size={'small'} type="medium" color={Pallete.fonts.inactive} style={{ paddingTop: 0 }}>
            {` - ${props.subtitle}`}
          </FancyText>
        )}
      </View>
      {props.items && props.items.length > 0 && (
        <View style={styles.collapseContainer}>
          <DefaultIcons.Custom
            name={props.isCollapsed ? 'chevron-down' : 'chevron-up'}
            library="MaterialCommunityIcons"
            size={24}
            color={Pallete.fonts.dark}
          />
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
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 2,
    borderColor: 'red',
  },
  collapseContainer: {},
});
