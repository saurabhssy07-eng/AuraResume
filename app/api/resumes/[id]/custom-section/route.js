import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../../../../lib/db';

async function getUserIdFromToken(request) {
  try {
    // Try cookies() first (standard approach)
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
    console.error('[custom-section] auth error:', err.message);
    return null;
  }
}

// POST — Create a new custom section
export async function POST(request, { params }) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, fields = [] } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const resume = await db.resumes.findOne({ _id: id, userId });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const newSection = {
      _id: crypto.randomUUID(),
      title: title.trim(),
      fields,
      order: (resume.customSections || []).length,
    };

    const updatedCustomSections = [...(resume.customSections || []), newSection];
    const currentOrder = resume.sectionOrder || [
      'personal', 'experience', 'education', 'projects', 'skills', 'certs', 'ats',
    ];
    const updatedOrder = [...currentOrder, newSection._id];

    await db.resumes.updateOne(
      { _id: id, userId },
      { customSections: updatedCustomSections, sectionOrder: updatedOrder }
    );

    const updated = await db.resumes.findOne({ _id: id, userId });
    return NextResponse.json({ success: true, resume: updated, section: newSection });
  } catch (error) {
    console.error('Create custom section error:', error);
    return NextResponse.json({ error: 'Failed to create custom section' }, { status: 500 });
  }
}
