'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'

export function PricingSection() {
  const { t } = useI18n()
  
  const PLANS = [
    {
      name: t.pricing.planName,
      description: t.pricing.planDescription,
      price: t.pricing.planPrice,
      unit: t.pricing.planUnit,
      features: [
        t.pricing.feature1,
        t.pricing.feature2,
        t.pricing.feature3,
        t.pricing.feature4,
        t.pricing.feature5,
      ],
      buttonText: t.pricing.bookButton,
      href: '#booking',
      popular: true,
    },
  ]

  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
          {t.pricing.sectionTitle}
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          {t.pricing.sectionSubtitle}
        </p>
      </div>
      
      <div className="grid w-full justify-center gap-8 pt-8 md:grid-cols-1 lg:max-w-3xl lg:mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg relative' : ''}>
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                {t.pricing.popularPlan}
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm font-semibold text-muted-foreground">{plan.unit}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <p>{t.pricing.additionalGuestNote}</p>
                <p>{t.pricing.discountNote}</p>
              </div>
              
              <ul className="mt-8 space-y-3 text-left">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild size="lg">
                <Link href={plan.href}>{plan.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
