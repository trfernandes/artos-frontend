import { isValidElement, ReactNode } from 'react';
import { StyleSheet, View, ImageSourcePropType } from 'react-native';
import FancyBaseCard, { FancyBaseCardProps } from './FancyBaseCard';
import { ActionButton, FancyActionButtons } from './FancyCardActionButtons';
import { Pallete } from '../../../constants/colors';
import { Image } from 'expo-image';

export type FancyCardImageProps = {
  source: string | ImageSourcePropType;
  actionButtons?: ActionButton | ActionButton[] | ReactNode;
} & Pick<
  FancyBaseCardProps,
  'title' | 'subtitle' | 'additionalData1' | 'additionalData2' | 'content' | 'containerStyle' | 'contentContainerStyle' | 'isCollapsable'
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
  return (
    <View style={styles.imageContainer}>
      <Image source={typeof source === 'string' ? { uri: source } : source} style={styles.letter} onLoadStart={() => {}} />
    </View>
  );
}

const HEIGHT = 40;

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
