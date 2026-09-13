import { NextResponse } from 'next/server'
import { getNotifications } from '@/lib/store'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
  }
  const notifications = getNotifications(userId)
  return NextResponse.json({ success: true, notifications })
}
