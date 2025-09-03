'use client';
import { Button } from '@/bookly/components/molecules';
import React from 'react';

const TempButtonHolder = () => {
  return (
    <Button
      buttonText={{ localeKey: 'headerTemp' }}
      prefixIcon={{ icon: 'lucide:arrow-left' }}
      suffixIcon={{ icon: 'lucide:arrow-right' }}
      onClick={() => {
        console.log('prprprprprpr');
      }}
    />
  );
};

export default TempButtonHolder;
