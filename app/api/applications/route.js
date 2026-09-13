import { NextResponse } from 'next/server'
import { getApplications, createApplication } from '@/lib/store'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
  }
  const applications = getApplications(userId)
  return NextResponse.json({ success: true, applications })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, schemeId, status, targetAmount, notes } = body || {}
    if (!userId || !schemeId) {
      return NextResponse.json({ success: false, error: 'userId and schemeId are required' }, { status: 400 })
    }
    const result = createApplication({ userId, schemeId, status, targetAmount, notes })
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 })
    }
    return NextResponse.json({ success: true, application: result.application })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to save application' }, { status: 500 })
  }
}
