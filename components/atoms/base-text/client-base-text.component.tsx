'use client';

import React from 'react';
import { BaseTextProps, TextVariant } from './base-text.props';
import clsx from 'clsx';
import { StringProps } from '@/types';
import { i18n } from 'i18next';
import { useTranslation } from 'react-i18next';

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
  console.log('I am in client', stringProps)

  return React.createElement(
    Component,
    { className: clsx('base-text', className), ...restDefaultProps },
    stringProps ? extractStringFromStringProps(stringProps, t) : children
  );
};

function extractStringFromStringProps(stringProps: StringProps, t: i18n['t']) {
  if ('plainText' in stringProps) {
    // stringProps is of type { plainText: string }
    return stringProps.plainText;
  } else if ('localeKey' in stringProps) {
    // stringProps is of type { localeKey: string; localeProps?: ... }
    return `${t(stringProps.localeKey, stringProps.localeProps)}`; //TODO: i18n integration;
  } else return undefined;
}

export { ClientBaseText };
