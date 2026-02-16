'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const PLANS = [
  {
    name: '基本プラン',
    description: '最大3名様まで',
    price: '¥18,000~',
    unit: '/泊 (2名様)',
    features: [
      '一棟完全貸切',
      'Wi-Fi / 電源完備',
      'キッチン / 調理器具利用可',
      'アメニティ完備',
    ],
    buttonText: '予約する',
    href: '#booking',
    popular: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
          宿泊料金
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          シンプルでわかりやすい料金体系。連泊するほどお得になります。
        </p>
      </div>
      
      <div className="grid w-full justify-center gap-8 pt-8 md:grid-cols-1 lg:max-w-3xl lg:mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg relative' : ''}>
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                人気プラン
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
                <p>※3名様利用について準備中</p>
                <p>※連泊割引あり（2泊で単価¥15,000、3泊以上で¥12,000）</p>
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
