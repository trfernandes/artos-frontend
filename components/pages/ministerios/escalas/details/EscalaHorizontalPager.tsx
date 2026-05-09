import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { DateUtilsApi } from '../../../../../utils/date_utils';
import { EscalaItemDataType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import EscalaEventoPage, { EscalaEventoPageProps } from './EscalaEventoPage';
import { useLoading } from '../../../../../contexts/LoadingContext';

type PagerProps = Omit<EscalaEventoPageProps, 'data' | 'pagerProps'>;

interface EscalaHorizontalPagerProps extends PagerProps {
  eventosData: EscalaItemDataType[];
}

export default function EscalaHorizontalPager({
  eventosData,
  ...pageProps
}: EscalaHorizontalPagerProps) {
  const pagerRef = useRef<PagerView>(null);
  const { showLoading, hideLoading } = useLoading();

  // ── Compute initial page (first future event) ────────────────────────────
  const initialIndex = useMemo(() => {
    if (eventosData.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureIdx = eventosData.findIndex((item) => {
      const d = DateUtilsApi.dateOnlyFromApi(item.dataOcorrencia);
      return d >= today;
    });
    return futureIdx >= 0 ? futureIdx : eventosData.length - 1;
  }, [eventosData]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // If eventosData changes length (e.g. event deleted), clamp currentIndex
  useEffect(() => {
    if (eventosData.length > 0 && currentIndex >= eventosData.length) {
      const clamped = eventosData.length - 1;
      setCurrentIndex(clamped);
      pagerRef.current?.setPageWithoutAnimation(clamped);
    }
  }, [eventosData.length, currentIndex]);

  const goToPrev = useCallback(() => {
    const next = Math.max(0, currentIndex - 1);
    showLoading('Carregando evento...');
    pagerRef.current?.setPage(next);
    setCurrentIndex(next);
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    const next = Math.min(eventosData.length - 1, currentIndex + 1);
    showLoading('Carregando evento...');
    pagerRef.current?.setPage(next);
    setCurrentIndex(next);
  }, [currentIndex, eventosData.length]);

  if (eventosData.length === 0) return null;

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pager}
      initialPage={initialIndex}
      onPageSelected={(e) => {
        setCurrentIndex(e.nativeEvent.position);
        hideLoading();
      }}
      overdrag={false}
    >
      {eventosData.map((item, index) => (
        <View
          key={item.evento.id + item.dataOcorrencia}
          collapsable={false}
          style={styles.page}
        >
          <EscalaEventoPage
            data={item}
            pagerProps={{
              currentIndex,
              total: eventosData.length,
              onPrev: goToPrev,
              onNext: goToNext,
            }}
            {...pageProps}
          />
        </View>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
