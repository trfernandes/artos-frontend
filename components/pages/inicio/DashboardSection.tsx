import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

type DashboardSectionProps = {
  title: string;
  badge?: number;
  onVerMais?: () => void;
  children: React.ReactNode;
};

export default function DashboardSection({ title, badge, onVerMais, children }: DashboardSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FancyText size="small" type="semiBold" color={Pallete.fonts.inactive}>
            {title}
          </FancyText>
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <FancyText size="extraSmall" type="bold" color={Pallete.fonts.light}>
                {badge}
              </FancyText>
            </View>
          )}
        </View>

        {onVerMais && (
          <Pressable onPress={onVerMais}>
            <FancyText size="small" type="medium" color={Pallete.primary}>
              Ver tudo
            </FancyText>
          </Pressable>
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: Pallete.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
});
