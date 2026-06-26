'use client';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';
import styles from './page.module.css';
import { Sparkles, Download, Layers, ShieldCheck, Moon, Sun, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Sparkles size={28} />
          <span>AuraResume</span>
        </div>
        <div className={styles.navLinks}>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <Link href="/dashboard" className="glass-btn">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <Link href="/login" className="glass-btn">
              Get Started
            </Link>
          )}
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={`${styles.badge} animate-fade-in`}>100% Free • Recruiter Approved</div>
        <h1 className={`${styles.title} animate-fade-in`}>
          Build Your ATS-Optimized Resume in Minutes.
        </h1>
        <p className={`${styles.subtitle} animate-fade-in`}>
          Stand out from the crowd with AuraResume. AuraResume generates clean, professional, and ATS-friendly resumes. Tailored for multiple job profiles. Zero download fees.
        </p>

        <div className={styles.ctaGroup}>
          <Link href={user ? "/dashboard" : "/login"} className="glass-btn">
            Create My Resume Now <ArrowRight size={18} />
          </Link>
          <a href="#features" className="glass-btn-secondary">
            Explore Features
          </a>
        </div>

        <div className={`${styles.previewContainer} animate-float`}>
          <div className={styles.previewBar}>
            <span className={styles.dot} style={{ backgroundColor: '#ef4444' }}></span>
            <span className={styles.dot} style={{ backgroundColor: '#f59e0b' }}></span>
            <span className={styles.dot} style={{ backgroundColor: '#10b981' }}></span>
          </div>
          <div style={{ padding: '40px', textAlign: 'left', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>John Doe</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Senior Full Stack Developer • john.doe@email.com • +1 234 567 890</p>
            <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Work Experience</h3>
              <p style={{ fontWeight: 600 }}>Lead Software Engineer at TechGiant Inc. <span style={{ float: 'right', fontWeight: 400, fontSize: '0.9rem' }}>2023 - Present</span></p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Spearheaded the development of high-throughput microservices using Node.js and Next.js. Reduced application loading time by 40% and improved team velocity.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Skills</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['React', 'Next.js', 'Node.js', 'MongoDB', 'System Design', 'TypeScript', 'AWS'].map(skill => (
                  <span key={skill} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className={styles.features}>
        <h2 className={styles.featuresTitle}>Why Choose AuraResume?</h2>
        <div className={styles.grid}>
          <div className={`${styles.card} glass-card`}>
            <div className={styles.iconWrapper}>
              <Layers size={24} />
            </div>
            <h3 className={styles.cardTitle}>Professional Templates</h3>
            <p className={styles.cardDesc}>
              Switch between beautifully designed ATS-friendly templates instantly with a single click.
            </p>
          </div>

          <div className={`${styles.card} glass-card`}>
            <div className={styles.iconWrapper}>
              <Sparkles size={24} />
            </div>
            <h3 className={styles.cardTitle}>Real-time ATS Score</h3>
            <p className={styles.cardDesc}>
              Our built-in analysis tool scans your resume in real time, calculating an ATS score and highlighting improvement opportunities.
            </p>
          </div>

          <div className={`${styles.card} glass-card`}>
            <div className={styles.iconWrapper}>
              <Download size={24} />
            </div>
            <h3 className={styles.cardTitle}>Unlimited Free Downloads</h3>
            <p className={styles.cardDesc}>
              No hidden fees, no subscriptions, and no watermarks. Export your completed resume to PDF format instantly.
            </p>
          </div>

          <div className={`${styles.card} glass-card`}>
            <div className={styles.iconWrapper}>
              <ShieldCheck size={24} />
            </div>
            <h3 className={styles.cardTitle}>Secure & Self-Contained</h3>
            <p className={styles.cardDesc}>
              Your data is saved securely in your private account. Access, duplicate, edit, or delete your resumes at any time.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} AuraResume. All rights reserved. Created with premium Glassmorphism design system.</p>
      </footer>
    </div>
  );
}
