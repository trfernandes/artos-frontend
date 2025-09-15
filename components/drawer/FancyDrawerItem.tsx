import { StyleSheet, View } from 'react-native';
import FancyDrawerItemHeader from './FancyDrawerItemHeader';
import { useState } from 'react';
import { DrawerItemData } from './FancyDrawer';

export default function FancyDrawerItem(props: DrawerItemData) {
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <FancyDrawerItemHeader {...props} isCollapsed={isCollapsed} onCollapsePress={() => setCollapsed(!isCollapsed)} />
      </View>
      {props.items && props.items.length > 0 && !isCollapsed && (
        <View style={styles.childrenContainer}>
          {props.items?.map((item, index) => (
            <FancyDrawerItem key={index} {...item} />
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
