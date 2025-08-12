import React from 'react';
import ButtonInner from './button.inner.component';
import { ButtonProps } from './button.props';
import { KulIcon, Pressable } from '@/components/atoms';

const Button = ({
  buttonText,
  prefixIcon,
  suffixIcon,
  ...restProps
}: ButtonProps) => {
  return (
    <Pressable {...restProps}>
      <div>
        <KulIcon />
        {/* TEXT */}
        <KulIcon />
      </div>
    </Pressable>
  );
};

export default Button;
