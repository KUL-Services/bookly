import { StaticImport } from "next/dist/shared/lib/get-img-props";

type BaseImageProps = {
  src: string | StaticImport;
  loading?: "lazy" | "eager";
  priority?: boolean;
  width?: number;
  height?: number;
  alt?: string; // this acts like a description for the image until its loaded like daniel explained before, or if it fails to load, also the SEO engines use the alt to understand the content of the image
};

export default BaseImageProps;
