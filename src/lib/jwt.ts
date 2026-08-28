import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'subinyas_super_secret_jwt_key_2026_bd';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function signJwtToken(payload: TokenPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
