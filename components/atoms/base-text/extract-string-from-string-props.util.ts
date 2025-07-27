import { StringProps } from '@/types';
import { i18n } from 'i18next';

function extractStringFromStringProps(stringProps: StringProps, t: i18n['t']) {
  if ('plainText' in stringProps) {
    // stringProps is of type { plainText: string }
    return stringProps.plainText;
  } else if ('localeKey' in stringProps) {
    // stringProps is of type { localeKey: string; localeProps?: ... }
    return `${t(stringProps.localeKey, stringProps.localeProps)}`; //TODO: i18n integration;
  } else return undefined;
}

export default extractStringFromStringProps;
