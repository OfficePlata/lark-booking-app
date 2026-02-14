// 【ファイル概要】
// アプリケーションのルートレイアウトコンポーネントです。
// 全ページ共通のHTML構造、フォント設定、テーマプロバイダー、トースト通知の配置などを行います。

import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/lib/i18n/context'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-jp',
})

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'YADO | Accommodation Booking',
  description: 'Experience true relaxation in a serene space surrounded by nature. Book your stay at our beautiful accommodation.',
  generator: 'v0.app',
  keywords: ['accommodation', 'booking', 'Japan', 'ryokan', 'vacation rental'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2d5a41',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${geist.variable} font-sans antialiased`}>
        <I18nProvider defaultLocale="ja">
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
