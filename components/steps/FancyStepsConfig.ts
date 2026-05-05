import { CustomIconProps } from '../FancyIcons';

export type FancyStepAction = {
  label: string;
  enabled?: boolean;
  icon?: CustomIconProps;
  iconPosition?: 'left' | 'right';
  color?: string;
  onPress?: 'next' | 'previous' | (() => void);
  // Permitir props extras para FancyButton (ex: isLoading, loadingText)
  [key: string]: any;
};

export type FancyStep = {
  title: string;
  content?: React.ReactNode;
  actions?: FancyStepAction[];
};

export type FancyStepsConfig = {
  steps: FancyStep[];
};
