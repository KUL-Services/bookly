'use client';

import { Pressable } from '@/components/atoms';
import React from 'react';
import { ButtonInnerProps } from './button.inner.props';

const ButtonInner = ({ ButtonElement, ...restProps }: ButtonInnerProps) => {
  return <Pressable {...restProps}>{ButtonElement}</Pressable>;
};

export default ButtonInner;
