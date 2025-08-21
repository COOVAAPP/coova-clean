// app/api/stripe-webhook/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // Optional: read the raw body if you need it later
    // const body = await req.text();

    // Example write (remove if not needed):
    const { error } = await supabase.from('events').insert({
      type: 'stripe',
      received_at: new Date().toISOString(),
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}