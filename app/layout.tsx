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
  title: {
    default: 'STAY YOKABAN｜鹿児島・天文館の民泊',
    template: '%s | STAY YOKABAN',
  },
  description: '鹿児島市天文館エリアにある民泊「STAY YOKABAN」。暮らすように泊まる、心地よいプライベート空間。チェックイン15:00〜・チェックアウト11:00。',
  keywords: [
    '鹿児島 民泊', '鹿児島 貸切部屋', '天文館 宿泊', '天文館 民泊',
    '鹿児島市 宿泊', 'STAY YOKABAN', 'ステイヨカバン',
    '鹿児島 ホテル', '鹿児島 旅行', '鹿児島 観光', 'Kagoshima Minpaku',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'STAY YOKABAN｜鹿児島・天文館の民泊',
    description: '鹿児島市天文館エリアにある民泊。暮らすように泊まる、心地よいプライベート空間。',
    url: BASE_URL,
    siteName: 'STAY YOKABAN',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'STAY YOKABAN 鹿児島・天文館の民泊',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STAY YOKABAN｜鹿児島・天文館の民泊',
    description: '鹿児島市天文館エリアにある一棟貸し民泊。暮らすように泊まる、心地よいプライベート空間。',
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
