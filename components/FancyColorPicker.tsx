import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Dimensions, ScrollView, Animated } from 'react-native';
import FancyButton from './buttons/FancyButton';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';

export interface FancyColorPickerProps {
  value?: string;
  colors?: string[];
  circleSize?: number;
  onSelectColor?: (color: string) => void;
  selectedColor?: string;
  horizontal?: boolean;
  label?: string;
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
  circleSize = 40,
  onSelectColor,
  selectedColor,
  horizontal = false,
  label,
}: FancyColorPickerProps) {
  // const [current, setCurrent] = useState<string>(selectedColor || colors[0]);
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
    // setCurrent(color);
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

  const renderCircles = () =>
    colors.map(color => {
      const isSelected = color === value;
      const baseStyle: ViewStyle = {
        width: circleSize - (isSelected ? 8 : 0),
        height: circleSize - (isSelected ? 8 : 0),
        borderRadius: (circleSize - (isSelected ? 8 : 0)) / 2,
        backgroundColor: color,
      };

      return (
        <TouchableOpacity key={color} onPress={() => handleSelect(color)} activeOpacity={0.8} style={styles.touchable}>
          <View
            style={[
              isSelected && {
                padding: 2,
                borderColor: color,
                borderRadius: 100,
              },
            ]}
          >
            <View style={baseStyle} />
          </View>
        </TouchableOpacity>
      );
    });

  if (!horizontal) {
    return (
      <View style={styles.colorContainer}>
        <View style={styles.paletteContainer}>{renderCircles()}</View>
      </View>
    );
  }

  return (
    <View style={{ gap: 3 }}>
      {label && (
        <FancyText size={'extraSmall'} type="semiBold" color={Pallete.fonts.inactive}>
          {label}
        </FancyText>
      )}
      <View style={styles.colorContainer}>
        {showLeftArrow && (
          <Animated.View style={[styles.arrowContainer, { left: 0, opacity: fadeAnim }]}>
            <FancyButton
              mode="icon"
              size={25}
              icon={{
                name: 'arrow-left',
                library: 'Feather',
                color: Pallete.icons.dark,
                size: 15,
                style: { borderWidth: 0 },
              }}
              containerStyle={[{ backgroundColor: Pallete.selected }, Pallete.shadows[100]]}
            />
          </Animated.View>
        )}

        {/* Gradiente de fade na extremidade esquerda, independente da animação das setas */}
        {/* {showLeftArrow && (
          <View style={[styles.fade, styles.fadeLeft]}>
            <LinearGradient
              colors={[Pallete.backgroundColor, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeGradient}
            />
          </View>
        )} */}

        <ScrollView
          horizontal
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.scrollContainer}
          onScroll={onScroll}
          ref={scrollRef}
        >
          {renderCircles()}
        </ScrollView>
        {showRightArrow && (
          <Animated.View style={[styles.arrowContainer, { right: 0, opacity: fadeAnim }]}>
            <FancyButton
              mode="icon"
              size={25}
              icon={{
                name: 'arrow-right',
                library: 'Feather',
                color: Pallete.icons.dark,
                size: 15,
                style: { borderWidth: 0 },
              }}
              containerStyle={[{ backgroundColor: Pallete.selected, opacity: 0.8 }, Pallete.shadows[100]]}
            />
          </Animated.View>
        )}

        {/* Gradiente de fade na extremidade direita, independente da animação das setas */}
        {/* {showRightArrow && (
          <View style={[styles.fade, styles.fadeRight]}>
            <LinearGradient
              colors={['transparent', Pallete.backgroundColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fadeGradient}
            />
          </View>
        )} */}
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  colorContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
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
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  touchable: {
    margin: 6,
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
