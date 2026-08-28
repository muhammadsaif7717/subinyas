import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/jwt';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const client = googleClientId ? new OAuth2Client(googleClientId) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, email, name } = body;

    let userEmail = email;
    let userName = name || 'Google User';

    // Verify token if Google Client ID is configured
    if (client && credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (payload?.email) {
        userEmail = payload.email;
        userName = payload.name || userName;
      }
    }

    if (!userEmail) {
      return NextResponse.json({ success: false, message: 'Google authentication failed' }, { status: 400 });
    }

    const token = signJwtToken({
      userId: `google-${Buffer.from(userEmail).toString('hex').slice(0, 8)}`,
      email: userEmail,
      role: 'admin',
      name: userName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Google login successful',
      user: {
        email: userEmail,
        name: userName,
        role: 'admin',
      },
    });

    response.cookies.set('subinyas_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({ success: false, message: 'Google লগইনে ত্রুটি হয়েছে' }, { status: 500 });
  }
}
