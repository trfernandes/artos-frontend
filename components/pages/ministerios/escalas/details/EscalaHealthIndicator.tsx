import { StyleSheet, View } from 'react-native';
import ScaleFillIndicator from '../../../../indicators/ScaleFillIndicator';

type EscalaHealthIndicatorProps = {
  confirmedCount: number;
  totalCount: number;
  compact?: boolean;
};

export default function EscalaHealthIndicator({
  confirmedCount,
  totalCount,
  compact = false,
}: EscalaHealthIndicatorProps) {
  if (totalCount <= 0) return null;

  if (compact) {
    return (
      <ScaleFillIndicator
        filledCount={confirmedCount}
        totalCount={totalCount}
        label=''
        showContainer={false}
        size='compact'
        donutSize={10}
        textSize={10}
      />
    );
  }

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
