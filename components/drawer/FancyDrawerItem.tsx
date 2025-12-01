import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyDrawerItemHeader from './FancyDrawerItemHeader';
import { useState } from 'react';
import { DrawerItemData } from './MenuData';
import { router } from 'expo-router';

export default function FancyDrawerItem({
  isDefaultCollapsed,
  ...props
}: DrawerItemData & { isDefaultCollapsed?: boolean; onNavigate?: () => void }) {
  const [isCollapsed, setCollapsed] = useState<boolean>(isDefaultCollapsed ?? true);

  const handleOnItemPress = (item: DrawerItemData) => {
    if (item.onPress) {
      if (item.onPress.type === 'GoToRoute' && item.onPress.routeName) {
        router.push(item.onPress.routeName);
      } else if (item.onPress.type === 'RunMethod' && item.onPress.method) {
        item.onPress.method();
      }
    }

    props.onNavigate?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <FancyDrawerItemHeader
          {...props}
          isCollapsed={isCollapsed}
          onCollapsePress={() => setCollapsed(!isCollapsed)}
          onNavigate={props.onNavigate}
        />
      </View>
      {props.items && props.items.length > 0 && !isCollapsed && (
        <View style={styles.childrenContainer}>
          {props.items?.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleOnItemPress(item)}>
              <FancyDrawerItem {...item} onNavigate={props.onNavigate} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 0, paddingVertical: 6, gap: 5 },
  headerContainer: { height: 30, borderWidth: 0 },
  childrenContainer: { paddingHorizontal: 15 },
});
