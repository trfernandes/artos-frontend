import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import DateUtils, { DateUtilsApi } from '../../../../../utils/date_utils';
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
    // Use SP-timezone date string for comparison to avoid device-TZ off-by-one at midnight
    const todayKey = DateUtils.dayKey(new Date());
    const futureIdx = eventosData.findIndex((item) => item.dataOcorrencia >= todayKey);
    return futureIdx >= 0 ? futureIdx : eventosData.length - 1;
  }, [eventosData]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Identidade estrutural das páginas (muda só em adição/remoção/reordenação de
  // evento, não em edições internas como equipe/setlist). Usada como `key` do
  // PagerView: quando muda, o nativo remonta e remede as páginas — sem isso o
  // pager-view colapsa o conteúdo flex das páginas restantes ao excluir um
  // evento, deixando visível só o card de cabeçalho ("card de cima").
  const pagesKey = useMemo(
    () => eventosData.map((item) => item.evento.id + item.dataOcorrencia).join('|'),
    [eventosData],
  );

  // Página inicial segura após remontagem: mantém o usuário próximo de onde
  // estava (clampada ao novo tamanho da lista).
  const safeInitialPage = Math.min(currentIndex, eventosData.length - 1);

  // If eventosData changes length (e.g. event deleted), clamp currentIndex
  useEffect(() => {
    if (eventosData.length > 0 && currentIndex >= eventosData.length) {
      setCurrentIndex(eventosData.length - 1);
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
      key={pagesKey}
      ref={pagerRef}
      style={styles.pager}
      initialPage={safeInitialPage}
      onPageSelected={(e) => {
        setCurrentIndex(e.nativeEvent.position);
        hideLoading();
      }}
      overdrag={false}
    >
      {eventosData.map((item, index) => (
        <View key={item.evento.id + item.dataOcorrencia} collapsable={false} style={styles.page}>
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
