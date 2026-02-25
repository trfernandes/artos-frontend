import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import FancyButton from '../../buttons/FancyButton';
import { isValidElement, ReactNode, useState } from 'react';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type FancyBaseCardProps = {
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  additionalData1?: string | ReactNode;
  additionalData2?: string | ReactNode;
  content?: React.ReactNode;
  leftItem?: React.ReactNode;
  rightItem?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  titleProps?: FancyTextProps;
  subtitleProps?: FancyTextProps;
  isCollapsable?: boolean;
  centerContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

export const titleTextProps: FancyTextProps = {
  size: 'medium',
  type: 'bold',
  numberOfLines: 2,
  style: { opacity: 0.7 },
};

export const subTitleTextProps: FancyTextProps = {
  size: 'extraSmall',
  type: 'medium',
  numberOfLines: 2,
};

export const additionalData1TextProps: FancyTextProps = {
  size: 'extraSmall',
  type: 'medium',
};

export const additionalData2TextProps: FancyTextProps = {
  size: 'extraSmall',
  type: 'medium',
};

export default function FancyBaseCard({ isCollapsable = false, ...props }: FancyBaseCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const [collapsed, setCollapsed] = useState(true);

  const dynamicSubTitleTextProps: FancyTextProps = {
    ...subTitleTextProps,
    color: palette.fonts.inactive,
  };
  const dynamicAdditionalData1TextProps: FancyTextProps = {
    ...additionalData1TextProps,
    color: palette.fonts.inactive,
  };
  const dynamicAdditionalData2TextProps: FancyTextProps = {
    ...additionalData2TextProps,
    color: palette.fonts.inactive,
  };

  return (
    <View
      style={[
        styles.container,
        ((isCollapsable && !collapsed) || !isCollapsable) && {
          borderRadius: 30,
          backgroundColor: props.backgroundColor || palette.backgroundColor2,
        },
        props.containerStyle,
      ]}
    >
      <View style={[styles.innerContainer, props.contentContainerStyle]}>
        <View style={styles.headerContainer}>
          {props.leftItem && <View style={styles.leftContainer}>{props.leftItem}</View>}
          <View style={[styles.centerContainer, props.centerContainerStyle]}>
            {props.title &&
              (isValidElement(props.title) ? (
                props.title
              ) : (
                <FancyText {...titleTextProps} {...props.titleProps} style={[titleTextProps.style, props.titleProps?.style]}>
                  {props.title}
                </FancyText>
              ))}
            {props.subtitle &&
              (isValidElement(props.subtitle) ? (
                props.subtitle
              ) : (
                <FancyText {...dynamicSubTitleTextProps} {...props.subtitleProps}>
                  {props.subtitle}
                </FancyText>
              ))}
            {props.additionalData1 &&
              (isValidElement(props.additionalData1) ? (
                props.additionalData1
              ) : (
                <FancyText {...dynamicAdditionalData1TextProps}>{props.additionalData1}</FancyText>
              ))}
            {props.additionalData2 &&
              (isValidElement(props.additionalData2) ? (
                props.additionalData2
              ) : (
                <FancyText {...dynamicAdditionalData2TextProps}>{props.additionalData2}</FancyText>
              ))}
          </View>
          {props.rightItem && (
            <View style={styles.rightContainer}>
              {props.rightItem}
              {isCollapsable && props.content && (
                <FancyButton
                  type='text'
                  mode='icon'
                  icon={{
                    name: !collapsed ? 'chevron-up' : 'chevron-down',
                    library: 'Entypo',
                    size: 22,
                    color: palette.fonts.dark,
                  }}
                  iconStyle={{ borderWidth: 0, paddingTop: 0, borderColor: 'blue' }}
                  onPress={() => setCollapsed(!collapsed)}
                  containerStyle={{
                    minHeight: 25,
                    minWidth: 30,
                    borderRadius: 100,
                    padding: 0,
                    justifyContent: 'center',
                  }}
                />
              )}
            </View>
          )}
        </View>
        {((isCollapsable && !collapsed) || !isCollapsable) && props.content && props.content}
      </View>
    </View>
  );
}

const DESIGN_MODE = 0;

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor2,
      borderRadius: 40,
      borderWidth: DESIGN_MODE,
      padding: DESIGN_MODE,
      paddingVertical: 10,
    },
    innerContainer: {
      borderWidth: DESIGN_MODE,
      padding: DESIGN_MODE,
      borderColor: 'blueviolet',
      paddingHorizontal: 15,
      paddingVertical: 2,
      gap: 8,
    },
    leftContainer: {
      borderWidth: DESIGN_MODE,
      padding: DESIGN_MODE,
      borderColor: 'forestgreen',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
    },
    centerContainer: {
      flex: 1,
      borderWidth: DESIGN_MODE,
      padding: DESIGN_MODE,
      borderColor: 'gold',
      gap: 6,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    rightContainer: {
      borderWidth: DESIGN_MODE,
      padding: DESIGN_MODE,
      borderColor: 'rgba(0, 0, 0, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    headerContainer: { flexDirection: 'row', borderWidth: DESIGN_MODE, padding: DESIGN_MODE, gap: 12 },
  });
}
