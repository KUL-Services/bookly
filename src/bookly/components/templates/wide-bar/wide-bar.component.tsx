'use client'

import { H1 } from '@/bookly/components/atoms'
import React from 'react'

interface WideBarProps {
  myTextComponent: React.ReactNode
}

const WideBar = ({ myTextComponent }: WideBarProps) => {
  return <div>{myTextComponent}</div>
}

export default WideBar
