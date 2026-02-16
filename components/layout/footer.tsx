// 【ファイル概要】
// ウェブサイトのフッター（最下部）コンポーネントです。
// コピーライト表記や、主要なリンク、SNSリンクなどを配置します。

'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { Instagram, Mail, MapPin } from 'lucide-react'

export function Footer() {
  const { locale, t } = useI18n()

  return (
    <footer id="access" className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Stay Yokaban</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              {locale === 'ja' 
                ? 'Stay Yokaban - 天文館で過ごす、特別な夜'
                : 'Stay Yokaban - Your Night in Tenmonkan'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li>
                <a 
                  href="mailto:zundare.hogane017@gmail.com" 
                  className="flex items-center gap-2 hover:text-background transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  zundare.hogane017@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/017mori?igsh=MWY4empxMzQxaWFrbg==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-background transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @017mori
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-medium mb-4">{t.footer.address}</h4>
            <address className="not-italic text-sm text-background/70 flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {locale === 'ja' 
                  ? '〒892-0843\n鹿児島市千日町9-23銀座ハイツ506号'
                  : 'Room 506, Ginza Heights, 9-23 Sennichi-cho, Kagoshima City\nKagoshima 892-0843, Japan'}
              </span>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} Stay Yokaban. {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
