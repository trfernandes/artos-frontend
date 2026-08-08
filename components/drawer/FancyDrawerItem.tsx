import { StyleSheet, View } from 'react-native';
import FancyDrawerItemHeader from './FancyDrawerItemHeader';
import { useState } from 'react';
import { DrawerItemData } from './MenuData';

export default function FancyDrawerItem({
  isDefaultCollapsed,
  isChild,
  ...props
}: DrawerItemData & { isDefaultCollapsed?: boolean; onNavigate?: () => void; isChild?: boolean }) {
  const [isCollapsed, setCollapsed] = useState<boolean>(isDefaultCollapsed ?? true);

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
            <FancyDrawerItem key={index} {...item} isChild onNavigate={props.onNavigate} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 0, paddingVertical: 7, gap: 1 },
  containerExpandable: { paddingVertical: 4 },
  headerContainer: { height: 30, borderWidth: 0 },
  childrenContainer: { paddingHorizontal: 15 },
});
