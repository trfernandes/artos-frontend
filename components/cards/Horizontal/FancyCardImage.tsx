import { isValidElement } from 'react';
import { StyleSheet, View, ImageSourcePropType } from 'react-native';
import FancyBaseCard from './FancyBaseCard';
import { FancyActionButtons } from './FancyCardActionButtons';
import { Pallete } from '../../../constants/colors';
import { Image } from 'expo-image';
import { ImageUtils } from '../../../utils/image_utils';
import { FancyCardImageBaseProps } from './FancyCard';

export type FancyCardImageProps = {
  source: string | ImageSourcePropType;
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
>;

export default function FancyCardImage(props: FancyCardImageProps) {
  return (
    <FancyBaseCard
      {...props}
      leftItem={<CardImage url={props.source!} />}
      rightItem={isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />}
    />
  );
}

function CardImage({ url: source }: { url: string | ImageSourcePropType }) {
  const resolvedSource = ImageUtils.normalizeImageSource(source) ?? source;

  return (
    <View style={styles.imageContainer}>
      <Image source={resolvedSource} style={styles.letter} onLoadStart={() => {}} />
    </View>
  );
}

const HEIGHT = 35;

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 100,
    // marginLeft: 15,
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
