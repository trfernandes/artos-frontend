import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export type FancyVerticalCardProps = {
  title: string;
  subtitle?: string;
  topElement?: React.ReactNode;
  bottomElement?: React.ReactNode;
  topLeftElement?: React.ReactNode;
  topRightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  topElementStyle?: StyleProp<ViewStyle>;
  bottomElementStyle?: StyleProp<ViewStyle>;
  topLeftElementStyle?: StyleProp<ViewStyle>;
  topRightElementStyle?: StyleProp<ViewStyle>;
  additionalElement?: React.ReactNode;
};

export default function FancyVerticalCard(props: FancyVerticalCardProps) {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={[styles.contentContainer, props.contentContainerStyle]}>
        <View style={[styles.topContainer, props.topElementStyle]}>{props.topElement}</View>
        <View style={[styles.topLeftContainer, props.topLeftElementStyle]}>{props.topLeftElement}</View>
        <View style={[styles.topRightContainer, props.topRightElementStyle]}>{props.topRightElement}</View>

        <View style={[styles.bottomContainer, props.bottomElementStyle]}>
          {props.bottomElement ? (
            props.bottomElement
          ) : (
            <View style={styles.textsContainer}>
              <FancyText
                size="extraSmall"
                type="semiBold"
                numberOfLines={props.subtitle || props.additionalElement ? 2 : 3}
                textBreakStrategy="balanced"
                style={{ textAlign: 'center' }}
              >
                {props.title}
              </FancyText>
              {props.subtitle && (
                <FancyText
                  size="extraSmall"
                  type="medium"
                  color={Pallete.fonts.inactive}
                  style={{ borderWidth: 0, textAlign: 'center' }}
                  numberOfLines={1}
                >
                  {props.subtitle}
                </FancyText>
              )}
            </View>
          )}
          {props.additionalElement}
        </View>
      </View>
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    borderWidth: DESIGN_MODE,
    borderColor: 'rgba(1,1,1,0.5)',
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 5,
  },
  contentContainer: {
    flex: 1,
    borderWidth: DESIGN_MODE,
    borderColor: 'rgba(81, 0, 255, 0.5)',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  topContainer: {
    // height: '70%',
    width: '100%',
    // flex: 1,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'gold',
  },
  bottomContainer: {
    // height: '30%',
    flex: 1,
    width: '100%',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(0, 195, 255, 0.5)',
  },
  topLeftContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'rgba(255, 123, 0, 0.5)',
    minHeight: 30,
    minWidth: 30,
  },
  topRightContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderWidth: DESIGN_MODE,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    borderColor: 'rgba(0, 255, 0, 0.5)',
    minHeight: 30,
    minWidth: 30,
  },
  textsContainer: {
    minHeight: 30,
    borderWidth: DESIGN_MODE,
    justifyContent: 'center',
    gap: 3,
    width: '100%',
    // flex: 1,
  },
});
