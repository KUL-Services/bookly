'use client';

import React from 'react';
import { BaseTextProps, TextVariant } from './base-text.props';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { extractStringFromStringProps } from './utils';

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

  const { t } = useTranslation();
  console.log('I am in client', stringProps);


  return React.createElement(
    Component,
    { className: clsx('base-text', className), ...restDefaultProps },
    stringProps ? extractStringFromStringProps(stringProps, t) : children
  );
};

export { ClientBaseText };
