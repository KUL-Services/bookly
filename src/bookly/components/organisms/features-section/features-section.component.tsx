import { Badge } from '@/bookly/components/ui/badge'
import { Check, Calendar, Star, Shield } from 'lucide-react'
import { InlineZervLogo } from '../../atoms/inline-zerv-logo'

export const FeaturesSection = () => {
  const features = [
    {
      title: 'Ease of Booking',
      description: 'Book your appointments in seconds with our intuitive flow.',
      icon: Calendar,
      color: 'bg-sage-100 text-sage-600'
    },
    {
      title: 'Trusted Reviews',
      description: 'Verified reviews from real customers you can trust.',
      icon: Star,
      color: 'bg-coral-100 text-coral-600'
    },
    {
      title: 'Secure Payments',
      description: 'Pay seamlessly and securely through the app.',
      icon: Shield,
      color: 'bg-teal-100 text-teal-600'
    },
    {
      title: 'Instant Confirmation',
      description: 'Get immediate confirmation with our Z-check guarantee.',
      icon: Check,
      color: 'bg-[#0a2c24]/10 text-[#0a2c24]'
    }
  ]

  return (
    <section className='py-16 sm:py-24 lg:py-32 overflow-hidden bg-[#f7f8f9] dark:bg-[#0a2c24] relative'>
      {/* Background Decoration */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]'>
        <div className='absolute right-0 top-0 transform translate-x-1/3 -translate-y-1/3 w-[800px] h-[800px] rounded-full border-[60px] border-[#0a2c24] dark:border-white' />
      </div>

      <div className='container mx-auto px-4 sm:px-6 relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
          {/* Left Side: Content */}
          <div className='space-y-8'>
            <div>
              <Badge
                variant='outline'
                className='mb-4 text-[#0a2c24] border-[#0a2c24] dark:text-white dark:border-white px-4 py-1 rounded-full text-xs uppercase tracking-widest font-bold'
              >
                Why Choose Us
              </Badge>
              <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0a2c24] dark:text-white leading-tight'>
                Experience the{' '}
                <InlineZervLogo color='green' className='h-[2em] w-[2.25em] translate-y-[0.3em] translate-x-8' />
              </h2>
              <p className='mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed font-light'>
                We combine luxury design with seamless functionality to provide the best booking experience on the
                market.
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className='flex flex-col gap-4 p-6 rounded-[2rem] bg-white dark:bg-[#202c39] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group'
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${feature.color} transition-transform group-hover:scale-110`}
                  >
                    <feature.icon className='w-6 h-6' />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-[#0a2c24] dark:text-white mb-2 font-fira'>{feature.title}</h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-helvetica'>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Mockup / Z-Pattern */}
          <div className='relative lg:h-[600px] w-full flex items-center justify-center'>
            {/* Abstract Z Layout */}
            <div className='relative w-full max-w-md aspect-[3/4]'>
              <div className='absolute inset-0 bg-[#0a2c24] rounded-[3rem] transform -rotate-6 shadow-2xl z-10 overflow-hidden'>
                <div className='absolute inset-0 bg-zerv-pattern opacity-10' />
                {/* Mock App Interface or Gradient */}
                <div className='absolute inset-0 bg-gradient-to-br from-[#0a2c24] to-[#202c39]' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <img
                    src='/brand/zerv-z.svg'
                    alt='Zerv Logo'
                    className='w-48 h-48 opacity-20 invert brightness-0 filter'
                  />
                </div>
              </div>
              <div className='absolute inset-0 bg-[#77b6a3] rounded-[3rem] transform rotate-3 scale-95 origin-bottom-right z-0 opacity-80' />

              {/* Floating Badge */}
              <div className='absolute -right-8 top-1/4 bg-white dark:bg-[#202c39] p-4 rounded-[2rem] shadow-xl z-20 flex items-center gap-3 animate-float'>
                <div className='bg-green-100 p-2 rounded-full text-green-600'>
                  <Check className='w-6 h-6' />
                </div>
                <div>
                  <p className='text-xs text-gray-400 font-bold uppercase'>Status</p>
                  <p className='text-sm font-bold text-[#0a2c24] dark:text-white'>Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
