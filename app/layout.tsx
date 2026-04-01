// 【ファイル概要】
// アプリケーションのルートレイアウトコンポーネントです。
// 全ページ共通のHTML構造、フォント設定、テーマプロバイダー、トースト通知の配置などを行います。

import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Geist } from 'next/font/google'
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

const BASE_URL = 'https://stay-yokaban.33l.jp'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  verification: {
    google: 'KF3rkDn65jGPgGfOCLimZL7UR1urzZo8g8WCrFBGVLA',
  },
  title: {
    default: 'STAY YOKABAN｜鹿児島の民泊・宿泊施設',
    template: '%s | STAY YOKABAN',
  },
  description: '鹿児島の民泊「STAY YOKABAN（ステイヨカバン）」。鹿児島らしいくつろぎの宿泊体験をご提供します。',
  keywords: [
    '鹿児島 民泊', 'STAY YOKABAN', 'ステイヨカバン',
    '鹿児島 宿泊', '鹿児島 ゲストハウス',
  ],
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: 'STAY YOKABAN｜鹿児島の民泊',
    description: '鹿児島の民泊施設 STAY YOKABAN。鹿児島らしいくつろぎの宿泊体験をご提供します。',
    url: `${BASE_URL}/`,
    siteName: 'STAY YOKABAN',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'STAY YOKABAN 鹿児島の民泊',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STAY YOKABAN｜鹿児島の民泊',
    description: '鹿児島の民泊施設 STAY YOKABAN。鹿児島らしいくつろぎの宿泊体験をご提供します。',
    images: ['/opengraph-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

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
      </body>
    </html>
  )
}
