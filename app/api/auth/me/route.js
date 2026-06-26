import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'local_development_jwt_secret_token_12345');
    
    // Find user
    const user = await db.users.findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ authenticated: false, error: 'User not found' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ authenticated: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ authenticated: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}
