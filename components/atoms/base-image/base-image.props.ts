import { StaticImport } from 'next/dist/shared/lib/get-img-props';

type BaseImageProps = {
  src: string | StaticImport;
};

export default BaseImageProps;
