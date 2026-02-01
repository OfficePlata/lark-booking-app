'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency } from '@/lib/booking/pricing'
import { cn } from '@/lib/utils'
import { Lock, CreditCard, Loader2 } from 'lucide-react'

// Square Web Payments SDK types
interface SquareCard {
  attach: (elementId: string) => Promise<void>
  tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>
  destroy: () => void
}

interface SquarePayments {
  card: () => Promise<SquareCard>
}

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>
    }
  }
}

interface SquarePaymentFormProps {
  amount: number
  guestName: string
  email: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export function SquarePaymentForm({
  amount,
  guestName,
  email,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  onSuccess,
  onError,
}: SquarePaymentFormProps) {
  const { locale, t } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardInstance, setCardInstance] = useState<SquareCard | null>(null)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const initializingRef = useRef(false)

  const squareAppId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
  const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

  // Load Square SDK
  useEffect(() => {
    // Skip if already loaded or missing config
    if (!squareAppId || !squareLocationId) {
      setSdkError('Square payment is not configured')
      setIsLoading(false)
      return
    }

    // Check if SDK is already loaded
    if (window.Square) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js' // Use sandbox for testing
    // For production: 'https://web.squarecdn.com/v1/square.js'
    script.async = true
    script.onload = () => {
      // SDK loaded, initialization will happen in the next useEffect
    }
    script.onerror = () => {
      setSdkError('Failed to load payment system')
      setIsLoading(false)
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup script if needed
    }
  }, [squareAppId, squareLocationId])

  // Initialize Square card form
  useEffect(() => {
    async function initializeCard() {
      if (initializingRef.current) return
      if (!window.Square) return
      if (!squareAppId || !squareLocationId) return
      if (!cardContainerRef.current) return

      initializingRef.current = true
      
      try {
        const payments = await window.Square.payments(squareAppId, squareLocationId)
        const card = await payments.card()
        await card.attach('#card-container')
        setCardInstance(card)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize Square card:', error)
        setSdkError('Failed to initialize payment form')
        setIsLoading(false)
      }
    }

    // Wait for Square SDK to be available
    const checkInterval = setInterval(() => {
      if (window.Square) {
        clearInterval(checkInterval)
        initializeCard()
      }
    }, 100)

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval)
      if (!cardInstance && !sdkError) {
        setSdkError('Payment system took too long to load')
        setIsLoading(false)
      }
    }, 10000)

    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
      if (cardInstance) {
        cardInstance.destroy()
      }
    }
  }, [squareAppId, squareLocationId, cardInstance, sdkError])

  const handlePayment = useCallback(async () => {
    if (!cardInstance) {
      onError('Payment form not ready')
      return
    }

    setIsProcessing(true)

    try {
      // Tokenize the card
      const result = await cardInstance.tokenize()

      if (result.status === 'OK' && result.token) {
        // Send to our API
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: result.token,
            guestName,
            email,
            checkInDate,
            checkOutDate,
            numberOfGuests,
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          onSuccess(data.payment.transactionId)
        } else {
          onError(data.error || 'Payment failed')
        }
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Failed to process card'
        onError(errorMessage)
      }
    } catch (error) {
      console.error('Payment error:', error)
      onError('Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }, [cardInstance, guestName, email, checkInDate, checkOutDate, numberOfGuests, onSuccess, onError])

  if (sdkError) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-destructive mb-4">{sdkError}</p>
          <p className="text-sm text-muted-foreground">
            {locale === 'ja' 
              ? '決済システムの読み込みに失敗しました。ページを再読み込みしてください。' 
              : 'Failed to load payment system. Please refresh the page.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        {t.booking.paymentInfo}
      </h3>

      {/* Amount to Pay */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">{t.booking.totalAmount}</p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(amount, locale)}</p>
      </div>

      {/* Card Input Container */}
      <div className="space-y-4">
        <div 
          id="card-container" 
          ref={cardContainerRef}
          className={cn(
            'min-h-[50px] p-3 border border-input rounded-md bg-background',
            isLoading && 'animate-pulse'
          )}
        >
          {isLoading && (
            <div className="flex items-center justify-center py-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">{t.common.loading}</span>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>
            {locale === 'ja' 
              ? 'お支払い情報は暗号化されて安全に送信されます' 
              : 'Your payment information is encrypted and secure'}
          </span>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || isProcessing || !cardInstance}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t.payment.processing}
            </>
          ) : (
            <>
              {t.booking.reserve} - {formatCurrency(amount, locale)}
            </>
          )}
        </Button>
      </div>

      {/* Powered by Square */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Powered by Square
      </p>
    </div>
  )
}
