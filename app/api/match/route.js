import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/catalog'
import { computeMatches } from '@/lib/matchingEngine'
import { incrementMatchQueries } from '@/lib/store'

export async function POST(request) {
  try {
    const body = await request.json()
    const { userProfile, businessProfile } = body || {}
    if (!userProfile || !businessProfile) {
      return NextResponse.json({ success: false, error: 'userProfile and businessProfile are required' }, { status: 400 })
    }

    const matches = computeMatches(userProfile, businessProfile, getCatalog())
    const highMatchesCount = matches.filter((m) => m.matchScore >= 80).length
    incrementMatchQueries()

    return NextResponse.json({ success: true, matches, highMatchesCount })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Matching engine failure' }, { status: 500 })
  }
}
