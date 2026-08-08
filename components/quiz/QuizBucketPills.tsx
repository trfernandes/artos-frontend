import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { QUIZ_VENDAS_BUCKET_COPY, QuizVendasBucket } from '../../constants/quizVendas';

const BUCKET_ORDER: QuizVendasBucket[] = ['SO_FALTA_ORGANIZAR', 'NO_LIMITE', 'SOBRECARREGADO'];

export type QuizBucketPillsProps = {
  activeBucket: QuizVendasBucket;
};

export default function QuizBucketPills({ activeBucket }: QuizBucketPillsProps) {
  const Pallete = usePallete();

  return (
    <View style={styles.row}>
      {BUCKET_ORDER.map((bucket) => {
        const isActive = bucket === activeBucket;
        return (
          <View
            key={bucket}
            style={[
              styles.pill,
              { backgroundColor: isActive ? Pallete.primary : Pallete.fonts.dark },
            ]}
          >
            <FancyText size='extraSmall' type='bold' color={Pallete.fonts.light} numberOfLines={1}>
              {QUIZ_VENDAS_BUCKET_COPY[bucket].tag}
            </FancyText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
