import { NextResponse } from 'next/server';

export async function POST() {
  const paymentUrl = process.env.NEXT_PUBLIC_METIS_PAYMENT_URL;

  if (!paymentUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing NEXT_PUBLIC_METIS_PAYMENT_URL. Add your live payment URL to the hosting environment variables.'
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, url: paymentUrl });
}
