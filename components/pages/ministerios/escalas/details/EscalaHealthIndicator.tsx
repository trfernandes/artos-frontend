import { StyleSheet, View } from 'react-native';
import ScaleFillIndicator from '../../../../indicators/ScaleFillIndicator';

type EscalaHealthIndicatorProps = {
  confirmedCount: number;
  totalCount: number;
};

export default function EscalaHealthIndicator({
  confirmedCount,
  totalCount,
}: EscalaHealthIndicatorProps) {
  if (totalCount <= 0) return null;

  return (
    <View style={styles.container}>
      <ScaleFillIndicator
        filledCount={confirmedCount}
        totalCount={totalCount}
        label='confirmações'
        showContainer
        size='default'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
