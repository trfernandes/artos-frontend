import { useEffect } from 'react';
import { trackAppOpen, requestReviewIfEligible } from '../hooks/useAppReview';

export function AppReviewManager() {
  useEffect(() => {
    const init = async () => {
      await trackAppOpen();

      // Aguarda 3s para não atrapalhar o carregamento
      setTimeout(async () => {
        await requestReviewIfEligible();
      }, 3000);
    };

    init();
  }, []);

  return null;
}
