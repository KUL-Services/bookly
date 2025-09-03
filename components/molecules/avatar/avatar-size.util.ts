import ElementSize from '@/bookly/types/element-size.type';

const getAvatarSize = (elementSize?: ElementSize) => {
  switch (elementSize) {
    case 'S':
      return 'w-8 h-8';
    case 'M':
      return 'w-10 h-10';
    case 'L':
      return 'w-11 h-11';
    case 'XL':
      return 'w-12 h-12';
    case '2XL':
      return 'w-13 h-13';
    case '3XL':
      return 'w-14 h-14';
    case '4XL':
      return 'w-15 h-15';
    case '5XL':
      return 'w-16 h-16';
    default:
      return 'w-8 h-8';
  }
};
export default getAvatarSize;
