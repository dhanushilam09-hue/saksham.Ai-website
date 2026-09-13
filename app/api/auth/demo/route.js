import { NextResponse } from 'next/server'
import { DEMO_PERSONAS } from '@/lib/demoPersonas'

export async function POST(request) {
  try {
    const body = await request.json()
    const { personaId } = body || {}
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId)
    if (!persona) {
      return NextResponse.json({ success: false, error: 'Persona not found' }, { status: 404 })
    }

    const { id, name, age, gender, state, district, socialCategory, entrepreneurType } = persona
    const user = {
      id: `user-${id}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@saksham.demo`,
      phone: '+91 90000 00000',
      age,
      gender,
      state,
      district,
      socialCategory,
      entrepreneurType,
      role: 'CITIZEN',
    }

    const business = {
      businessName: persona.businessName,
      businessType: persona.businessType,
      industry: persona.industry,
      businessStage: persona.businessStage,
      annualTurnover: persona.annualTurnover,
      employeeCount: persona.employeeCount,
      udyamRegistered: persona.udyamRegistered,
      supportRequired: persona.supportRequired,
      targetAmount: persona.targetAmount,
    }

    return NextResponse.json({ success: true, user, business })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to load demo persona' }, { status: 500 })
  }
}
