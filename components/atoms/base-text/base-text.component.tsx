import React from 'react';
import { BaseTextProps, TextVariant } from './base-text.props';
import { ServerBaseText } from './server-base-text.component';
import { ClientBaseText } from './client-base-text.component';

// Utility to capitalize first letter
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// List of all variants
const variants: TextVariant[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'small',
  'span',
  'label',
  'strong',
];

// Dynamically create variant components
const variantEntries = variants.map((variant) => {
  let textClass = variant
  if(variant === 'span' || variant === 'label' || variant === 'strong')
    textClass = 'p'
  const Component = (props: Omit<BaseTextProps<typeof variant>, 'variant'>) =>
    'plainText' in props.stringProps || !!props.i18nTFn ? (
      <ServerBaseText variant={variant} {...props} className={`text-primary-300 text-${textClass}`}/>
    ) : (
      <ClientBaseText variant={variant} {...props} className={`text-primary-300 text-${textClass}`}/>
    );
  Component.displayName = capitalize(variant);
  return [capitalize(variant), Component] as const;
});

// Convert entries to an object
const variantComponents = Object.fromEntries(variantEntries);

// Export typed components
export const { H1, H2, H3, H4, H5, H6, P, Small, Span, Label, Strong } =
  variantComponents as {
    H1: React.FC<Omit<BaseTextProps<'h1'>, 'variant'>>;
    H2: React.FC<Omit<BaseTextProps<'h2'>, 'variant'>>;
    H3: React.FC<Omit<BaseTextProps<'h3'>, 'variant'>>;
    H4: React.FC<Omit<BaseTextProps<'h4'>, 'variant'>>;
    H5: React.FC<Omit<BaseTextProps<'h5'>, 'variant'>>;
    H6: React.FC<Omit<BaseTextProps<'h6'>, 'variant'>>;
    P: React.FC<Omit<BaseTextProps<'p'>, 'variant'>>;
    Small: React.FC<Omit<BaseTextProps<'small'>, 'variant'>>;
    Span: React.FC<Omit<BaseTextProps<'span'>, 'variant'>>;
    Label: React.FC<Omit<BaseTextProps<'label'>, 'variant'>>;
    Strong: React.FC<Omit<BaseTextProps<'strong'>, 'variant'>>;
  };

  const TAILWIND_CLASSES_FOR_CSS = [
    'text-p',
    'text-h1',
    'text-h2',
    'text-h3',
    'text-h4',
    'text-h5',
    'text-h6',
    'text-small',
  ]