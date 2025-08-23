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
  i18nTFn: _i18nTFn, // ignore this prop since we use useTranslation
  ...restProps
}: BaseTextProps<V>) => {
  const Component = variant;
  const { t } = useTranslation();

  const elementProps = {
    className: clsx('base-text', className),
    ...restProps
  };

  const content = stringProps ? extractStringFromStringProps(stringProps, t) : children;

  return React.createElement(Component, elementProps, content);
};

export { ClientBaseText };
