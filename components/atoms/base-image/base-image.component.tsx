import Image from 'next/image';
import React from 'react';
import BaseImageProps from './base-image.props';

const BaseImage = ({ src }: BaseImageProps) => {
  return (
    <Image
      src={src}
      alt=''
      fill
      objectFit='cover'
      className='rounded-full overflow-clip'
    ></Image>
  );
};

export default BaseImage;
