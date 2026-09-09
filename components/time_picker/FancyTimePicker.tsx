import {
  View,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import FancyText from '../FancyText';
import { useEffect, useRef, useState } from 'react';
import { MEDIUM_LARGE_SIZE_FONT, SEMI_LARGE_SIZE_FONT } from '../../constants/font';

export type FancyTimePickerProps = {
  value?: { hour: number; minute: number };
  onChange?: (time: { hour: number; minute: number }) => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = 120;
const CENTER_OFFSET = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

export default function FancyTimePicker({ value, onChange, containerStyle }: FancyTimePickerProps) {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const [selectedHour, setSelectedHour] = useState(value?.hour ?? 0);
  const [selectedMinute, setSelectedMinute] = useState(value?.minute ?? 0);

  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (value) {
      const { hour, minute } = value;

      hourRef.current?.scrollTo({
        y: hour * ITEM_HEIGHT, // 👈 posição do item
        animated: false,
      });

      minuteRef.current?.scrollTo({
        y: minute * ITEM_HEIGHT, // 👈 idem
        animated: false,
      });

      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value]);

  const onHourScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    setSelectedHour(index);
    onChange?.({ hour: index, minute: selectedMinute });
  };

  const onMinuteScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    setSelectedMinute(index);
    onChange?.({ hour: selectedHour, minute: index });
  };

  return (
    <View>
      <View style={[styles.container, containerStyle]}>
        <ScrollView
          ref={hourRef}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate='fast'
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingVertical: CENTER_OFFSET,
            alignItems: 'center',
          }}
          onMomentumScrollEnd={onHourScrollEnd}
          onLayout={() => {
            if (value) {
              hourRef.current?.scrollTo({ y: value.hour * ITEM_HEIGHT, animated: false });
            }
          }}
        >
          {[...Array(24)].map((_, i) => (
            <View key={i} style={styles.item}>
              <FancyText style={i === selectedHour && styles.selected} type='medium'>
                {pad(i)}
              </FancyText>
            </View>
          ))}
        </ScrollView>

        <FancyText style={styles.colon}>:</FancyText>

        <ScrollView
          ref={minuteRef}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate='fast'
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingVertical: CENTER_OFFSET,
            alignItems: 'center',
          }}
          onMomentumScrollEnd={onMinuteScrollEnd}
        >
          {[...Array(60)].map((_, i) => (
            <View key={i} style={styles.item}>
              <FancyText style={i === selectedMinute && styles.selected} type='medium'>
                {pad(i)}
              </FancyText>
            </View>
          ))}
        </ScrollView>
      </View>

      <View
        pointerEvents='none'
        style={{
          position: 'absolute',
          top: CENTER_OFFSET,
          height: ITEM_HEIGHT,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#007AFF33',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: CONTAINER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: MEDIUM_LARGE_SIZE_FONT,
  },
  colon: {
    fontSize: SEMI_LARGE_SIZE_FONT,
    fontWeight: 'bold',
  },
});
