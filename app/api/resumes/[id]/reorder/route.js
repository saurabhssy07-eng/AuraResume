import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '../../../../../lib/db';

async function getUserIdFromToken(request) {
  try {
    let token = cookies().get('token')?.value;
    
    // Fallback: parse from request cookie header
    if (!token) {
      const cookieHeader = request?.headers?.get('cookie') || '';
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) token = match[1];
    }
    
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'local_development_jwt_secret_token_12345');
    return decoded.userId;
  } catch (err) {
    return null;
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { sectionOrder } = body;

    // Validate incoming data
    if (!Array.isArray(sectionOrder)) {
      return NextResponse.json({ error: 'Invalid sectionOrder: must be an array' }, { status: 400 });
    }

    const resume = await db.resumes.findOne({ _id: id, userId });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    await db.resumes.updateOne({ _id: id, userId }, { sectionOrder });

    const updated = await db.resumes.findOne({ _id: id, userId });
    return NextResponse.json({ success: true, resume: updated });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
  }
}
