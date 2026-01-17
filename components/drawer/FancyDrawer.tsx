import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import FancyDrawerHeader from './FancyDrawerHeader';
import FancyDrawerItem from './FancyDrawerItem';
import FancyDrawerSeparator from './FancyDrawerSeparator';
import FancyScrollView from '../FancyScrollView';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuForUser } from './MenuData';

export type FancyDrawerProps = {} & DrawerContentComponentProps;

export default function FancyDrawer(props: FancyDrawerProps) {
  const { user, signOut } = useAuth();
  const { navigation } = props;

  const menuSections = useMemo(() => getMenuForUser(user!), [user]);

  const firstExpandableIndex = useMemo(() => {
    let index = 0;
    for (const section of menuSections) {
      for (const item of section.items) {
        const isExpandable = Boolean(item.items && item.items.length);
        if (isExpandable) {
          return index;
        }
        index += 1;
      }
    }
    return -1;
  }, [menuSections]);

  let itemRunningIndex = -1;

  const sections = useMemo(() => {
    return menuSections.map((section, sectionIndex) => (
      <View key={sectionIndex}>
        <FancyDrawerSeparator label={section.section} />
        {section.items.map((item, itemIndex) => {
          itemRunningIndex += 1;
          const isExpandable = Boolean(item.items && item.items.length);
          const defaultCollapsed = isExpandable ? itemRunningIndex != firstExpandableIndex : undefined;

          return (
            <FancyDrawerItem
              key={`${sectionIndex}-${itemIndex}`}
              {...item}
              isDefaultCollapsed={defaultCollapsed}
              onNavigate={() => navigation.closeDrawer?.()}
            />
          );
        })}
      </View>
    ));
  }, [menuSections, firstExpandableIndex, navigation, itemRunningIndex]);

  return (
    <View style={styles.container}>
      <FancyDrawerHeader />
      <View
        style={{
          width: '100%',
          flex: 1,
          borderColor: 'red',
          zIndex: 10,
          marginTop: -15,
        }}
      >
        <FancyScrollView
          topFade={{ style: { borderTopStartRadius: 15, borderTopEndRadius: 15, borderWidth: 0 } }}
          showsVerticalScrollIndicator={true}
          style={styles.menuContainer}
          contentContainerStyle={{ borderRadius: 15, paddingHorizontal: 8, paddingTop: 10 }}
        >
          {sections}

          <FancyDrawerSeparator label={'Outros'} />
          <FancyDrawerItem
            title='Sair'
            logo={{
              type: 'icon',
              value: { name: 'logout', library: 'MaterialCommunityIcons', size: 20 },
            }}
            onPress={{ type: 'RunMethod', method: signOut }}
            onNavigate={() => navigation.closeDrawer?.()}
          />
        </FancyScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  menuContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 3,
    borderRadius: 15,
  },
});
