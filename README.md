# 📝 Aura Resume Builder

A modern, full-stack resume builder designed to help users create professional, perfectly-formatted resumes with a seamless user experience. Features a live-updating editor, secure authentication, and a powerful backend-driven PDF export engine.

## ✨ Features

- **Live Preview Editor:** Instantly see changes as you type with a responsive, side-by-side editing experience.
- **True PDF Export:** Generates flawless, vector-based PDFs (no blurry images or weird page breaks) using a backend headless Chromium engine.
- **Dynamic Sections:** Easily add, edit, and reorder custom sections tailored to your professional history.
- **Secure Authentication:** Seamless login and registration powered by Firebase Authentication.
- **Cloud Database:** Real-time data persistence using MongoDB to keep your resumes saved and accessible from anywhere.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Firebase Auth
- **PDF Generation:** Puppeteer Core + Sparticuz Chromium
- **Styling:** Vanilla CSS (with modern, responsive design principles)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A MongoDB URI (e.g., MongoDB Atlas)
- A Firebase Project (for Authentication)
- Google Chrome installed locally (for local PDF generation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saurabhssy07-eng/AuraResume.git
   cd AuraResume
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication (Firebase)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # JWT (For custom auth sessions)
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deployment (Render)

This application is optimized for deployment on cloud platforms like [Render](https://render.com). 

**Important note for PDF Generation:** 
The application uses `@sparticuz/chromium` in production to bypass serverless OS-dependency limits. No Dockerfile is required, but ensure your `package.json` relies on `puppeteer-core` rather than the full `puppeteer` package to prevent deployment timeouts and massive bundle sizes. Next.js is configured via `next.config.js` to treat these as external server packages.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📝 License

This project is licensed under the MIT License.
