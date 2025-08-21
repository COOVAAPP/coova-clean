// app/api/listings/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient' // NOTE: shared client; no createClient here

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('Listings')
    .select('*')
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data })
}