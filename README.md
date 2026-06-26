<div align="center">

# 📄 AuraResume

### Modern ATS-Friendly Resume Builder with Cloud PDF Export

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, full-stack resume builder that enables users to create professional, ATS-friendly resumes with real-time editing, secure cloud storage, and production-ready PDF export.

### 🌐 Live Demo

**https://auraresume-p31i.onrender.com**

</div>

---

# ✨ Why AuraResume?

Many online resume builders restrict downloads behind subscriptions or watermark exported resumes.

AuraResume was built to solve this by providing:

- ✅ Professional ATS-friendly resume templates
- ✅ Secure cloud storage
- ✅ Google Sign-In authentication
- ✅ Real-time editing
- ✅ Production-ready PDF generation
- ✅ Responsive design
- ✅ Modern developer-friendly architecture

---

# 📸 Screenshots

## 🔐 Login

![Login](screenshots/login.png)

---

## 📊 Dashboard

![Dashboard](screenshots/dashboard.png)

---

## ✍️ Resume Editor

![Editor](screenshots/editor.png)

---

## 👀 Resume Preview

![Preview](screenshots/preview.png)

---



## 👀  View

![View](screenshots/view.png)

---



## 📄 Downloaded PDF

![PDF](screenshots/pdf.png)

---

# 🚀 Features

### Resume Builder

- Live editing
- Auto-saving
- Dynamic resume sections
- Multiple resume sections
- Responsive interface

### Authentication

- Google Sign-In using Firebase
- Secure JWT Authentication
- Protected Routes

### Database

- MongoDB Atlas
- Persistent cloud storage
- Resume history

### PDF Export

- Production-ready server-side PDF generation
- Puppeteer-Core
- Sparticuz Chromium
- Print-ready formatting

### Deployment

- Render
- Environment variable support
- Cloud-optimized architecture

---

# 🏗 Project Architecture

```
                React Frontend
                      │
                      ▼
                Next.js App Router
                      │
      ┌───────────────┼───────────────┐
      ▼                               ▼
Firebase Authentication          API Routes
      │                               │
      ▼                               ▼
 Google Login                 MongoDB Atlas
                                      │
                                      ▼
                           Resume Data Storage
                                      │
                                      ▼
                         Puppeteer-Core + Chromium
                                      │
                                      ▼
                              Professional PDF
```

---

# 🛠 Tech Stack

| Frontend | Backend | Database | Authentication | PDF Engine | Deployment |
|----------|----------|----------|---------------|------------|------------|
| React 18 | Next.js 14 | MongoDB Atlas | Firebase Authentication | Puppeteer-Core + Sparticuz Chromium | Render |

---

# 📂 Folder Structure

```
AuraResume
│
├── app
│   ├── api
│   ├── editor
│   ├── preview
│   └── auth
│
├── components
│
├── lib
│
├── public
│
├── screenshots
│
├── README.md
│
└── package.json
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/saurabhssy07-eng/AuraResume.git

cd AuraResume
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create

```
.env.local
```

```
MONGODB_URI=

JWT_SECRET=

NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

# 🌍 Deployment

AuraResume is optimized for deployment on **Render**.

Production PDF generation uses

- Puppeteer-Core
- Sparticuz Chromium

to ensure reliable PDF export in cloud environments.

---

# 🎯 Challenges Solved

One of the biggest challenges was enabling reliable PDF export in a cloud deployment.

This project uses:

- Puppeteer-Core
- Sparticuz Chromium

instead of the standard Puppeteer package to support serverless/cloud Linux environments.

Additional production issues solved:

- Firebase Authorized Domains
- MongoDB Atlas Authentication
- JWT Session Management
- Render Environment Variables
- Cloud PDF Rendering

---

# 🚀 Future Roadmap

- AI Resume Suggestions
- ATS Score Analyzer
- Cover Letter Generator
- Multiple Themes
- Resume Sharing
- Resume Analytics
- Resume Import
- DOCX Export
- AI Interview Preparation

---

# 👨💻 Developer

**Saurabh Singh Yadav**

Computer Science Engineer

Full Stack Developer

GitHub

https://github.com/saurabhssy07-eng

LinkedIn

https://linkedin.com/in/saurabh-singh-yadav-b23252361

---

# 📜 License

This project is licensed under the MIT License.

---

## ⭐ If you found this project useful, consider giving it a Star!
