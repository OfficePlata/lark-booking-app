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
            <h3 className="text-2xl font-semibold mb-4">YADO</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              {locale === 'ja' 
                ? '自然に囲まれた静かな空間で、心からのくつろぎをお届けします。特別な時間を、特別な場所で。'
                : 'Experience true relaxation in a serene space surrounded by nature. A special place for special moments.'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li>
                <a 
                  href="mailto:info@example.com" 
                  className="flex items-center gap-2 hover:text-background transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  info@example.com
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-background transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @yado_official
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
                  ? '〒000-0000\n東京都XX区XX町1-2-3'
                  : '1-2-3 XX-cho, XX-ku\nTokyo 000-0000, Japan'}
              </span>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} YADO. {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
