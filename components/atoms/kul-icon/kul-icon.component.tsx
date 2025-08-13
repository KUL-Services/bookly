'use client';

import React from 'react';
import './kul-icon.styles.css';

import { Icon } from '@iconify-icon/react';
import { KulIconProps } from './kul-icon.props';
import { getIconColor } from './utils';
import { FontSize } from '@/constants/enums';
import clsx from 'clsx';

const KulIcon = ({
  icon,
  iconColor,
  wrapperClass,
  iconClass,
  fontSize = FontSize.L,
}: KulIconProps) => {
  return (
    <div className={clsx('flex items-center content-center', wrapperClass)}>
      <Icon
        icon={icon}
        // className={getElementClasses(iconClass, getIconColor(iconColor))}
        className={clsx(iconClass, getIconColor(iconColor), fontSize)}
      />
    </div>
  );
};

export default KulIcon;

// DO NOT DELETE THIS, OR THE ICON WILL NOT COLOR CORRECTLY;
const TAILWIND_CLASSES_FOR_CSS = [
  'text-primary-100',
  'text-primary-200',
  'text-primary-300',
  'text-primary-400',
  'text-primary-500',
  'text-primary-600',
  'text-primary-700',
  'text-primary-800',
  'text-primary-900',
  'text-secondary-100',
  'text-secondary-200',
  'text-secondary-300',
  'text-secondary-400',
  'text-secondary-500',
  'text-secondary-600',
  'text-secondary-700',
  'text-secondary-800',
  'text-secondary-900',
  'text-alternate-100',
  'text-alternate-200',
  'text-alternate-300',
  'text-alternate-400',
  'text-alternate-500',
  'text-alternate-600',
  'text-alternate-700',
  'text-alternate-800',
  'text-alternate-900',
  'text-success-100',
  'text-success-200',
  'text-success-300',
  'text-success-400',
  'text-success-500',
  'text-success-600',
  'text-success-700',
  'text-success-800',
  'text-success-900',
  'text-warning-100',
  'text-warning-200',
  'text-warning-300',
  'text-warning-400',
  'text-warning-500',
  'text-warning-600',
  'text-warning-700',
  'text-warning-800',
  'text-warning-900',
  'text-error-100',
  'text-error-200',
  'text-error-300',
  'text-error-400',
  'text-error-500',
  'text-error-600',
  'text-error-700',
  'text-error-800',
  'text-error-900',
  'text-white-100',
  'text-white-200',
  'text-white-300',
  'text-white-400',
  'text-white-500',
  'text-white-600',
  'text-white-700',
  'text-white-800',
  'text-white-900',
  'text-black-100',
  'text-black-200',
  'text-black-300',
  'text-black-400',
  'text-black-500',
  'text-black-600',
  'text-black-700',
  'text-black-800',
  'text-black-900',
];
