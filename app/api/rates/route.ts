// 【ファイル概要】
// フロントエンドが最新の「特別料金」情報を取得するためのAPIです。

import { NextResponse } from 'next/server'
import { getSpecialRates } from '@/lib/lark'

export const runtime = 'edge'

export async function GET() {
  try {
    const rates = await getSpecialRates()
    return NextResponse.json({ rates })
  } catch (error) {
    console.error('Rates Fetch Error:', error)
    return NextResponse.json({ rates: [] })
  }
}
