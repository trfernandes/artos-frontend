import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyScrollView from '../../FancyScrollView';
import FancyVerticalImageCard from './FancyVerticalImageCard';
import { CustomIconProps } from '../../FancyIcons';
import FancyVerticalLetterCard from './FancyVerticalLetterCard';
import FancyVerticalCheckboxCard from './FancyVerticalCheckboxCard';
import FancyListEmpty from '../../list/FancyListEmpty';

export interface DataType {
  title: string;
  subtitle?: string;
  selected?: boolean;
  topElement:
    | { type: 'image'; imageUrl?: string | number; size?: number }
    | { type: 'letter'; letter?: string }
    | { type: 'icon'; icon?: CustomIconProps }
    | { type: 'check'; checked: boolean; image: string };
  linkedData?: any;
}

export interface FancyVerticalContainerCardProps {
  data: DataType[];
  itemProps?: {
    additionalData?: React.ReactNode | ((params: { item: DataType; index: number }) => React.ReactNode);
    topLeftIcon?: { onPress?: (data: DataType) => void; customIcon?: CustomIconProps };
    topRightIcon?: { onPress?: (data: DataType) => void; customIcon?: CustomIconProps };
  };
  widthFactor?: number;
  itemHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function FancyVerticalContainerCard({
  data,
  itemProps,
  widthFactor = 3.2,
  itemHeight,
  containerStyle,
  contentContainerStyle,
}: FancyVerticalContainerCardProps) {
  const quantLinhas = Math.ceil(data.length / 3);
  const quantItensNecessarios = quantLinhas * 3;

  return (
    <FancyScrollView
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      style={[{ borderWidth: 0 }, containerStyle]}
    >
      {data.length === 0 ? (
        <FancyListEmpty />
      ) : (
        Array.from({ length: quantItensNecessarios }, (_, index) => index).map(index => {
          if (index >= data.length)
            return <View key={index} style={{ height: 160, width: `${100 / widthFactor}%` }}></View>;
          else {
            if (data[index].topElement.type === 'image')
              return (
                <FancyVerticalImageCard
                  selected={data[index].selected}
                  key={index}
                  title={data[index].title}
                  subtitle={data[index].subtitle}
                  url={data[index].topElement.imageUrl}
                  imageSize={data[index].topElement.size}
                  additionalElement={
                    typeof itemProps?.additionalData === 'function'
                      ? itemProps.additionalData({ item: data[index], index })
                      : itemProps?.additionalData
                  }
                  containerStyle={{ height: itemHeight || 160, width: `${100 / widthFactor}%` }}
                  topRightIcon={
                    itemProps?.topRightIcon && {
                      customIcon: itemProps?.topRightIcon?.customIcon,
                      onPress:
                        itemProps?.topRightIcon?.onPress &&
                        (() => itemProps?.topRightIcon?.onPress?.(data[index])),
                    }
                  }
                  topLeftIcon={
                    itemProps?.topLeftIcon && {
                      customIcon: itemProps?.topLeftIcon?.customIcon,
                      onPress:
                        itemProps?.topLeftIcon?.onPress &&
                        (() => itemProps?.topLeftIcon?.onPress?.(data[index])),
                    }
                  }
                />
              );

            if (data[index].topElement.type === 'letter')
              return (
                <FancyVerticalLetterCard
                  key={index}
                  title={data[index].title}
                  subtitle={data[index].subtitle}
                  char={data[index].topElement.letter}
                  containerStyle={{ height: itemHeight || 160, width: `${100 / widthFactor}%` }}
                  topRightIcon={
                    itemProps?.topRightIcon && {
                      customIcon: itemProps?.topRightIcon?.customIcon,
                      onPress:
                        itemProps?.topRightIcon?.onPress &&
                        (() => itemProps?.topRightIcon?.onPress?.(data[index])),
                    }
                  }
                  topLeftIcon={
                    itemProps?.topLeftIcon && {
                      customIcon: itemProps?.topLeftIcon?.customIcon,
                      onPress:
                        itemProps?.topLeftIcon?.onPress &&
                        (() => itemProps?.topLeftIcon?.onPress?.(data[index])),
                    }
                  }
                  additionalElement={
                    typeof itemProps?.additionalData === 'function'
                      ? itemProps.additionalData({ item: data[index], index })
                      : itemProps?.additionalData
                  }
                />
              );

            if (data[index].topElement.type === 'check')
              return (
                <FancyVerticalCheckboxCard
                  value={data[index].topElement.checked}
                  title={data[index].title}
                  image={data[index].topElement.image}
                  containerStyle={{ height: itemHeight || 160, width: `${100 / widthFactor}%` }}
                />
              );
          }
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
