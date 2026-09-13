import { NextResponse } from 'next/server'
import { updateApplication, deleteApplication } from '@/lib/store'

export async function PATCH(request, { params }) {
  try {
    const { appId } = params
    const body = await request.json()
    const result = updateApplication(appId, body || {})
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 })
    }
    return NextResponse.json({ success: true, application: result.application })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { appId } = params
  const result = deleteApplication(appId)
  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
