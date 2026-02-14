// 【ファイル概要】
// 予約済みの宿泊日を取得するためのAPIエンドポイントです。
// カレンダーの「予約不可」日付情報をフロントエンドにJSON形式で提供します。
// 【ファイル概要】
// 予約済みの宿泊日を取得するためのAPIエンドポイントです。

import { NextRequest, NextResponse } from 'next/server'
import { getBookedDates, getBookedDatesInRange } from '@/lib/lark'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // カレンダー表示用に範囲指定で取得する場合
    if (action === 'booked-dates') {
      const startDate = searchParams.get('start')
      const endDate = searchParams.get('end')
      
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Start and end dates are required' },
          { status: 400 }
        )
      }
      
      const bookedDates = await getBookedDatesInRange(startDate, endDate)
      return NextResponse.json({ bookedDates })
    }
    
    // デフォルト: 未来のすべての予約済み日付リストを返す (DatePickerでの無効化用)
    const bookedDates = await getBookedDates()
    return NextResponse.json({ bookedDates })
    
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
