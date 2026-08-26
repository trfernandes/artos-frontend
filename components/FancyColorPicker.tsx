import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import FancyButton from './buttons/FancyButton';
import DefaultIcons from './FancyIcons';
import FancyGroup from './list/FancyGroup';
import { usePallete } from '../hooks/usePallete';

export interface FancyColorPickerProps {
  value?: string;
  colors?: string[];
  circleSize?: number;
  onSelectColor?: (color: string) => void;
  selectedColor?: string;
  horizontal?: boolean;
  disabled?: boolean;
}

export default function FancyColorPicker({
  colors = [
    '#FF8C00',
    '#FFA726',
    '#E57373',
    '#EF5350',
    '#81C784',
    '#66BB6A',
    '#64B5F6',
    '#42A5F5',
    '#F48FB1',
    '#BA68C8',
    '#9575CD',
    '#7E57C2',
    '#6B7280',
    '#3B82F6',
    '#10B981',
  ],
  value,
  circleSize = 35,
  onSelectColor,
  selectedColor,
  horizontal = false,
  disabled = false,
}: FancyColorPickerProps) {
  const palette = usePallete();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Adicionados estados e referências para a animação
  const [isArrowVisible, setIsArrowVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isArrowVisible) {
      // Inicia a animação de fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Inicia o temporizador para o fade out
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000, // Duração do fade out
          useNativeDriver: true,
        }).start(() => {
          setIsArrowVisible(false);
        });
      }, 3000); // 3 segundos antes de começar o fade out

      return () => clearTimeout(timer);
    }
  }, [isArrowVisible, fadeAnim]);

  const handleSelect = (color: string) => {
    if (disabled) return;
    onSelectColor?.(color);
  };

  const onScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const maxScroll = contentSize.width - layoutMeasurement.width;

    // Se rolou, mostra as setas e reseta o temporizador
    setIsArrowVisible(true);

    setShowLeftArrow(scrollX > 10);
    setShowRightArrow(scrollX < maxScroll - 10);
  };

  useEffect(() => {
    if (disabled) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
    }
  }, [disabled]);

  const currentColor = value ?? selectedColor;
  const enlargedMultiplier = 1.1;

  const renderCircles = () => {
    return colors.map((color) => {
      const isSelected = color === currentColor;
      const displaySize = isSelected ? circleSize * enlargedMultiplier : circleSize;
      const displayColor = disabled && !isSelected ? palette.disabled2 : color;

      return (
        <TouchableOpacity
          key={color}
          onPress={() => handleSelect(color)}
          activeOpacity={disabled ? 1 : 0.8}
          style={styles.touchable}
          disabled={disabled}
        >
          <View
            style={[
              styles.circleOutline,
              isSelected && {
                borderColor: color,
              },
            ]}
          >
            <View
              style={[
                styles.circle,
                {
                  width: displaySize,
                  height: displaySize,
                  borderRadius: displaySize / 2,
                  backgroundColor: displayColor,
                },
              ]}
            >
              {isSelected && (
                <DefaultIcons.Custom
                  library='FontAwesome'
                  name='check'
                  size={Math.round(circleSize * (25 / 35))}
                  color={palette.fonts.light}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  if (!horizontal) {
    return (
      <View style={styles.colorContainer}>
        <View style={styles.paletteContainer}>{renderCircles()}</View>
      </View>
    );
  }

  return (
    <FancyGroup
      title='Cor'
      contentContainerStyle={{ padding: 0, paddingTop: 8, paddingHorizontal: 0, paddingBottom: 0 }}
    >
      <View style={styles.colorContainer}>
        {!disabled && showLeftArrow && (
          <Animated.View style={[styles.arrowContainer, { left: 5, opacity: fadeAnim }]}>
            <FancyButton
              mode='icon'
              size={25}
              icon={{
                name: 'arrow-left',
                library: 'Feather',
                color: palette.icons.dark,
                size: 15,
                style: { borderWidth: 0 },
              }}
              containerStyle={[{ backgroundColor: palette.selected }, palette.shadows[100]]}
            />
          </Animated.View>
        )}

        <ScrollView
          horizontal
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          onScroll={disabled ? undefined : onScroll}
          scrollEnabled={!disabled}
          ref={scrollRef}
        >
          {renderCircles()}
        </ScrollView>
        {!disabled && showRightArrow && (
          <Animated.View style={[styles.arrowContainer, { right: 5, opacity: fadeAnim }]}>
            <FancyButton
              mode='icon'
              size={25}
              icon={{
                name: 'arrow-right',
                library: 'Feather',
                color: palette.icons.dark,
                size: 15,
                style: { borderWidth: 0 },
              }}
              containerStyle={[
                { backgroundColor: palette.selected, opacity: 0.8 },
                palette.shadows[100],
              ]}
            />
          </Animated.View>
        )}
      </View>
    </FancyGroup>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  colorContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 6,
  },
  paletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: screenWidth - 32,
    alignSelf: 'center',
  },
  scrollContainer: {
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  touchable: {
    marginHorizontal: 2,
  },
  circleOutline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 999,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    borderRadius: 20,
    zIndex: 10,
  },
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30, // A largura do gradiente foi aumentada para 30
    zIndex: 5,
    pointerEvents: 'none',
  },
  fadeLeft: {
    left: 0,
  },
  fadeRight: {
    right: 0,
  },
  fadeGradient: {
    width: '100%',
    height: '100%',
  },
});
