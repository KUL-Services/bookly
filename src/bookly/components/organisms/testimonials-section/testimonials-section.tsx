'use client'

import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { ZWatermark } from '@/bookly/components/atoms/zerv-assets'

const testimonials = [
  {
    quote: 'Since switching to Zerv, my no-shows have dropped to almost zero. The automated reminders are a lifesaver.',
    author: 'Maria Rodriguez',
    role: 'Owner, Luxe Studio',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
  },
  {
    quote:
      "The marketing tools helped me fill my calendar in the first month. I can't imagine running my barbershop without it.",
    author: 'James Chen',
    role: 'Master Barber, The Cut',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'
  },
  {
    quote: 'Clients love how easy it is to book. It looks professional and saves me hours of admin time every week.',
    author: 'Sarah Johnson',
    role: 'Freelance Stylist',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'
  }
]

export const TestimonialsSection = () => {
  return (
    <section className='py-24 bg-white dark:bg-[#202c39] relative overflow-hidden'>
      <ZWatermark className='opacity-[0.03] top-10 left-0' />
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold text-[#202c39] dark:text-white mb-6'>Loved by professionals</h2>
          <p className='text-xl text-gray-500 max-w-2xl mx-auto'>
            Join thousands of business owners who trust Zerv to power their success.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {testimonials.map((t, idx) => (
            <ScrollReveal
              key={idx}
              delay={idx * 100}
              className='bg-[#f7f8f9] dark:bg-[#0a2c24] p-8 rounded-3xl relative'
            >
              {/* Quote Icon */}
              <div className='absolute top-6 right-6 text-4xl text-[#77b6a3] opacity-20'>
                <i className='ri-double-quotes-r'></i>
              </div>

              <div className='flex items-center gap-4 mb-6'>
                <img
                  src={t.image}
                  alt={t.author}
                  className='w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#202c39]'
                />
                <div>
                  <h4 className='font-bold text-[#202c39] dark:text-white'>{t.author}</h4>
                  <p className='text-sm text-[#77b6a3]'>{t.role}</p>
                </div>
              </div>

              <p className='text-gray-600 dark:text-gray-300 italic leading-relaxed'>"{t.quote}"</p>

              {/* Stars */}
              <div className='flex text-yellow-400 mt-6 text-sm'>
                {[...Array(5)].map((_, i) => (
                  <i key={i} className='ri-star-fill'></i>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
