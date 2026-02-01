'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'minimal'
}

export function LanguageSwitcher({ className, variant = 'default' }: LanguageSwitcherProps) {
  const { locale, toggleLocale } = useI18n()

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLocale}
        className={cn(
          'text-sm font-medium hover:text-primary transition-colors',
          className
        )}
      >
        {locale === 'ja' ? 'EN' : 'JP'}
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className={cn('gap-2', className)}
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'ja' ? 'English' : '日本語'}</span>
    </Button>
  )
}
