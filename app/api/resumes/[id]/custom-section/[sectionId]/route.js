import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '../../../../../../lib/db';

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

// DELETE — Remove a custom section by sectionId
export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, sectionId } = params;

    const resume = await db.resumes.findOne({ _id: id, userId });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Remove section from customSections array
    const updatedCustomSections = (resume.customSections || []).filter(
      (s) => s._id !== sectionId
    );

    // Remove from sectionOrder array (clean up orphan IDs)
    const updatedOrder = (resume.sectionOrder || []).filter(
      (key) => key !== sectionId
    );

    await db.resumes.updateOne(
      { _id: id, userId },
      { customSections: updatedCustomSections, sectionOrder: updatedOrder }
    );

    const updated = await db.resumes.findOne({ _id: id, userId });
    return NextResponse.json({ success: true, resume: updated });
  } catch (error) {
    console.error('Delete custom section error:', error);
    return NextResponse.json({ error: 'Failed to delete custom section' }, { status: 500 });
  }
}
