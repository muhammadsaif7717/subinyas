import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('subinyas_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  const payload = verifyJwtToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: payload,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'লগআউট সফল হয়েছে' });
  response.cookies.delete('subinyas_admin_token');
  return response;
}
