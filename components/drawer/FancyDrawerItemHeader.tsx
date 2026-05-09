import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyText from '../FancyText';
import { ThemePalette } from '../../constants/colors';
import DefaultIcons from '../FancyIcons';
import { DrawerItemData } from './MenuData';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function FancyDrawerItemHeader(
  props: { isCollapsed: boolean; onCollapsePress: () => void; onNavigate?: () => void } & DrawerItemData,
) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();

  const titleColor = isDark ? palette.fonts.light : palette.fonts.dark;
  const subtitleColor = isDark ? palette.fonts.light : palette.fonts.inactive;

  const handleOnItemPress = () => {
    if (props.onPress) {
      if (props.onPress.type === 'GoToRoute' && props.onPress.routeName) {
        // Sempre usa push - o Drawer do Expo Router gerencia a pilha automaticamente
        router.push(props.onPress.routeName as any);
      } else if (props.onPress.type === 'RunMethod' && props.onPress.method) {
        props.onPress.method();
      }
    }

    props.onNavigate?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }}
      onPress={() => {
        if (props.disabled) return;
        props.items && props.items.length > 0 ? props.onCollapsePress() : handleOnItemPress();
      }}
      disabled={props.disabled}
    >
      <View style={styles.iconContainer}>
        {props.logo && (
          <View style={{ alignItems: 'flex-start' }}>
            {props.logo.type === 'icon' && props.logo.value && (
              <DefaultIcons.Custom
                {...props.logo.value!}
                size={props.logo?.value.size || 20}
                color={props.logo?.value.color || titleColor}
                style={styles.icon}
              />
            )}
            {props.logo.type === 'logo' && props.logo.value && (
              <Image source={props.logo.value ?? { uri: props.logo.value }} style={{ width: 25, height: 25, borderRadius: 999 }} />
            )}
          </View>
        )}
      </View>
      <View style={styles.headerContainer}>
        <FancyText size={'small'} type='semiBold' color={titleColor}>
          {props.title}
        </FancyText>
        {props.subtitle && (
          <FancyText size={'small'} type='medium' color={subtitleColor} style={{ paddingTop: 0, opacity: isDark ? 0.9 : 1 }}>
            {` - ${props.subtitle}`}
          </FancyText>
        )}
      </View>
      {props.items && props.items.length > 0 && (
        <View style={styles.collapseContainer}>
          <DefaultIcons.Custom
            name={props.isCollapsed ? 'chevron-down' : 'chevron-up'}
            library='MaterialCommunityIcons'
            size={24}
            color={titleColor}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function createStyles(_palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderWidth: 0,
      alignItems: 'center',
      paddingHorizontal: 15,
      gap: 10,
      flex: 1,
      justifyContent: 'center',
    },
    iconContainer: { borderWidth: 0, borderColor: 'blue', minWidth: 22, alignItems: 'center' },
    icon: { textAlign: 'center', alignSelf: 'center', width: 20 },
    headerContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingTop: 2,
      borderColor: 'red',
    },
    collapseContainer: {},
  });
}
