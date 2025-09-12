import Avatar from '../avatar/avatar.component'
import { H1, H2, KulIcon } from '../../atoms'
import Button from '../button/button.component'
import { mockBusinesses } from '@/bookly/data/mock-data'
import { Card } from '../../ui/card'

function ProfileInfo() {
  const mockData = mockBusinesses[0]

  return (
    <Card className='p-8 border border-gray-300 shadow-lg'>
      <div className='flex flex-col md:flex-row items-start gap-6'>
        <Avatar avatarTitle='Aly Lashin' imageUrl={mockData.coverImage} size='6XL' alt='Aly Lashin' />

        <div className='flex-1 space-y-4'>
          <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 '>
            <div className='flex flex-col gap-2'>
              <H1 stringProps={{ plainText: 'Aly Lashin' }} className='text-2xl font-bold text-gray-900' />
              <div className='flex items-center gap-2 text-gray-600 mt-1'>
                <KulIcon icon={'lucide:mail'} />
                <span>yung@jy.com</span>
              </div>
              <div className='flex items-center gap-2 text-gray-600 mt-1'>
                <KulIcon icon={'lucide:phone'} />
                <span>+44 7700 900456</span>
              </div>
              <div className='flex items-center gap-2 text-gray-600 mt-1'>
                <KulIcon icon={'lucide:calendar'} />
                <span>Member since June 2023</span>
              </div>
            </div>
            <Button buttonText={{ plainText: 'Edit Profile' }} className='bg-teal-500 hover:bg-teal-600 text-white' />
          </div>

          <div className='flex flex-wrap gap-8 pt-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-teal-500'>12</div>
              <div className='text-sm text-gray-600'>Total Bookings</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-teal-500'>2</div>
              <div className='text-sm text-gray-600'>Favorites</div>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1'>
                <KulIcon icon={'lucide:star'} iconClass='h-5 w-5 fill-yellow-400 text-yellow-400' />

                <span className='text-3xl font-bold text-teal-500'>4.8</span>
              </div>
              <div className='text-sm text-gray-600'>Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProfileInfo
