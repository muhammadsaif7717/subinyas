import { NextRequest, NextResponse } from 'next/server';
import { signJwtToken } from '@/lib/jwt';
import { getDb } from '@/lib/mongodb';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const client = googleClientId ? new OAuth2Client(googleClientId) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, email, name, avatar } = body;

    let userEmail = email;
    let userName = name || 'Google User';
    let userAvatar = avatar;

    if (client && credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (payload?.email) {
        userEmail = payload.email;
        userName = payload.name || userName;
        userAvatar = payload.picture || userAvatar;
      }
    }

    if (!userEmail) {
      return NextResponse.json({ success: false, message: 'Google authentication failed' }, { status: 400 });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const db = await getDb();
    let userId = `google-${Buffer.from(cleanEmail).toString('hex').slice(0, 8)}`;

    if (db) {
      const existing = await db.collection('users').findOne({ email: cleanEmail });
      if (!existing) {
        const insertRes = await db.collection('users').insertOne({
          email: cleanEmail,
          name: userName,
          avatar: userAvatar,
          role: cleanEmail === (process.env.ADMIN_EMAIL || 'admin@subinyas.shop').toLowerCase() ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        });
        userId = insertRes.insertedId.toString();
      } else {
        userId = existing._id.toString();
      }
    }

    const token = signJwtToken({
      userId,
      email: cleanEmail,
      role: cleanEmail === (process.env.ADMIN_EMAIL || 'admin@subinyas.shop').toLowerCase() ? 'admin' : 'customer',
      name: userName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Google login successful',
      user: {
        id: userId,
        email: cleanEmail,
        name: userName,
        avatar: userAvatar,
        role: cleanEmail === (process.env.ADMIN_EMAIL || 'admin@subinyas.shop').toLowerCase() ? 'admin' : 'customer',
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
    return NextResponse.json({ success: false, message: 'Google login failed.' }, { status: 500 });
  }
}
