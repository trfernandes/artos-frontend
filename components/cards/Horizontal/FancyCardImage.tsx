import { isValidElement } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBaseCard from './FancyBaseCard';
import { FancyActionButtons } from './FancyCardActionButtons';
import { Pallete } from '../../../constants/colors';
import { Image, ImageProps } from 'expo-image';
import { FancyCardImageBaseProps } from './FancyCard';

export type FancyCardImageProps = {
  source?: ImageProps['source'];
  recyclingKey?: string; // ✅ tem que ser string
  mimeType?: string; // opcional (ex.: 'image/jpeg')
} & Pick<
  FancyCardImageBaseProps,
  | 'actionButtons'
  | 'title'
  | 'subtitle'
  | 'additionalData1'
  | 'additionalData2'
  | 'content'
  | 'containerStyle'
  | 'contentContainerStyle'
  | 'isCollapsable'
  | 'centerContainerStyle'
  | 'backgroundColor'
>;

export default function FancyCardImage(props: FancyCardImageProps) {
  return (
    <FancyBaseCard
      {...props}
      leftItem={<CardImage source={props.source} />}
      rightItem={isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />}
    />
  );
}

function CardImage({ source }: { source?: ImageProps['source'] }) {
  return (
    <View style={styles.imageContainer}>
      <Image source={source} style={styles.letter} cachePolicy='memory-disk' transition={120} />
    </View>
  );
}

const HEIGHT = 40;

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 100,
    marginRight: 5,
    width: HEIGHT,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    ...Pallete.shadows[100],
    borderRadius: 100,
    width: HEIGHT,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
