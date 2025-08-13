import React from 'react';
import { ButtonProps } from './button.props';
import { H5, KulIcon, Pressable } from '@/components/atoms';

const Button = ({
  buttonText,
  prefixIcon,
  suffixIcon,
  ...restProps
}: ButtonProps) => {
  return (
    <Pressable {...restProps}>
      <div className='flex flex-row content-between items-center px-3 py-2 gap-3'>
        <KulIcon
          {...prefixIcon}
          style={{ borderWidth: 1, borderColor: 'red', borderStyle: 'solid' }}
        />
        <H5 stringProps={buttonText} />
        <KulIcon {...suffixIcon} />
      </div>
    </Pressable>
  );
};

export default Button;
