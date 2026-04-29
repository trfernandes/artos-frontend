import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancyDrawerItemHeader from './FancyDrawerItemHeader';
import { useState } from 'react';
import { DrawerItemData } from './MenuData';
import { router } from 'expo-router';

export default function FancyDrawerItem({
  isDefaultCollapsed,
  isChild,
  ...props
}: DrawerItemData & { isDefaultCollapsed?: boolean; onNavigate?: () => void; isChild?: boolean }) {
  const [isCollapsed, setCollapsed] = useState<boolean>(isDefaultCollapsed ?? true);

  const handleOnItemPress = (item: DrawerItemData) => {
    if (item.onPress) {
      if (item.onPress.type === 'GoToRoute' && item.onPress.routeName) {
        // Sempre usa push - o Drawer do Expo Router gerencia a pilha automaticamente
        router.push(item.onPress.routeName as any);
      } else if (item.onPress.type === 'RunMethod' && item.onPress.method) {
        item.onPress.method();
      }
    }

    props.onNavigate?.();
  };

  const isExpandable = Boolean(props.items && props.items.length > 0);

  return (
    <View style={[styles.container, isExpandable && styles.containerExpandable]}>
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
              <FancyDrawerItem {...item} isChild onNavigate={props.onNavigate} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 0, paddingVertical: 6, gap: 1 },
  containerExpandable: { paddingVertical: 8 },
  headerContainer: { height: 24, borderWidth: 0 },
  childrenContainer: { paddingHorizontal: 15 },
});
