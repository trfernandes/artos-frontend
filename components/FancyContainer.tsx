import { View, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';
import { ReactNode } from 'react';
import DefaultIcons, { CustomIconProps } from './FancyIcons';

export interface FancyContainerProps {
  title?: string | React.ReactNode;
  icon?: CustomIconProps;
  content: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export default function FancyContainer({
  title,
  icon,
  content,
  containerStyle,
  headerContainerStyle,
  titleStyle,
}: FancyContainerProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {title && typeof title === 'string' ? (
        <View style={[styles.headerContainer, headerContainerStyle]}>
          {icon && <DefaultIcons.Custom {...icon} />}
          <View style={styles.headerTitleContainer}>
            <FancyText size={'medium'} type="bold" style={[styles.headerTitle, titleStyle]}>
              {title}
            </FancyText>
          </View>
        </View>
      ) : (
        title
      )}
      {content}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Pallete.backgroundColor,
    borderWidth: 1,
    borderRadius: 10,
    ...Pallete.shadows[200],
    borderColor: Pallete.borderCard,
    paddingBottom: 16,
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
