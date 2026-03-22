// 【ファイル概要】
// ダークモード・ライトモードの切り替え機能を提供するテーマプロバイダーです。
// `next-themes` ライブラリを使用し、アプリ全体のカラーモードを管理します。

'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
