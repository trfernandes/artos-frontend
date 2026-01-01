import axios, { AxiosError } from 'axios';
import { strfyObj } from '../../utils/text_utils';
import FancyError from './FancyError';

export default function FancyScreenErrorHandler({ error, onTryAgrainPress }: { error: Error; onTryAgrainPress?: () => void }) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    console.log(
      'Erro ao carregar ministerios\n',
      strfyObj({
        isAxiosError: true,
        code: axiosError.code,
        message: axiosError.message,
      })
    );

    if (axiosError.code === 'ERR_BAD_RESPONSE') {
      return <FancyError.Default onUpdate={onTryAgrainPress} />;
    } else if (axiosError.code === 'ECONNABORTED') {
      return <FancyError.Connection onUpdate={onTryAgrainPress} />;
    }
  } else {
    console.log('Erro ao carregar ministerios', strfyObj({ cause: error.cause, message: error.message, stack: error.stack, name: error.name }));
  }
}
