import { NextResponse } from 'next/server'
import { getBookedDates } from '@/lib/lark'

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

export async function GET() {
  const dates = await getBookedDates()
  return NextResponse.json({ dates })
}
