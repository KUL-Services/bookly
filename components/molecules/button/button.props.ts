import { KulIconProps } from '@/components/atoms/kul-icon/kul-icon.props';
import PressableProps from '@/components/atoms/pressable/pressable.props';
import { StringProps } from '@/types';

type BareButtonProps = {
  prefixIcon: KulIconProps;
  buttonText: StringProps;
  suffixIcon: KulIconProps;
};

type ButtonProps = BareButtonProps & PressableProps;
export type { BareButtonProps, ButtonProps };
