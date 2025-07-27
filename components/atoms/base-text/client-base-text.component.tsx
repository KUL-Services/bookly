'use client';

import React from 'react';
import { BaseTextProps, TextVariant } from './base-text.props';
import clsx from 'clsx';
import extractStringFromStringProps from './extract-string-from-string-props.util';

/**
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 * 
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 * 
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 * 
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 * 
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 * 
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 * 
 * DO NOT IMPORT THIS UNLESS THIS IS A SPECIAL SPECIAL CASE!!!
 */
const ClientBaseText = <V extends TextVariant = 'p'>({
  variant = 'p' as V,
  children,
  className,
  stringProps,
  ...restDefaultProps
}: BaseTextProps<V>) => {
  const Component = variant;

  return React.createElement(
    Component,
    { className: clsx('base-text', className), ...restDefaultProps },
    stringProps ? extractStringFromStringProps(stringProps) : children
  );
};

export { ClientBaseText };
