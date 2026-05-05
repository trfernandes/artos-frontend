import { View, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import FancyText from './FancyText';
import { ReactNode } from 'react';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import { usePallete } from '../hooks/usePallete';

export interface FancyContainerProps {
  title?: string | React.ReactNode;
  icon?: CustomIconProps;
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export default function FancyContainer({ title, icon, children, containerStyle, headerContainerStyle, titleStyle }: FancyContainerProps) {
  const palette = usePallete();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderCard,
          ...palette.shadows[200],
        },
        containerStyle,
      ]}
    >
      {title && typeof title === 'string' ? (
        <View style={[styles.headerContainer, headerContainerStyle]}>
          {icon && <DefaultIcons.Custom {...icon} />}
          <View style={styles.headerTitleContainer}>
            <FancyText size={'medium'} type='bold' style={[styles.headerTitle, titleStyle]}>
              {title}
            </FancyText>
          </View>
        </View>
      ) : (
        title
      )}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    borderWidth: 0.6,
    borderRadius: 10,
  },
  headerContainer: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderColor: 'coral',
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    borderColor: 'pink',
    justifyContent: 'center',
  },
  headerTitle: { borderWidth: 0, borderColor: 'red', opacity: 0.8 },
});
