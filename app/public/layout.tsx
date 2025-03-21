import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { Nav } from '@/components/nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '目录结构查看器',
  description: '快速查看和分析文件夹的目录结构',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} flex flex-col min-h-screen`}>
      <Nav />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 