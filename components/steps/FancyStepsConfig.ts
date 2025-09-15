import { CustomIconProps } from '../FancyIcons';

export type FancyStepAction = {
  label: string;
  enabled?: boolean;
  icon?: CustomIconProps;
  iconPosition?: 'left' | 'right';
  color?: string;
  onPress?: 'next' | 'previous' | (() => void);
};

export type FancyStep = {
  title: string;
  content?: React.ReactNode;
  actions?: FancyStepAction[];
};

export type FancyStepsConfig = {
  steps: FancyStep[];
};
