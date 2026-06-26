import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from '../../../../lib/db';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

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

// ─── Text Parsing Utilities ─────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}/;
const URL_RE = /https?:\/\/[^\s,)]+/g;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s,)]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,)]+/i;
const DATE_RANGE_RE = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{2,4}|(?:0?[1-9]|1[0-2])\/\d{2,4}|\d{4})\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{2,4}|(?:0?[1-9]|1[0-2])\/\d{2,4}|\d{4}|Present|Current|Now|Till Date)/gi;

// Section heading patterns
const SECTION_PATTERNS = {
  experience: /^(?:work\s+)?experience|employment\s+history|professional\s+experience|work\s+history/i,
  education: /^education(?:al)?\s*(?:background|qualifications|details)?/i,
  skills: /^(?:technical\s+)?skills|core\s+competenc|areas?\s+of\s+expertise|proficiencies/i,
  projects: /^projects?|personal\s+projects|academic\s+projects|key\s+projects/i,
  certifications: /^certifications?|licenses?\s*(?:&|and)?\s*certifications?|credentials/i,
  summary: /^(?:professional\s+)?summary|objective|profile|about\s+me|career\s+(?:summary|objective)/i,
};

function detectSection(line) {
  const cleaned = line.replace(/[:\-—|●•▪▸►★#*]/g, '').trim();
  if (cleaned.length < 3 || cleaned.length > 50) return null;
  for (const [section, re] of Object.entries(SECTION_PATTERNS)) {
    if (re.test(cleaned)) return section;
  }
  return null;
}

function splitSections(text) {
  const lines = text.split('\n');
  const sections = {};
  let currentSection = '_header';
  sections._header = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const detected = detectSection(trimmed);
    if (detected) {
      currentSection = detected;
      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(trimmed);
    }
  }
  return sections;
}

// ─── Field Extractors ───────────────────────────────────────

function extractPersonalInfo(headerLines, summaryLines) {
  const allText = headerLines.join('\n');
  const emailMatch = allText.match(EMAIL_RE);
  const phoneMatch = allText.match(PHONE_RE);
  const linkedinMatch = allText.match(LINKEDIN_RE);
  const githubMatch = allText.match(GITHUB_RE);

  // First line is usually the name
  const fullName = headerLines.length > 0 ? headerLines[0] : '';
  // Second line is often a title/role
  const title = headerLines.length > 1 && !EMAIL_RE.test(headerLines[1]) && !PHONE_RE.test(headerLines[1])
    ? headerLines[1]
    : '';

  // Try to find location (city, state pattern)
  const locationMatch = allText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?)/);
  const locationMatch2 = allText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)?)/);

  // Collect website URLs that aren't LinkedIn/GitHub
  let website = '';
  const urlMatches = allText.match(URL_RE) || [];
  for (const url of urlMatches) {
    if (!LINKEDIN_RE.test(url) && !GITHUB_RE.test(url)) {
      website = url;
      break;
    }
  }

  return {
    fullName: fullName || '',
    title: title || '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    location: locationMatch ? locationMatch[1] : (locationMatch2 ? locationMatch2[1] : ''),
    website: website,
    github: githubMatch ? githubMatch[0] : '',
    linkedin: linkedinMatch ? linkedinMatch[0] : '',
    summary: (summaryLines || []).join(' ').trim(),
  };
}

function extractExperience(lines) {
  if (!lines || lines.length === 0) return [];
  const entries = [];
  let current = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_RE);
    // Detect new entry: line with a date range or a line that looks like a title (short, no bullet)
    const isBullet = /^[•●▪▸►\-*]/.test(line);

    if (dateMatch && !isBullet) {
      // Save previous entry
      if (current) entries.push(current);

      // Parse the date range
      const dateStr = dateMatch[0];
      const parts = dateStr.split(/[-–—]|to/i).map(p => p.trim());
      const startDate = parts[0] || '';
      const endDate = parts[1] || '';

      // Remove date from line to get company/role
      const remaining = line.replace(DATE_RANGE_RE, '').replace(/[|,\-–—]/g, ' ').trim();
      const segments = remaining.split(/\s{2,}/).filter(s => s.trim());

      current = {
        company: segments[0] || '',
        role: segments[1] || segments[0] || '',
        startDate,
        endDate,
        description: '',
      };

      // If segments look like "Company  Role" or "Role at Company"
      if (remaining.toLowerCase().includes(' at ')) {
        const atParts = remaining.split(/\s+at\s+/i);
        current.role = atParts[0].trim();
        current.company = atParts[1]?.trim() || '';
      }
    } else if (current) {
      const cleanLine = line.replace(/^[•●▪▸►\-*]\s*/, '').trim();
      if (cleanLine) {
        current.description += (current.description ? '\n' : '') + '• ' + cleanLine;
      }
    } else {
      // First lines before any date might be a role/company header
      if (!entries.length) {
        current = {
          company: line,
          role: '',
          startDate: '',
          endDate: '',
          description: '',
        };
      }
    }
  }
  if (current) entries.push(current);
  return entries;
}

function extractEducation(lines) {
  if (!lines || lines.length === 0) return [];
  const entries = [];
  let current = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_RE);
    const isBullet = /^[•●▪▸►\-*]/.test(line);

    if (dateMatch && !isBullet) {
      if (current) entries.push(current);
      const dateStr = dateMatch[0];
      const parts = dateStr.split(/[-–—]|to/i).map(p => p.trim());

      const remaining = line.replace(DATE_RANGE_RE, '').replace(/[|,\-–—]/g, ' ').trim();
      const segments = remaining.split(/\s{2,}/).filter(s => s.trim());

      current = {
        school: segments[0] || '',
        degree: segments[1] || '',
        startDate: parts[0] || '',
        endDate: parts[1] || '',
        description: '',
        gpaType: '',
        gpaValue: '',
      };

      // Check for GPA/CGPA in line
      const gpaMatch = remaining.match(/(?:CGPA|GPA|SGPA)[:\s]*([0-9.]+(?:\/[0-9.]+)?)/i);
      const percentMatch = remaining.match(/([0-9.]+)\s*%/);
      if (gpaMatch) {
        current.gpaType = gpaMatch[0].toUpperCase().includes('CGPA') ? 'CGPA' : gpaMatch[0].toUpperCase().includes('SGPA') ? 'SGPA' : 'GPA';
        current.gpaValue = gpaMatch[1];
      } else if (percentMatch) {
        current.gpaType = 'Percentage';
        current.gpaValue = percentMatch[1] + '%';
      }
    } else if (current) {
      const cleanLine = line.replace(/^[•●▪▸►\-*]\s*/, '').trim();
      // Check for GPA in description lines
      const gpaMatch = cleanLine.match(/(?:CGPA|GPA|SGPA)[:\s]*([0-9.]+(?:\/[0-9.]+)?)/i);
      const percentMatch = cleanLine.match(/([0-9.]+)\s*%/);
      if (gpaMatch && !current.gpaValue) {
        current.gpaType = gpaMatch[0].toUpperCase().includes('CGPA') ? 'CGPA' : 'GPA';
        current.gpaValue = gpaMatch[1];
      } else if (percentMatch && !current.gpaValue) {
        current.gpaType = 'Percentage';
        current.gpaValue = percentMatch[1] + '%';
      }
      if (cleanLine) {
        current.description += (current.description ? '\n' : '') + cleanLine;
      }
    } else {
      current = {
        school: line,
        degree: '',
        startDate: '',
        endDate: '',
        description: '',
        gpaType: '',
        gpaValue: '',
      };
    }
  }
  if (current) entries.push(current);
  return entries;
}

function categorizeSkills(lines) {
  const allSkillsText = lines.join(', ');
  const tokens = allSkillsText
    .split(/[,;|•●▪▸►\n]/)
    .map(s => s.replace(/^[:\-\s]+/, '').trim())
    .filter(s => s && s.length < 40);

  // Known skill keyword maps
  const languageKeywords = ['c++', 'c#', 'c', 'python', 'java', 'javascript', 'typescript', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'r', 'scala', 'perl', 'dart', 'lua', 'haskell', 'matlab', 'assembly', 'vb.net', 'objective-c'];
  const frontendKeywords = ['react', 'react.js', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'vuejs', 'next.js', 'nextjs', 'nuxt', 'svelte', 'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material ui', 'mui', 'chakra', 'jquery', 'redux', 'webpack', 'vite'];
  const backendKeywords = ['node.js', 'nodejs', 'express', 'express.js', 'expressjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'ruby on rails', 'asp.net', '.net', 'laravel', 'nestjs', 'nest.js', 'graphql', 'rest api', 'restful', 'microservices', 'kafka', 'rabbitmq'];
  const dbKeywords = ['mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'dynamodb', 'firebase', 'firestore', 'cassandra', 'oracle', 'sql server', 'mariadb', 'neo4j', 'elasticsearch', 'supabase'];
  const toolKeywords = ['git', 'github', 'gitlab', 'bitbucket', 'vs code', 'vscode', 'visual studio', 'intellij', 'eclipse', 'postman', 'figma', 'jira', 'confluence', 'slack', 'trello', 'notion', 'linux', 'bash', 'terminal', 'npm', 'yarn', 'docker compose'];
  const cloudKeywords = ['aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'render', 'digitalocean', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'jenkins', 'github actions', 'terraform', 'cloudflare'];
  const coreCsKeywords = ['dsa', 'data structures', 'algorithms', 'oops', 'oop', 'object oriented', 'dbms', 'operating systems', 'os', 'computer networks', 'networking', 'system design', 'software engineering', 'design patterns', 'agile', 'scrum'];
  const softKeywords = ['leadership', 'communication', 'teamwork', 'team collaboration', 'problem solving', 'problem-solving', 'critical thinking', 'time management', 'adaptability', 'creativity', 'interpersonal', 'mentoring', 'presentation', 'negotiation', 'conflict resolution', 'analytical', 'detail oriented', 'detail-oriented', 'self motivated', 'self-motivated', 'multitasking', 'project management'];

  const result = {
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
  };

  const placed = new Set();

  // Check if lines have subcategory labels like "Languages: C, C++, Python"
  for (const line of lines) {
    const colonMatch = line.match(/^([^:]+):\s*(.+)/);
    if (colonMatch) {
      const label = colonMatch[1].trim().toLowerCase();
      const values = colonMatch[2].split(/[,;|]/).map(s => s.trim()).filter(s => s);
      
      if (/programming|language/i.test(label)) {
        result.languages.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/front\s*end/i.test(label)) {
        result.frontend.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/back\s*end/i.test(label)) {
        result.backend.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/database/i.test(label)) {
        result.databases.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/tool|developer tool/i.test(label)) {
        result.tools.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/cloud|deploy|devops/i.test(label)) {
        result.cloud.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/core|fundamental|cs /i.test(label)) {
        result.coreCs.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      } else if (/soft/i.test(label)) {
        result.softSkills.push(...values);
        values.forEach(v => placed.add(v.toLowerCase()));
      }
    }
  }

  // Categorize remaining tokens by keyword matching
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (placed.has(lower)) continue;

    if (languageKeywords.some(k => lower === k || lower.startsWith(k + ' '))) {
      result.languages.push(token); placed.add(lower);
    } else if (frontendKeywords.some(k => lower === k || lower.includes(k))) {
      result.frontend.push(token); placed.add(lower);
    } else if (backendKeywords.some(k => lower === k || lower.includes(k))) {
      result.backend.push(token); placed.add(lower);
    } else if (dbKeywords.some(k => lower === k || lower.includes(k))) {
      result.databases.push(token); placed.add(lower);
    } else if (cloudKeywords.some(k => lower === k || lower.includes(k))) {
      result.cloud.push(token); placed.add(lower);
    } else if (toolKeywords.some(k => lower === k || lower.includes(k))) {
      result.tools.push(token); placed.add(lower);
    } else if (coreCsKeywords.some(k => lower === k || lower.includes(k))) {
      result.coreCs.push(token); placed.add(lower);
    } else if (softKeywords.some(k => lower === k || lower.includes(k))) {
      result.softSkills.push(token); placed.add(lower);
    }
  }

  // Anything unmatched goes to languages as a catch-all
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (!placed.has(lower) && token.length > 1) {
      result.languages.push(token);
    }
  }

  return result;
}

function extractProjects(lines) {
  if (!lines || lines.length === 0) return [];
  const entries = [];
  let current = null;

  for (const line of lines) {
    const isBullet = /^[•●▪▸►\-*]/.test(line);
    const urlMatch = line.match(URL_RE);

    // Non-bullet, short-ish line = project name
    if (!isBullet && line.length < 80 && !urlMatch) {
      if (current) entries.push(current);
      // Check for "Project Name | Tech1, Tech2" pattern
      const pipeMatch = line.match(/^(.+?)\s*[|–—]\s*(.+)$/);
      current = {
        name: pipeMatch ? pipeMatch[1].trim() : line.trim(),
        description: '',
        technologies: pipeMatch ? pipeMatch[2].trim() : '',
        link: '',
      };
    } else if (current) {
      if (urlMatch) {
        current.link = urlMatch[0];
      }
      const cleanLine = line.replace(/^[•●▪▸►\-*]\s*/, '').trim();
      // Check for tech stack in parentheses
      const techMatch = cleanLine.match(/(?:Technologies?|Tech Stack|Built with)[:\s]*(.+)/i);
      if (techMatch && !current.technologies) {
        current.technologies = techMatch[1].trim();
      } else if (cleanLine) {
        current.description += (current.description ? '\n' : '') + '• ' + cleanLine;
      }
    }
  }
  if (current) entries.push(current);
  return entries;
}

function extractCertifications(lines) {
  if (!lines || lines.length === 0) return [];
  const entries = [];

  for (const line of lines) {
    const cleanLine = line.replace(/^[•●▪▸►\-*]\s*/, '').trim();
    if (!cleanLine) continue;

    // Try to find "Cert Name — Issuer — Date" pattern
    const parts = cleanLine.split(/\s*[|–—,]\s*/);
    const urlMatch = cleanLine.match(URL_RE);

    entries.push({
      name: parts[0] || cleanLine,
      issuer: parts[1] || '',
      date: parts[2] || '',
      link: urlMatch ? urlMatch[0] : '',
      credentialId: '',
    });
  }
  return entries;
}

// ─── Main API Handler ───────────────────────────────────────

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const template = formData.get('template') || 'classic';
    const title = formData.get('title') || 'Uploaded Resume';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf' && !file.name?.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
    }

    // Read the PDF buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
    let pdfText = '';
    try {
      const parsedData = await pdfParse(buffer);
      pdfText = parsedData.text || '';
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      return NextResponse.json({ error: 'Failed to parse PDF. The file may be corrupted or image-only.' }, { status: 422 });
    }

    if (!pdfText.trim()) {
      return NextResponse.json({ error: 'No text could be extracted. The PDF may be image-based (scanned). Please upload a text-based PDF.' }, { status: 422 });
    }

    // Split into sections
    const sections = splitSections(pdfText);

    // Extract structured data
    const personalInfo = extractPersonalInfo(sections._header || [], sections.summary || []);
    const experience = extractExperience(sections.experience || []);
    const education = extractEducation(sections.education || []);
    const skills = categorizeSkills(sections.skills || []);
    const projects = extractProjects(sections.projects || []);
    const certifications = extractCertifications(sections.certifications || []);

    // Create the resume
    const newResume = await db.resumes.create({
      userId,
      title,
      template,
      themeColor: '#3b82f6',
      fontSize: '14px',
      margins: '1in',
      fontFamily: 'Inter',
      sidebarRatio: '30%',
      sidebarPosition: 'left',
      skillsColumns: '3',
      experienceColumns: '1',
      projectsColumns: '1',
      educationColumns: '1',
      personalInfo,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages: [],
      tools: [],
      sectionOrder: ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'],
      customSections: [],
    });

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error('Upload resume error:', error);
    return NextResponse.json({ error: 'Failed to process uploaded resume' }, { status: 500 });
  }
}
