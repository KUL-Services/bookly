"use client"

import { H1 } from '@/bookly/components/atoms';
import React, { ReactNode } from 'react';

const WideBar = ({ myTextComponent }: { myTextComponent: ReactNode }) => {
  return <div>{myTextComponent}</div>;
};

export default WideBar;
