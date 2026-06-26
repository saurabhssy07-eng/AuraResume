import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '../../../../lib/db';

async function getUserIdFromToken() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'local_development_jwt_secret_token_12345');
    return decoded.userId;
  } catch (err) {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const resume = await db.resumes.findOne({ _id: id, userId });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Migration: ensure sectionOrder exists and contains tools and softSkills for older resumes
    if (!resume.sectionOrder || resume.sectionOrder.length === 0) {
      const defaultOrder = ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'];
      const customIds = (resume.customSections || []).map((s) => s._id);
      resume.sectionOrder = [...defaultOrder, ...customIds];
    } else {
      if (!resume.sectionOrder.includes('tools')) {
        const softIdx = resume.sectionOrder.indexOf('softSkills');
        const atsIdx = resume.sectionOrder.indexOf('ats');
        const targetIdx = softIdx !== -1 ? softIdx : (atsIdx !== -1 ? atsIdx : resume.sectionOrder.length);
        resume.sectionOrder.splice(targetIdx, 0, 'tools');
      }
      if (!resume.sectionOrder.includes('softSkills')) {
        const atsIdx = resume.sectionOrder.indexOf('ats');
        const targetIdx = atsIdx !== -1 ? atsIdx : resume.sectionOrder.length;
        resume.sectionOrder.splice(targetIdx, 0, 'softSkills');
      }
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Fetch resume error:', error);
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const updateData = await request.json();

    // Prevent updating userId or _id
    delete updateData.userId;
    delete updateData._id;

    const result = await db.resumes.updateOne({ _id: id, userId }, updateData);

    if (result.modifiedCount === 0) {
      // Check if it exists
      const exists = await db.resumes.findOne({ _id: id, userId });
      if (!exists) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
    }

    const updatedResume = await db.resumes.findOne({ _id: id, userId });
    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const result = await db.resumes.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
