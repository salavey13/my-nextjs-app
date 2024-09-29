'use client'

import { usePathname } from 'next/navigation'
import BottomShelf from './ui/bottomShelf'

interface PageWrapperProps {
  children: React.ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  const showBottomShelf = pathname !== '/' 
//&& pathname !== '/hackbutton'
  return (
    <>
      {children}
      {showBottomShelf && <BottomShelf />}
    </>
  )
}