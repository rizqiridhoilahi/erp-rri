import { ReactNode } from 'react'
import { PublicNavbar } from './components/public-navbar'
import { PublicFooter } from './components/public-footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  )
}
