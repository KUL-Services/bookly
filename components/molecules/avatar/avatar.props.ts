import { KulIconProps } from '@/components/atoms/kul-icon/kul-icon.props';
import ElementSize from '@/types/element-size.type';

type AvatarProps = {
  iconProps?: Omit<KulIconProps, 'testId'>;
  imageUrl?: string;
  avatarTitle: string;
  size?: ElementSize;
  testId?: string;
  alt?: string;
};

export default AvatarProps;
