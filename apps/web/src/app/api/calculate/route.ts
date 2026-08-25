import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.GROUNDLOOP_API_URL ?? 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const upstream = await fetch(`${API_URL}/v1/calculate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = await upstream.text();

  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}
