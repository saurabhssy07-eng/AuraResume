import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, name, firebaseUid } = await request.json();

    if (!email || !firebaseUid) {
      return NextResponse.json(
        { error: 'Email and Firebase UID are required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists in MongoDB
    let user = await db.users.findOne({ email: emailLower });

    if (!user) {
      // Create new user in MongoDB
      // For OAuth, we set a placeholder password so that password validation is bypassed.
      user = await db.users.create({
        name: name || emailLower.split('@')[0],
        email: emailLower,
        password: 'OAUTH_USER_NO_PASSWORD_REQUIRED',
        createdAt: new Date().toISOString()
      });
    }

    // Generate local JWT token for authorization
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'local_development_jwt_secret_token_12345',
      { expiresIn: '7d' }
    );

    // Set token cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Remove password field from user details returned to client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}
