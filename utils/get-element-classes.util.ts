import { AppClass } from '@/bookly/types';

/**
 * Takes two `AppClasses` and returns a combines string of both.
 * @param addedClass Class or classes you want to add to an element
 * @param baseClass Class or classes that are base to this element
 * @returns Combined string of `addedClass` and `baseClass` ready to be used directly in the element `className`
 */
function getElementClasses(addedClass?: AppClass, baseClass?: AppClass) {
  if (!!baseClass) {
    if (Array.isArray(baseClass)) {
      baseClass = baseClass.join(' ');
    }
  }

  if (!!addedClass) {
    baseClass = !!baseClass ? baseClass + ' ' : '';
    if (Array.isArray(addedClass)) {
      return baseClass + addedClass.join(' ');
    }
    return baseClass + addedClass;
  }
  return !!baseClass ? baseClass : undefined;
}

export default getElementClasses;
