import Image from "next/image";
import React from "react";
import BaseImageProps from "./base-image.props";

const BaseImage = ({
  src,
  loading = "lazy",
  priority = false,
  width,
  height,
  alt,
}: BaseImageProps) => {
  return (
    <Image
      src={src}
      alt={alt || ""}
      fill={!width || !height}
      objectFit="cover"
      className="rounded-full overflow-clip"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading={loading}
      priority={priority}
    ></Image>
  );
};

export default BaseImage;
