'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        if (result.error !== 'Popup closed') {
          setError(result.error || 'Google Login failed');
        }
      }
    } catch (err) {
      setError('An error occurred during Google Sign-In.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.themeToggle}>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`${styles.card} glass-container`}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <Sparkles className={styles.logoIcon} size={28} />
            <span>AuraResume</span>
          </Link>
          <p className={styles.subtitle}>
            Log in to manage your resumes
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div style={{ marginTop: '32px' }}>
          <button
            type="button"
            className={`${styles.googleBtn} glass-btn-secondary`}
            onClick={handleGoogleLogin}
            disabled={submitting}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px' }}
          >
            {submitting ? (
              <span className={styles.loadingSpinner} style={{ borderColor: 'var(--text-secondary)', borderTopColor: 'var(--accent-color)', width: '20px', height: '20px' }}></span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
