'use client'

import { useState } from 'react'
import { ScrollReveal } from '@/bookly/components/molecules/scroll-reveal'
import { Button } from '@/bookly/components/molecules'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for solo entrepreneurs ready to professionalize.',
      price: { monthly: 29, annual: 19 },
      features: [
        '24/7 Online Booking',
        'Basic Client CRM',
        'Mobile App for You',
        'Automated Reminders (Email)',
        'basic_reporting'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Growth',
      description: 'The complete toolkit for growing teams and maximizing revenue.',
      price: { monthly: 79, annual: 49 },
      features: [
        'Everything in Starter',
        'Unlimited Staff Members',
        'Integrated Marketing Suite',
        'Automated Reminders (SMS & Email)',
        'Advanced Analytics & Reporting',
        'Inventory Management',
        'POS & Deposits'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Elite',
      description: 'For established brands demanding branding and priority support.',
      price: { monthly: 149, annual: 99 },
      features: [
        'Everything in Growth',
        'White-label Client App',
        'Priority Phone Support',
        'Dedicated Account Manager',
        'Custom API Access',
        'Multi-location Management'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  return (
    <div className='bg-background min-h-screen font-sans selection:bg-teal-500/30'>
      {/* 1. Hero Section */}
      <section className='relative pt-32 pb-20 px-4 bg-[#0a2c24] overflow-hidden text-center'>
        <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2929&auto=format&fit=crop")] bg-cover bg-center opacity-10 mix-blend-overlay'></div>
        <div className='absolute inset-0 bg-gradient-to-b from-[#0a2c24] via-[#0a2c24]/90 to-[#0a2c24]'></div>

        <div className='relative z-10 max-w-4xl mx-auto'>
          <ScrollReveal animation='fade-up'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sage-400 text-sm font-medium mb-8 backdrop-blur-sm'>
              <span className='w-2 h-2 rounded-full bg-sage-500 animate-pulse'></span>
              30-Day Free Trial • No Credit Card Required
            </div>
            <h1 className='text-5xl md:text-7xl font-bold text-white mb-6 leading-tight'>
              Invest in your{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400'>
                Empire.
              </span>
            </h1>
            <p className='text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-light'>
              Choose the plan that fits your stage of growth. Upgrade, downgrade, or cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className='inline-flex items-center p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8'>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'border border-white bg-white text-[#0a2c24]'
                    : 'border border-white/40 bg-transparent text-gray-300 hover:bg-white hover:text-[#0a2c24]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'border border-sage-500 bg-sage-500 text-[#0a2c24]'
                    : 'border border-sage-500/60 bg-transparent text-sage-300 hover:bg-sage-500 hover:text-[#0a2c24]'
                }`}
              >
                Annual{' '}
                <span className='text-[10px] bg-[#0a2c24] text-sage-500 px-2 py-0.5 rounded-full uppercase tracking-wider'>
                  Save 30%
                </span>
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Pricing Cards */}
      <section className='py-20 px-4 -mt-20 relative z-20'>
        <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          {plans.map((plan, idx) => (
            <ScrollReveal key={plan.name} delay={idx * 100} animation='fade-up' className='h-full'>
              <div
                className={`relative h-full p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col ${
                  plan.highlighted
                    ? 'bg-[#0a2c24] border-sage-500 shadow-2xl shadow-sage-500/20 scale-105 md:-translate-y-4'
                    : 'bg-white dark:bg-[#202c39] border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl'
                }`}
              >
                {plan.highlighted && (
                  <div className='absolute top-0 inset-x-0 -mt-4 flex justify-center'>
                    <span className='bg-sage-500 text-[#0a2c24] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg'>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className='mb-8'>
                  <h3
                    className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-secondary-600 dark:text-white'}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm h-10 ${plan.highlighted ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className='mb-8'>
                  <div className='flex items-baseline gap-1'>
                    <span
                      className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-secondary-600 dark:text-white'}`}
                    >
                      EGP {billingCycle === 'annual' ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className={`text-lg ${plan.highlighted ? 'text-gray-400' : 'text-gray-400'}`}>/mo</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className='text-sm text-sage-500 font-medium mt-2'>
                      Billed EGP {plan.price.annual * 12} yearly
                    </div>
                  )}
                </div>

                <div className='flex-1 mb-8'>
                  <ul className='space-y-4'>
                    {plan.features.map((feature, i) => (
                      <li key={i} className='flex items-start gap-3'>
                        <div
                          className={`mt-1 p-0.5 rounded-full ${plan.highlighted ? 'bg-sage-500/20 text-sage-500' : 'bg-teal-500/10 text-teal-600'}`}
                        >
                          <i className='ri-check-line text-xs font-bold'></i>
                        </div>
                        <span
                          className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                          {feature === 'basic_reporting' ? 'Basic Reporting' : feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  className={`w-full py-6 text-lg rounded-2xl font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-transparent border border-sage-500 text-sage-500 hover:bg-sage-500 hover:text-[#0a2c24]'
                      : 'border-gray-200 dark:border-white/20 bg-transparent text-secondary-600 dark:text-white hover:bg-[#0a2c24] hover:text-white dark:hover:bg-white/10'
                  }`}
                  buttonText={{ plainText: plan.cta }}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 3. Comparison Table */}
      <section className='py-24 bg-white dark:bg-[#202c39]'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-secondary-600 dark:text-white mb-4'>Compare Features</h2>
            <p className='text-gray-500 dark:text-gray-400'>Detailed breakdown of what's included.</p>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='border-b border-gray-100 dark:border-white/10'>
                  <th className='py-6 px-4 text-gray-400 font-medium w-1/3'>Feature</th>
                  <th className='py-6 px-4 text-center text-xl font-bold text-secondary-600 dark:text-white w-1/5'>
                    Starter
                  </th>
                  <th className='py-6 px-4 text-center text-xl font-bold text-sage-500 w-1/5'>Growth</th>
                  <th className='py-6 px-4 text-center text-xl font-bold text-secondary-600 dark:text-white w-1/5'>
                    Elite
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-white/5 text-gray-600 dark:text-gray-300'>
                {[
                  { name: 'Calendar & Booking', starter: true, growth: true, elite: true },
                  { name: 'Client Profile (CRM)', starter: 'Basic', growth: 'Advanced', elite: 'Advanced' },
                  { name: 'Staff Accounts', starter: '1 User', growth: 'Unlimited', elite: 'Unlimited' },
                  { name: 'Marketing Automated (Email/SMS)', starter: false, growth: true, elite: true },
                  { name: 'Inventory Management', starter: false, growth: true, elite: true },
                  { name: 'White-label Client App', starter: false, growth: false, elite: true },
                  { name: 'Multiple Locations', starter: false, growth: 'Add-on', elite: true },
                  { name: 'Priority Support', starter: 'Email', growth: 'Chat & Email', elite: '24/7 Phone' }
                ].map((row, i) => (
                  <tr key={i} className='hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'>
                    <td className='py-4 px-4 font-medium'>{row.name}</td>
                    <td className='py-4 px-4 text-center'>
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <i className='ri-check-line text-teal-500 text-xl'></i>
                        ) : (
                          <i className='ri-close-line text-gray-300'></i>
                        )
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className='py-4 px-4 text-center font-bold text-secondary-800 dark:text-white bg-sage-500/5'>
                      {typeof row.growth === 'boolean' ? (
                        row.growth ? (
                          <i className='ri-check-line text-sage-500 text-xl font-bold'></i>
                        ) : (
                          <i className='ri-close-line text-gray-300'></i>
                        )
                      ) : (
                        row.growth
                      )}
                    </td>
                    <td className='py-4 px-4 text-center'>
                      {typeof row.elite === 'boolean' ? (
                        row.elite ? (
                          <i className='ri-check-line text-teal-500 text-xl'></i>
                        ) : (
                          <i className='ri-close-line text-gray-300'></i>
                        )
                      ) : (
                        row.elite
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className='py-24 bg-[#0a2c24] text-white'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12 text-center'>Frequently Asked Questions</h2>
          <div className='grid gap-6'>
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.'
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No. Zerv is pay-as-you-go. You can cancel monthly plans at any time. Annual plans are paid upfront for a discount.'
              },
              {
                q: 'Do you charge transaction fees?',
                a: 'Zerv does not charge booking fees. However, standard Stripe/Square processing fees apply for card payments.'
              }
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100} animation='fade-up'>
                <div className='bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer'>
                  <h3 className='text-lg font-bold mb-2 text-sage-400'>{item.q}</h3>
                  <p className='text-gray-300 leading-relaxed'>{item.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className='mt-16 text-center'>
            <Button
              variant='text'
              className='text-white hover:text-sage-400'
              buttonText={{ plainText: 'Have more questions? Contact Support' }}
              onClick={() => (window.location.href = '/contact')}
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className='py-20 bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-center'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-4xl font-bold mb-6'>Ready to scale?</h2>
          <p className='text-xl opacity-90 mb-10'>Join 2,000+ businesses growing with Zerv today.</p>
          <Button
            variant='contained'
            className='bg-white text-teal-600 hover:bg-gray-100 px-12 py-5 rounded-full text-lg font-bold shadow-2xl'
            buttonText={{ plainText: 'Start 30-Day Free Trial' }}
          />
        </div>
      </section>
    </div>
  )
}
