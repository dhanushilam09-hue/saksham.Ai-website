import { NextResponse } from 'next/server'
import { getAdminStats } from '@/lib/store'

export async function GET() {
  return NextResponse.json({ success: true, stats: getAdminStats() })
}
