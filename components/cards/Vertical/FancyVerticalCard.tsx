import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { EXTRA_SMALL_SIZE_FONT } from '../../../constants/font';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export interface FancyVerticalCardProps {
  title?: string;
  subtitle?: string;

  topElement?: React.ReactNode;
  bottomElement?: React.ReactNode;

  topLeftElement?: React.ReactNode;
  topRightElement?: React.ReactNode;

  additionalElement?: React.ReactNode;

  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  topElementStyle?: StyleProp<ViewStyle>;
  bottomElementStyle?: StyleProp<ViewStyle>;

  /** 🔥 NOVO: Altura customizável */
  cardHeight?: number | string; // 180 | "60%" | etc.
}

export default function FancyVerticalCard({
  title,
  subtitle,
  topElement,
  bottomElement,
  topLeftElement,
  topRightElement,
  additionalElement,
  cardHeight,
  containerStyle,
  contentContainerStyle,
  topElementStyle,
  bottomElementStyle,
}: FancyVerticalCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, containerStyle, cardHeight !== undefined && { height: cardHeight as DimensionValue }]}>
      {/* Camada absoluta de topo */}
      <View style={styles.topOverlay}>
        <View style={styles.topLeft}>{topLeftElement}</View>
        <View style={styles.topRight}>{topRightElement}</View>
      </View>

      {/* Conteúdo principal */}
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {/* Área central que ocupa todo o espaço disponível */}
        <View style={[styles.centerContainer, topElementStyle]}>{topElement}</View>

        {/* Área inferior flexível */}
        <View style={[styles.bottomContainer, bottomElementStyle]}>
          {bottomElement ? (
            bottomElement
          ) : (
            <>
              {title && (
                <FancyText
                  size='extraSmall'
                  type='bold'
                  numberOfLines={2}
                //   ellipsizeMode='middle'
                  style={{
                    textAlign: 'center',
                    textAlignVertical:'center',
                    opacity: 0.8,
                    // borderWidth: 1,
                    // lineHeight: EXTRA_SMALL_SIZE_FONT*2 + 3,
                    height: (EXTRA_SMALL_SIZE_FONT * 2) + 6, 
                  }}
                >
                  {title}
                </FancyText>
              )}

              {subtitle && (
                <FancyText
                  size='extraSmall'
                  type='semiBold'
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  color={palette.fonts.inactive}
                  style={{
                    // marginTop: 4,
                    textAlign: 'center',
                    // borderWidth: 1,
                    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
                  }}
                >
                  {subtitle}
                </FancyText>
              )}
            </>
          )}

          {additionalElement}
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
  container: {
    backgroundColor: palette.backgroundColor2,
    borderRadius: 8,
    overflow: 'hidden',
    gap: 10,
  },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingTop: 6,
  },

  topLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  topRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // =======================
  //    CONTEÚDO PRINCIPAL
  // =======================
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    borderColor: 'red',
  },

  centerContainer: {
    // flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: 'blue',
  },

  bottomContainer: {
    width: '100%',
    // height: '35%',
    gap: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: 'green',
  },
});
}
