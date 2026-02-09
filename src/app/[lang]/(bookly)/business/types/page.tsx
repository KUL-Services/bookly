'use client'

import { Scissors, Store, Sparkles, User, Dumbbell, Coffee, Palette, GraduationCap, HeartPulse } from 'lucide-react'

import { Button } from '@/bookly/components/molecules'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'

export default function BusinessTypesPage() {
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
        <div className='rounded-[2.5rem] border border-[#0a2c24]/10 bg-gradient-to-b from-[#eff6f3] via-white to-[#f7f8f9] p-6 md:p-10 shadow-[0_40px_70px_-55px_rgba(10,44,36,0.9)]'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch'>
            {industries.map((industry, idx) => (
              <ScrollReveal key={idx} delay={idx * 50} animation='fade-up'>
                <div className='group h-full min-h-[330px] rounded-[2.25rem] border border-[#0a2c24]/12 bg-gradient-to-br from-[#e6f1ee] via-[#edf5f3] to-[#f9fbfa] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#5ea893]/45 hover:bg-gradient-to-br hover:from-[#6fb5a1] hover:to-[#5ea893] hover:shadow-[0_24px_45px_-30px_rgba(10,44,36,0.85)] cursor-pointer flex flex-col'>
                  <div className='mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/70 bg-white/65 text-[#0a2c24] shadow-[0_16px_30px_-22px_rgba(10,44,36,0.75)] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/20 group-hover:text-white group-hover:shadow-[0_18px_30px_-18px_rgba(10,44,36,0.8)]'>
                    <industry.icon size={34} />
                  </div>
                  <h3 className='text-center text-[2rem] font-bold text-[#0a2c24] mb-4 leading-tight group-hover:text-white'>
                    {industry.name}
                  </h3>
                  <p className='text-center text-[#0a2c24]/70 mb-8 flex-1 leading-relaxed group-hover:text-white/90'>
                    {industry.desc}
                  </p>
                  <div className='mt-auto flex items-center justify-center text-sm font-bold tracking-wide text-[#0a2c24]/80 group-hover:text-white transition-colors'>
                    Explore solution <i className='ri-arrow-right-line ml-2'></i>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Don't see your industry? */}
      <section className='bg-[#f7f8f9] dark:bg-[#1a2430] py-16 px-4 rounded-3xl mx-4 max-w-7xl lg:mx-auto text-center'>
        <h2 className='text-3xl font-bold text-[#202c39] dark:text-white mb-4'>Don&apos;t see your industry?</h2>
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
