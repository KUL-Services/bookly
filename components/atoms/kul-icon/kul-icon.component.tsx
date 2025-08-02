"use client"
import React from 'react';
import './kul-icon.styles.css'

import { Icon } from '@iconify-icon/react';
const KulIcon = () => {
  return (
    <div className='alert'>
      <Icon icon='mdi:alert' className='my-custom-class' />
      Important notice with alert icon!
    </div>
  );
};

export default KulIcon;
