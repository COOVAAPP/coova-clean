export const runtime = 'nodejs'; // Stripe requires Node runtime (not Edge)
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe.js'; // <-- relative path

export async function POST(req) {
  const { amount, currency = 'usd', metadata = {} } = await req.json();

  // amount must be in cents, validate on server
  if (!amount || Number.isNaN(Number(amount))) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: metadata.title ?? 'Booking' },
          unit_amount: Number(amount),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    metadata,
  });

  return NextResponse.json({ id: session.id, url: session.url });
}