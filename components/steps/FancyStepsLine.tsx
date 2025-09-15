import { View } from 'react-native';

export type FancyStepsLineProps = {
  leftColor: string;
  rightColor: string;
  width: number;
};

export default function FancyStepsLine({ ...props }: FancyStepsLineProps) {
  return (
    <View style={{ width: `${props.width}%`, flexDirection: 'row', borderWidth: 0, borderColor: 'yellow' }}>
      <View
        style={{
          height: 0,
          borderTopWidth: 3,
          width: '50%',
          borderTopColor: props.leftColor,
        }}
      />
      <View style={{ height: 0, borderTopWidth: 3, width: '50%', borderTopColor: props.rightColor }} />
    </View>
  );
}
