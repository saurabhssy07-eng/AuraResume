import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '../../../lib/db';

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

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await db.resumes.find({ userId });
    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Fetch resumes error:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, template, themeColor, fontSize, margins, fontFamily } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newResume = await db.resumes.create({
      userId,
      title,
      template: template || 'classic',
      themeColor: themeColor || '#3b82f6',
      fontSize: fontSize || '14px',
      margins: margins || '1in',
      fontFamily: fontFamily || 'Inter',
      sidebarRatio: body.sidebarRatio || '30%',
      sidebarPosition: body.sidebarPosition || 'left',
      skillsColumns: body.skillsColumns || '3',
      experienceColumns: body.experienceColumns || '1',
      projectsColumns: body.projectsColumns || '1',
      educationColumns: body.educationColumns || '1',
      personalInfo: body.personalInfo || {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        summary: '',
      },
      experience: body.experience || [],
      education: body.education || [],
      skills: body.skills || {
        languages: [],
        frontend: [],
        backend: [],
        databases: [],
        tools: [],
        cloud: [],
        coreCs: [],
        softSkills: [],
        customTech: [],
        customSoft: [],
      },
      projects: body.projects || [],
      certifications: body.certifications || [],
      languages: body.languages || [],
      tools: body.tools || [],
      sectionOrder: body.sectionOrder || ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'],
      customSections: body.customSections || [],
    });

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error('Create resume error:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
