import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyScrollView from '../../FancyScrollView';
import { CustomIconProps } from '../../FancyIcons';
import FancyVerticalImageCard from './FancyVerticalImageCard';
import FancyVerticalLetterCard from './FancyVerticalLetterCard';
import FancyVerticalCheckboxCard from './FancyVerticalCheckboxCard';
import FancyListEmpty from '../../list/FancyListEmpty';

export type TopElementType = 'image' | 'letter' | 'icon' | 'check';

type BaseDataType = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  key?: string | number;
  linkedData?: any;
};

type TopElementValueMap = {
  image: { imageUrl?: string | number; size?: number };
  letter: { letter?: string };
  icon: { icon?: CustomIconProps };
  check: { checked: boolean; image: string };
};

export type DataType<T extends TopElementType = TopElementType> = BaseDataType & TopElementValueMap[T];

type AdditionalDataRenderer<T extends TopElementType> =
  | React.ReactNode
  | ((params: { item: DataType<T>; index: number }) => React.ReactNode);

export interface FancyVerticalContainerCardProps<T extends TopElementType = TopElementType> {
  topElementType: T;
  data: DataType<T>[];
  itemProps?: {
    additionalData?: AdditionalDataRenderer<T>;
    topLeftIcon?: { onPress?: (data: DataType<T>) => void; customIcon?: CustomIconProps };
    topRightIcon?: { onPress?: (data: DataType<T>) => void; customIcon?: CustomIconProps };
  };
  widthFactor?: number;
  itemHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onChangeValue?: T extends 'check' ? (item: DataType<'check'>, value: boolean, index: number) => void : undefined;
}

const DEFAULT_ITEM_HEIGHT = 160;
const COMPACT_ITEM_HEIGHT = 140;

export default function FancyVerticalContainerCard<T extends TopElementType>({
  topElementType,
  data,
  itemProps,
  widthFactor = 3.2,
  itemHeight,
  containerStyle,
  contentContainerStyle,
  onChangeValue,
}: FancyVerticalContainerCardProps<T>) {
  const quantLinhas = Math.ceil(data?.length / 3);
  const quantItensNecessarios = quantLinhas * 3;
  const defaultItemHeight = itemHeight ?? DEFAULT_ITEM_HEIGHT;

  return (
    <FancyScrollView
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      style={[{ borderWidth: 0 }, containerStyle]}
    >
      {data?.length === 0 ? (
        <FancyListEmpty />
      ) : (
        Array.from({ length: quantItensNecessarios }, (_, index) => index).map(index => {
          const card = data?.[index];

          if (!card)
            return (
              <View key={`placeholder-${index}`} style={{ height: defaultItemHeight, width: `${100 / widthFactor}%` }}></View>
            );

          const hasSubtitle = Boolean(card.subtitle?.trim());
          const computedItemHeight = itemHeight ?? (hasSubtitle ? DEFAULT_ITEM_HEIGHT : COMPACT_ITEM_HEIGHT);

          if (topElementType === 'image') {
            const imageData = data as DataType<'image'>[];
            const imageItemProps = itemProps as FancyVerticalContainerCardProps<'image'>['itemProps'];
            const imageCard = imageData[index];
            return (
              <FancyVerticalImageCard
                selected={card.selected}
                key={card.key ?? card.title ?? index}
                title={card.title}
                subtitle={card.subtitle}
                url={imageCard.imageUrl}
                imageSize={imageCard.size}
                additionalElement={
                  typeof imageItemProps?.additionalData === 'function'
                    ? imageItemProps.additionalData({ item: imageCard, index })
                    : imageItemProps?.additionalData
                }
                containerStyle={{ height: computedItemHeight, width: `${100 / widthFactor}%` }}
                topRightIcon={
                  imageItemProps?.topRightIcon && {
                    customIcon: imageItemProps?.topRightIcon?.customIcon,
                    onPress: imageItemProps?.topRightIcon?.onPress && (() => imageItemProps?.topRightIcon?.onPress?.(imageCard)),
                  }
                }
                topLeftIcon={
                  imageItemProps?.topLeftIcon && {
                    customIcon: imageItemProps?.topLeftIcon?.customIcon,
                    onPress: imageItemProps?.topLeftIcon?.onPress && (() => imageItemProps?.topLeftIcon?.onPress?.(imageCard)),
                  }
                }
              />
            );
          }

          if (topElementType === 'letter') {
            const letterData = data as DataType<'letter'>[];
            const letterItemProps = itemProps as FancyVerticalContainerCardProps<'letter'>['itemProps'];
            const letterCard = letterData[index];
            return (
              <FancyVerticalLetterCard
                key={card.key ?? card.title ?? index}
                title={card.title}
                subtitle={card.subtitle}
                char={letterCard.letter}
                containerStyle={{ height: computedItemHeight, width: `${100 / widthFactor}%` }}
                topRightIcon={
                  letterItemProps?.topRightIcon && {
                    customIcon: letterItemProps?.topRightIcon?.customIcon,
                    onPress:
                      letterItemProps?.topRightIcon?.onPress && (() => letterItemProps?.topRightIcon?.onPress?.(letterCard)),
                  }
                }
                topLeftIcon={
                  letterItemProps?.topLeftIcon && {
                    customIcon: letterItemProps?.topLeftIcon?.customIcon,
                    onPress: letterItemProps?.topLeftIcon?.onPress && (() => letterItemProps?.topLeftIcon?.onPress?.(letterCard)),
                  }
                }
                additionalElement={
                  typeof letterItemProps?.additionalData === 'function'
                    ? letterItemProps.additionalData({ item: letterCard, index })
                    : letterItemProps?.additionalData
                }
              />
            );
          }

          if (topElementType === 'check') {
            const checkData = data as DataType<'check'>[];
            const checkCard = checkData[index];
            const handleChange = onChangeValue as FancyVerticalContainerCardProps<'check'>['onChangeValue'];
            return (
              <FancyVerticalCheckboxCard
                key={card.key ?? card.title ?? index}
                value={checkCard.checked}
                title={card.title}
                subtitle={card.subtitle}
                image={checkCard.image}
                onChangeValue={value => handleChange?.(checkCard, value, index)}
                containerStyle={{ height: computedItemHeight, width: `${100 / widthFactor}%` }}
              />
            );
          }

          return null;
        })
      )}
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    gap: 5,
    rowGap: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
