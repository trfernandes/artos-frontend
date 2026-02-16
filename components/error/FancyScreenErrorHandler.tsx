import axios, { AxiosError } from 'axios';
import { strfyObj } from '../../utils/text_utils';
import FancyError from './FancyError';

export default function FancyScreenErrorHandler({
  error,
  onTryAgrainPress,
}: {
  error: Error;
  onTryAgrainPress?: () => void;
}) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    console.log(
      'From FancyScreenErrorHandler\n',
      strfyObj({
        // isAxiosError: true,
        // code: axiosError.code,
        // message: axiosError.message,
        axiosError,
      }),
    );

    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
      return <FancyError.Connection onUpdate={onTryAgrainPress} />;
    }

    // Qualquer outro erro HTTP (400/401/403/500...) usa fallback amigavel padrao
    return <FancyError.Default onUpdate={onTryAgrainPress} />;
  } else {
    console.log(
      'From FancyScreenErrorHandler',
      strfyObj({
        cause: error.cause,
        message: error.message,
        stack: error.stack,
        name: error.name,
      }),
    );
  }

  return <FancyError.Default onUpdate={onTryAgrainPress} />;
}
