import React from "react";
import AvatarProps from "./avatar.props";
import KulIcon from "@/components/atoms/kul-icon/kul-icon.component";
import { BaseImage, H6 } from "@/components/atoms";
import { getInitials } from "@/utils";
import getAvatarSize from "./avatar-size.util";
import clsx from "clsx";

const Avatar = ({
  avatarTitle,
  iconProps,
  imageUrl,
  size,
  testId,
  alt,
}: AvatarProps) => {
  const avatarSize = getAvatarSize(size);
  if (imageUrl)
    return (
      <div
        className={clsx(
          "border-2 rounded-full items-center content-center text-center mb-2 overflow-clip object-cover relative",
          avatarSize
        )}
      >
        <BaseImage src={imageUrl} alt={alt || ""} />
      </div>
    );
  if (iconProps)
    return (
      <div
        className={clsx(
          "border-2 rounded-full items-center content-center text-center mb-2 overflow-clip object-cover relative",
          avatarSize
        )}
      >
        <KulIcon {...iconProps}></KulIcon>
      </div>
    );
  if (avatarTitle) {
    const initials = getInitials(avatarTitle);
    return (
      <div
        className={clsx(
          "border-2 rounded-full items-center content-center text-center mb-2 overflow-clip object-cover relative",
          avatarSize
        )}
      >
        <H6 stringProps={{ plainText: initials }}></H6>
      </div>
    );
  }
};

export default Avatar;
