import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/catalog'
import { checkEligibility } from '@/lib/matchingEngine'

export async function POST(request) {
  try {
    const body = await request.json()
    const { schemeId, userProfile, businessProfile } = body || {}
    const scheme = getCatalog().find((s) => s.id === schemeId)
    if (!scheme) {
      return NextResponse.json({ success: false, error: 'Scheme not found' }, { status: 404 })
    }
    if (!userProfile || !businessProfile) {
      return NextResponse.json({ success: false, error: 'userProfile and businessProfile are required' }, { status: 400 })
    }

    const result = checkEligibility(scheme, userProfile, businessProfile)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Eligibility check failed' }, { status: 500 })
  }
}
