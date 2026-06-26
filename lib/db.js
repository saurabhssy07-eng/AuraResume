import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import mongoose from 'mongoose';

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ResumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  template: { type: String, default: 'classic' },
  themeColor: { type: String, default: '#3b82f6' },
  fontSize: { type: String, default: '14px' },
  margins: { type: String, default: '1in' },
  fontFamily: { type: String, default: 'Inter' },
  lineHeight: { type: String, default: '1.4' },
  sectionSpacing: { type: String, default: '15px' },
  itemSpacing: { type: String, default: '10px' },
  sidebarRatio: { type: String, default: '30%' },
  sidebarPosition: { type: String, default: 'left' },
  skillsColumns: { type: String, default: '3' },
  experienceColumns: { type: String, default: '1' },
  projectsColumns: { type: String, default: '1' },
  educationColumns: { type: String, default: '1' },
  personalInfo: {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  experience: [{
    company: String,
    role: String,
    startDate: String,
    endDate: String,
    description: String,
  }],
  education: [{
    school: String,
    degree: String,
    startDate: String,
    endDate: String,
    description: String,
    gpaType: String,
    gpaValue: String,
  }],
  skills: { type: mongoose.Schema.Types.Mixed, default: {} },
  projects: [{
    name: String,
    description: String,
    technologies: String,
    link: String,
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    link: String,
    credentialId: String,
  }],
  languages: [String],
  tools: [String],
  updatedAt: { type: Date, default: Date.now },
  sectionOrder: { type: [String], default: [] },
  customSections: [
    {
      _id: { type: String, default: () => crypto.randomUUID ? crypto.randomUUID() : undefined },
      title: { type: String, required: true },
      fields: { type: [Object], default: [] },
      order: { type: Number, default: 0 }
    }
  ],
});

let User;
let Resume;

try {
  User = mongoose.models.User || mongoose.model('User', UserSchema);
  Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
} catch (e) {
  // Prevent hot reload errors
}

// File-based database backup path
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'local_db.json');

// Ensure data folder exists
function ensureDir() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify({ users: [], resumes: [] }, null, 2));
  }
}

// Read from JSON DB
function readJsonDb() {
  ensureDir();
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], resumes: [] };
  }
}

// Write to JSON DB
function writeJsonDb(data) {
  ensureDir();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
}

// Helper to generate a random 24-character hex ID (similar to MongoDB ObjectId)
function generateId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function normalizeSkills(skills) {
  const defaultSkills = {
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

  if (!skills) return defaultSkills;

  if (Array.isArray(skills)) {
    return {
      ...defaultSkills,
      languages: skills,
    };
  }

  return {
    languages: Array.isArray(skills.languages) ? skills.languages : [],
    frontend: Array.isArray(skills.frontend) ? skills.frontend : [],
    backend: Array.isArray(skills.backend) ? skills.backend : [],
    databases: Array.isArray(skills.databases) ? skills.databases : [],
    tools: Array.isArray(skills.tools) ? skills.tools : [],
    cloud: Array.isArray(skills.cloud) ? skills.cloud : [],
    coreCs: Array.isArray(skills.coreCs) ? skills.coreCs : [],
    softSkills: Array.isArray(skills.softSkills) ? skills.softSkills : [],
    customTech: Array.isArray(skills.customTech) ? skills.customTech.map(c => ({
      name: c.name || '',
      value: Array.isArray(c.value) ? c.value : []
    })) : [],
    customSoft: Array.isArray(skills.customSoft) ? skills.customSoft.map(c => ({
      name: c.name || '',
      value: Array.isArray(c.value) ? c.value : []
    })) : [],
  };
}

function normalizeResume(resume) {
  if (!resume) return null;
  return {
    ...resume,
    tools: Array.isArray(resume.tools) ? resume.tools : [],
    skills: normalizeSkills(resume.skills),
  };
}

// Unified Database Provider
export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim() !== '') {
    if (mongoose.connection.readyState >= 1) return true;
    await mongoose.connect(uri);
    return true;
  }
  return false;
}

// Unified Model Interface
export const db = {
  users: {
    findOne: async (query) => {
      const isMongo = await connectDb();
      if (isMongo) {
        return await User.findOne(query).lean();
      } else {
        const local = readJsonDb();
        return local.users.find(u => {
          return Object.keys(query).every(key => u[key] === query[key]);
        }) || null;
      }
    },
    create: async (data) => {
      const isMongo = await connectDb();
      if (isMongo) {
        const u = await User.create(data);
        const obj = u.toObject();
        obj._id = obj._id.toString();
        return obj;
      } else {
        const local = readJsonDb();
        const newUser = {
          _id: generateId(),
          ...data,
          createdAt: new Date().toISOString()
        };
        local.users.push(newUser);
        writeJsonDb(local);
        return newUser;
      }
    }
  },
  resumes: {
    find: async (query) => {
      const isMongo = await connectDb();
      if (isMongo) {
        const list = await Resume.find(query).sort({ updatedAt: -1 }).lean();
        return list.map(item => normalizeResume({ ...item, _id: item._id.toString() }));
      } else {
        const local = readJsonDb();
        const list = local.resumes
          .filter(r => Object.keys(query).every(key => r[key] === query[key]))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return list.map(normalizeResume);
      }
    },
    findOne: async (query) => {
      const isMongo = await connectDb();
      if (isMongo) {
        const r = await Resume.findOne(query).lean();
        if (r) r._id = r._id.toString();
        return normalizeResume(r);
      } else {
        const local = readJsonDb();
        const r = local.resumes.find(r => {
          return Object.keys(query).every(key => r[key] === query[key]);
        }) || null;
        return normalizeResume(r);
      }
    },
    create: async (data) => {
      const isMongo = await connectDb();
      if (isMongo) {
        const r = await Resume.create(data);
        const obj = r.toObject();
        obj._id = obj._id.toString();
        return normalizeResume(obj);
      } else {
        const local = readJsonDb();
        const newResume = {
          _id: generateId(),
          ...data,
          updatedAt: new Date().toISOString()
        };
        local.resumes.push(newResume);
        writeJsonDb(local);
        return normalizeResume(newResume);
      }
    },
    updateOne: async (query, updateData) => {
      const isMongo = await connectDb();
      if (isMongo) {
        return await Resume.updateOne(query, { $set: updateData, updatedAt: new Date() });
      } else {
        const local = readJsonDb();
        const index = local.resumes.findIndex(r => {
          return Object.keys(query).every(key => r[key] === query[key]);
        });
        if (index !== -1) {
          local.resumes[index] = {
            ...local.resumes[index],
            ...updateData,
            updatedAt: new Date().toISOString()
          };
          writeJsonDb(local);
          return { modifiedCount: 1 };
        }
        return { modifiedCount: 0 };
      }
    },
    deleteOne: async (query) => {
      const isMongo = await connectDb();
      if (isMongo) {
        return await Resume.deleteOne(query);
      } else {
        const local = readJsonDb();
        const initialLength = local.resumes.length;
        local.resumes = local.resumes.filter(r => {
          return !Object.keys(query).every(key => r[key] === query[key]);
        });
        writeJsonDb(local);
        return { deletedCount: initialLength - local.resumes.length };
      }
    }
  }
};
