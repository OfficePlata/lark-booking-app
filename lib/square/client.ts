// Square Web Payments SDK Client
// Environment variables required:
// - NEXT_PUBLIC_SQUARE_APP_ID
// - NEXT_PUBLIC_SQUARE_LOCATION_ID
// - SQUARE_ACCESS_TOKEN

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}

export interface PaymentRequest {
  sourceId: string // Payment token from Square Web Payments SDK
  amount: number // Amount in JPY
  currency: 'JPY'
  reservationId: string
  guestName: string
  email: string
}

/**
 * Get Square application ID for client-side SDK
 */
export function getSquareAppId(): string {
  return process.env.NEXT_PUBLIC_SQUARE_APP_ID || ''
}

/**
 * Get Square location ID for client-side SDK
 */
export function getSquareLocationId(): string {
  return process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''
}

/**
 * Check if Square is properly configured
 */
export function isSquareConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SQUARE_APP_ID &&
    process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  )
}

/**
 * Generate a unique idempotency key for payment
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}
