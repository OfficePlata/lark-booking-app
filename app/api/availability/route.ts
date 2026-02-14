// 【ファイル概要】
// 予約済みの宿泊日を取得するためのAPIエンドポイントです。
// カレンダーの「予約不可」日付情報をフロントエンドにJSON形式で提供します。
import { NextResponse } from 'next/server'
import { getBookedDates } from '@/lib/lark'

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

export async function GET() {
  const dates = await getBookedDates()
  return NextResponse.json({ dates })
}
