import { NextResponse } from 'next/server'
import { getCatalog, addCustomScheme } from '@/lib/catalog'

export async function GET() {
  return NextResponse.json({ success: true, schemes: getCatalog() })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, department } = body || {}
    if (!name || !department) {
      return NextResponse.json({ success: false, error: 'Scheme name and department are required' }, { status: 400 })
    }
    const scheme = addCustomScheme(body)
    return NextResponse.json({ success: true, scheme })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to create scheme' }, { status: 500 })
  }
}
