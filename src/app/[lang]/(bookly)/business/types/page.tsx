'use client'

import { useTranslation } from 'react-i18next'
import { Button } from '@/bookly/components/molecules'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { Scissors, Store, Sparkles, User, Dumbbell, Coffee, Palette, GraduationCap, HeartPulse } from 'lucide-react'

export default function BusinessTypesPage() {
  const { t } = useTranslation()

  const industries = [
    { name: 'Barbers', icon: Scissors, desc: 'Manage appointments, clients, and staff with ease.' },
    { name: 'Salons', icon: Store, desc: 'All-in-one software for hair, nail, and beauty salons.' },
    { name: 'Spas', icon: Sparkles, desc: 'Create a relaxing experience with seamless booking.' },
    { name: 'Health & Wellness', icon: HeartPulse, desc: 'For clinics, therapists, and wellness centers.' },
    { name: 'Fitness', icon: Dumbbell, desc: 'Classes, training sessions, and membership management.' },
    { name: 'Tattoo & Piercing', icon: Palette, desc: 'Manage deposits and consultations efficiently.' },
    { name: 'Education', icon: GraduationCap, desc: 'Schedule classes, tutors, and workshops.' },
    { name: 'Professional Services', icon: User, desc: 'For consultants, lawyers, and other professionals.' },
    { name: 'Other', icon: Coffee, desc: 'Flexible tools for any service-based business.' }
  ]

  return (
    <div className='min-h-screen pb-20'>
      {/* Hero */}
      <section className='relative bg-[#0a2c24] text-white py-24 px-4 overflow-hidden'>
        <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-10' />
        <div className='relative z-10 max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6 font-sans'>
            Built for <span className='text-[#77b6a3]'>your industry</span>
          </h1>
          <p className='text-xl text-gray-300 max-w-2xl mx-auto mb-10'>
            Zerv provides specialized tools to help you run your business your way.
          </p>
          <Button
            className='bg-[#77b6a3] hover:bg-[#5da891] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl'
            buttonText={{ plainText: 'Find your solution' }}
            onClick={() => {
              document.getElementById('industries-grid')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </div>
      </section>

      {/* Industries Grid */}
      <section id='industries-grid' className='py-20 px-4 max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {industries.map((industry, idx) => (
            <ScrollReveal key={idx} delay={idx * 50} animation='fade-up'>
              <div className='bg-white dark:bg-[#202c39] p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:-translate-y-1 group cursor-pointer'>
                <div className='w-14 h-14 bg-[#f7f8f9] dark:bg-[#15232d] rounded-xl flex items-center justify-center text-[#77b6a3] mb-6 group-hover:bg-[#77b6a3] group-hover:text-white transition-colors'>
                  <industry.icon size={28} />
                </div>
                <h3 className='text-2xl font-bold text-[#202c39] dark:text-white mb-3'>{industry.name}</h3>
                <p className='text-gray-500 dark:text-gray-400 mb-6'>{industry.desc}</p>
                <div className='flex items-center text-[#77b6a3] font-bold group-hover:translate-x-2 transition-transform'>
                  Learn more <i className='ri-arrow-right-line ml-2'></i>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Don't see your industry? */}
      <section className='bg-[#f7f8f9] dark:bg-[#1a2430] py-16 px-4 rounded-3xl mx-4 max-w-7xl lg:mx-auto text-center'>
        <h2 className='text-3xl font-bold text-[#202c39] dark:text-white mb-4'>Don't see your industry?</h2>
        <p className='text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8'>
          Zerv is flexible enough to work for almost any service-based business. Get in touch to see how we can help.
        </p>
        <Button
          variant='outlined'
          className='border-[#202c39] text-[#202c39] dark:border-white dark:text-white hover:bg-[#202c39] hover:text-white dark:hover:bg-white dark:hover:text-[#0a2c24] px-8 py-3 rounded-full font-bold'
          buttonText={{ plainText: 'Contact Sales' }}
        />
      </section>
    </div>
  )
}
