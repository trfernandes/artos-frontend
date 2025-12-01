import { View, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';
import { ReactNode } from 'react';
import DefaultIcons, { CustomIconProps } from './FancyIcons';

export interface FancyContainerProps {
  title: string;
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
      <View style={[styles.headerContainer, headerContainerStyle]}>
        {icon && <DefaultIcons.Custom {...icon} />}
        <View style={styles.headerTitleContainer}>
          <FancyText size={'small'} type="semiBold" style={[styles.headerTitle, titleStyle]}>
            {title}
          </FancyText>
        </View>
      </View>
      <View style={styles.divider} />
      {content}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Pallete.backgroundColor,
    borderWidth: 1,
    borderColor: Pallete.border,
    borderRadius: 10,
    elevation: 0.7,
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  headerTitle: { borderWidth: 0, borderColor: 'red' },
  divider: { height: 0.3, borderTopWidth: 1, borderColor: Pallete.border },
});
