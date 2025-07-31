import React from 'react';
import { BaseTextProps, TextVariant } from './base-text.props';
import clsx from 'clsx';
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
const ServerBaseText = <V extends TextVariant = 'p'>({
  variant = 'p' as V,
  children,
  className,
  stringProps,
  i18nTFn,
  ...restDefaultProps
}: BaseTextProps<V>) => {
  const Component = variant;
  console.log('I am in server', stringProps);
  if (!i18nTFn && !('plainText' in stringProps))
    throw 'Received undefined i18nTFn inside ServerBaseText';

  return React.createElement(
    Component,
    { className: clsx('base-text', className), ...restDefaultProps },
    stringProps ? extractStringFromStringProps(stringProps, i18nTFn) : children
  );
};

export { ServerBaseText };
