import { StyleSheet, View } from 'react-native';
import ScaleFillIndicator from '../../../../indicators/ScaleFillIndicator';

type EscalaHealthIndicatorProps = {
  confirmedCount: number;
  totalCount: number;
  compact?: boolean;
  displayMode?: 'counts-and-percent' | 'percent-only';
};

export default function EscalaHealthIndicator({
  confirmedCount,
  totalCount,
  compact = false,
  displayMode = 'counts-and-percent',
}: EscalaHealthIndicatorProps) {
  if (totalCount <= 0) return null;

  if (compact) {
    return (
      <ScaleFillIndicator
        filledCount={confirmedCount}
        totalCount={totalCount}
        label=''
        displayMode={displayMode}
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
        displayMode={displayMode}
        showContainer
        size='default'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
