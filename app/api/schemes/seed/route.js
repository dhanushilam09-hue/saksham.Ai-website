import { NextResponse } from 'next/server'
import { DEMO_SCHEMES } from '@/lib/seedData'
import { resetStore } from '@/lib/store'
import { resetCatalog } from '@/lib/catalog'

export async function POST() {
  resetStore()
  resetCatalog()
  return NextResponse.json({ success: true, count: DEMO_SCHEMES.length })
}
