import { View } from 'react-native';

export default function FancyVerticalSpacer({ height }: { height?: number }) {
  return <View style={{ height: height || 16 }} />;
}
