import { ChevronLeft } from 'lucide-react'
import Button from '../button/button.component'
import { H1 } from '../../atoms'

export function ProfileHeader() {
  return (
    <header className='bg-white border-b border-gray-200 px-4 py-4'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='text' size='sm' className='p-2' prefixIcon={{ icon: 'lucide:chevron-left' }} />

          <H1 stringProps={{ plainText: 'Bookly' }} className='text-2xl font-bold text-teal-600' />
        </div>
        <div className='flex items-center gap-4'>
          <span className='text-gray-700'>Hello Aly</span>
          <Button
            variant='text'
            className='bg-red-500 hover:bg-red-600 text-white'
            buttonText={{ plainText: 'Logout' }}
          />
        </div>
      </div>
    </header>
  )
}
