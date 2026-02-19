// 【ファイル概要】
// 多言語対応（i18n）のためのContext Providerです。
// 現在の言語設定（日本語/英語）と、それに応じた翻訳データをアプリケーション全体に供給します。

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKeys } from './translations'

interface I18nContextType {
  locale: Locale
  language: Locale // locale のエイリアス（booking-form.tsx 等で使用）
  t: TranslationKeys
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children, defaultLocale = 'ja' }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState(prev => prev === 'ja' ? 'en' : 'ja')
  }, [])

  const t = translations[locale]

  return (
    <I18nContext.Provider value={{ locale, language: locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// useTranslation は useI18n のエイリアス（互換性のため）
export const useTranslation = useI18n
