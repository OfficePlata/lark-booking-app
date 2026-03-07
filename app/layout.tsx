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

export const metadata: Metadata = {
  title: "STAY YOKABAN",
  description: "暮らすように泊まる、心地よいプライベート空間",
  openGraph: {
    title: "STAY YOKABAN",
    description: "暮らすように泊まる、心地よいプライベート空間",
    url: "[https://your-domain.com](https://your-domain.com)",
    siteName: "STAY YOKABAN",
    locale: "ja_JP",
    type: "website",
    // images: ["/opengraph-image.jpg"], // 明示的に指定する場合
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
