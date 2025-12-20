import { View, StyleSheet, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { useMemo, useState } from 'react';
import FancyScrollView from '../../FancyScrollView';
import { CustomIconProps } from '../../FancyIcons';
import FancyVerticalCheckboxCard from './FancyVerticalCheckboxCard';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyVerticalImageCard from './FancyVerticalImageCard';

export type TopElementType = 'image' | 'letter' | 'icon' | 'check';

type BaseDataType = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  key?: string | number;
  linkedData?: any;
};

type TopElementValueMap = {
  image: { source?: string | ImageSourcePropType; size?: number, highlighted?: boolean };
  letter: { letter?: string };
  icon: { icon?: CustomIconProps };
  check: { checked: boolean; image: string };
};

export type DataType<T extends TopElementType = TopElementType> = BaseDataType &
  TopElementValueMap[T];

export interface FancyVerticalContainerCardProps<T extends TopElementType = TopElementType> {
  topElementType: T;
  data: DataType<T>[];

  numColumns?: number;
  columnSpacing?: number;
  rowSpacing?: number;

  itemHeight?: number | ((item: DataType<T>) => number);

  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;

  onChangeValue?: T extends 'check'
    ? (item: DataType<'check'>, value: boolean, index: number) => void
    : undefined;
}

const DEFAULT_ITEM_HEIGHT = 160;
const COMPACT_ITEM_HEIGHT = 140;

export default function FancyVerticalContainerCard<T extends TopElementType>({
  topElementType,
  data,
  numColumns = 3,
  columnSpacing = 5,
  rowSpacing = 5,
  itemHeight,
  containerStyle,
  contentContainerStyle,
  onChangeValue,
}: FancyVerticalContainerCardProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: any) => {
    const width = e.nativeEvent.layout.width;
    if (width !== containerWidth) setContainerWidth(width);
  };

  // 🔥 Detectar paddingHorizontal do contentContainerStyle
  const horizontalPadding = (() => {
    const style = StyleSheet.flatten(contentContainerStyle) || {};
    const padding = typeof style.paddingHorizontal === 'number' ? style.paddingHorizontal : 0;
    return padding * 2;
  })();

  // 🔥 Calcular largura REAL disponível
  const availableWidth = containerWidth - horizontalPadding - 1;

  // 🔥 total dos "gaps" entre os cards
  const totalGaps = columnSpacing * (numColumns - 1);

  // 🔥 largura final do card
  const computedItemWidth = useMemo(() => {
    if (availableWidth <= 0) return 0;
    return (availableWidth - totalGaps) / numColumns;
  }, [availableWidth, numColumns, columnSpacing]);

  const rows = Math.ceil((data?.length ?? 0) / numColumns);
  const totalSlots = rows * numColumns;

  const computeHeight = (card: any) => {
    if (typeof itemHeight === 'function') return itemHeight(card);
    if (typeof itemHeight === 'number') return itemHeight;
    return card?.subtitle ? DEFAULT_ITEM_HEIGHT : COMPACT_ITEM_HEIGHT;
  };

  // console.log(
  //   'FancyVerticalContainerCard Values:',
  //   strfyObj({
  //     numColumns,
  //     columnSpacing,
  //     containerWidth,
  //     availableWidth,
  //     totalGaps,
  //     computedItemWidth,
  //     computeHeight,
  //     horizontalPadding,
  //     rows,
  //     totalSlots,
  //   })
  // );

  const renderCard = (card: any, index: number) => {
    const style: ViewStyle = {
      width: computedItemWidth,
      height: computeHeight(card),
      borderWidth: 0,
    };

    if (!card) return <View key={`empty-${index}`} style={style} />;

    if (topElementType === 'check') {
      const typed = data as DataType<'check'>[];
      const item = typed[index];

      return (
        <FancyVerticalCheckboxCard
          key={card.key ?? card.title ?? index}
          value={item.checked}
          title={card.title}
          subtitle={card.subtitle}
          source={item.image}
          containerStyle={style}
          onChangeValue={v => (onChangeValue as any)?.(item, v, index)}
        />
      );
    }

    if (topElementType === 'image') {
      const typed = data as DataType<'image'>[];
      const item = typed[index];

      return (
        <FancyVerticalImageCard
          key={card.key ?? card.title ?? index}
          title={card.title}
          source={item.source}
          highlighted={item.highlighted}
          subtitle={card.subtitle}
          containerStyle={[style, {}]}
        />
      );
    }
  };

  return data.length > 0 ? (
    <FancyScrollView
      style={containerStyle}
      onLayout={onLayout}
      contentContainerStyle={[
        styles.contentContainer,
        {
          columnGap: columnSpacing,
          rowGap: rowSpacing,
        },
        contentContainerStyle,
      ]}
    >
      {Array.from({ length: totalSlots }, (_, i) => renderCard(data[i], i))}
    </FancyScrollView>
  ) : (
    <FancyListEmpty />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 25,
  },
});
