import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Pallete } from '../constants/colors';
import FancyToast from '../components/FancyToast';

export const toastConfig: ToastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <FancyToast
      {...props}      
      icon={{
        library: 'FontAwesome5',
        name: 'check',
        size: 20,
        color: Pallete.confirm,
        style: {
          paddingTop: 2,
          lineHeight: 16,
          height: 15,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        },
      }}
      color={Pallete.confirm}
      lightColorPercent={64}
    />
  ),
  error: (props: ToastConfigParams<any>) => (
    <FancyToast
      {...props}
      icon={{
        library: 'FontAwesome',
        name: 'exclamation',
        size: 23,
        color: Pallete.error,
        style: {
          paddingTop: 1,
          lineHeight: 21,
          height: 21,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        },
      }}
      color={Pallete.error}
      lightColorPercent={42}
    />
  ),
  info: (props: ToastConfigParams<any>) => (
    <FancyToast
      {...props}
      icon={{
        library: 'FontAwesome',
        name: 'info',
        size: 24,
        color: Pallete.primary,
        style: {
          lineHeight: 23,
          height: 22,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        },
      }}
      color={Pallete.primary}
      lightColorPercent={38}
    />
  ),
};
