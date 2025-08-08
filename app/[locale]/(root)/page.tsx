'use server';

import initTranslations from '@/app/i18n/i18n';
import {
  BaseImage,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Label,
  P,
  Small,
  Span,
  Strong,
} from '@/components/atoms';
import KulIcon from '@/components/atoms/kul-icon/kul-icon.component';
import { Avatar } from '@/components/molecules';
import WideBar from '@/components/templates/wide-bar/wide-bar.component';
import { FontSize } from '@/constants/enums';
import { PageProps } from '@/types';

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ['common']);

  const renderH1Component = (
    <H1 stringProps={{ localeKey: 'headerTemp' }} i18nTFn={t} />
  );

  return (
    <div className='flex flex-1 flex-col content-center items-center'>
      <H1
        stringProps={{
          localeKey: 'helloPerson',
          localeProps: { userName: 'Spirit' },
        }}
        i18nTFn={t}
      />
      <KulIcon icon={'mdi:bucket'} iconColor='warning-500' />

      <WideBar myTextComponent={renderH1Component} />

      {/* <H1
        fontSize='L'
        type='desc'
        fontStyle='bold'
        stringProps={{ plainText: 'Below me should be a CSR text' }}
      ></H1> */}

      <H1 stringProps={{ plainText: 'This is (H1) text!' }}></H1>
      <H2 stringProps={{ plainText: 'This is (H2) text!' }}></H2>
      <H3 stringProps={{ plainText: 'This is (H3) text!' }}></H3>
      <H4 stringProps={{ plainText: 'This is (H4) text!' }}></H4>
      <H5 stringProps={{ plainText: 'This is (H5) text!' }}></H5>
      <H6 stringProps={{ plainText: 'This is (H6) text!' }}></H6>
      <P stringProps={{ plainText: 'This is (P) text!' }}></P>
      <Small stringProps={{ plainText: 'This is (Small) text!' }}></Small>
      <Span stringProps={{ plainText: 'This is (Span) text!' }}></Span>
      <Label stringProps={{ plainText: 'This is (Label) text!' }}></Label>
      <Strong stringProps={{ plainText: 'This is (Strong) text!' }}></Strong>

      <KulIcon
        icon={'mdi:bucket'}
        iconColor='primary-500'
        fontSize={FontSize.S}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='secondary-500'
        fontSize={FontSize.M}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='alternate-500'
        fontSize={FontSize.L}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='success-500'
        fontSize={FontSize.XL}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='error-500'
        fontSize={FontSize['2XL']}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='warning-500'
        fontSize={FontSize['3XL']}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='white-500'
        fontSize={FontSize['4XL']}
      />
      <KulIcon
        icon={'mdi:bucket'}
        iconColor='black-500'
        fontSize={FontSize['5XL']}
      />

      {/* <BaseImage /> */}

      <Avatar
        avatarTitle={'Adel Asaad'}
        iconProps={{ icon: 'lucide:user-round', fontSize: FontSize['4XL'] }}
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-1170x780.jpg'
        size='S'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbgk0yfCOe55931lf6q0osfhGRU-fnH8Im1g&s'
        size='M'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMdBuvbsYu7WYAAUY2AqSQRGNESsYdkucDkQ&s'
        size='L'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://img.freepik.com/free-photo/teenager-boy-portrait_23-2148105678.jpg'
        size='XL'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://miro.medium.com/v2/resize:fit:400/1*B8c1ED3QV_yaa6PAWqDgMw.png'
        size='2XL'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqMFVc0af6Vxc8UKBootbFQJPfPF-mKyM0hg&s'
        size='3XL'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://wallpapers.com/images/featured/random-pfp-z5antufkwke5j7p6.jpg'
        size='4XL'
      />
      <Avatar
        avatarTitle={'Adel Asaad'}
        imageUrl='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIj-KoXhGHlLBDO0HIu5_s56nqg-y4uEhaMg&s'
        size='5XL'
      />
      <Avatar avatarTitle={'Adel Asaad'} />

      <H1 stringProps={{ plainText: 'Below me should be a CSR text' }}></H1>
      <H1 stringProps={{ localeKey: 'footerTemp' }}></H1>
    </div>
  );
}
