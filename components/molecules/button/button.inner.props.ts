import PressableProps from '@/bookly/components/atoms/pressable/pressable.props';
import { ReactElement } from 'react';
import { ButtonProps } from './button.props';

type BareButtonInnerProps = {
  ButtonElement: ReactElement<ButtonProps>;
};

type ButtonInnerProps = BareButtonInnerProps & Omit<PressableProps, 'children'>;

export type { BareButtonInnerProps, ButtonInnerProps };
