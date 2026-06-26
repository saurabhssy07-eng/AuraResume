'use client';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit, LogOut, Moon, Sun, FileText, Sparkles, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Resume Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('classic');
  const [creating, setCreating] = useState(false);

  // Upload Resume State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTemplate, setUploadTemplate] = useState('classic');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchResumes();
    }
  }, [user, authLoading]);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          template: newTemplate,
        }),
      });

      if (res.ok) {
        const newResume = await res.json();
        setShowModal(false);
        setNewTitle('');
        router.push(`/editor/${newResume._id}`);
      }
    } catch (err) {
      console.error('Error creating resume:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setResumes(resumes.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
    }
  };

  // ─── Upload Handlers ────────────────────────────────────────

  const openUploadModal = () => {
    setUploadFile(null);
    setUploadError('');
    setUploadProgress('');
    setUploadTemplate('classic');
    setShowUploadModal(true);
  };

  const handleFileSelect = (file) => {
    setUploadError('');
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10 MB.');
      return;
    }
    setUploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadResume = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadError('');
    setUploadProgress('Extracting text from PDF...');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('template', uploadTemplate);
      formData.append('title', uploadFile.name.replace(/\.pdf$/i, '') || 'Uploaded Resume');

      setUploadProgress('Parsing resume sections...');

      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newResume = await res.json();
        setUploadProgress('Done! Redirecting to editor...');
        setShowUploadModal(false);
        router.push(`/editor/${newResume._id}`);
      } else {
        const errorData = await res.json();
        setUploadError(errorData.error || 'Failed to parse the uploaded resume.');
        setUploadProgress('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Something went wrong. Please try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.loadingSpinner} style={{ borderColor: 'var(--text-secondary)', borderTopColor: 'var(--accent-color)', width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <Sparkles size={24} />
          <span>AuraResume</span>
        </Link>
        <div className={styles.userMenu}>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className={styles.userName}>Hi, {user?.name || 'User'}</span>
          <button onClick={logout} className="glass-btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>My Resumes</h1>
          <div className={styles.controls}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search resumes..."
                className="glass-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button className="glass-btn" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Create New
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Create New Resume Card */}
          <div className={`${styles.createCard} glass-card`} onClick={() => setShowModal(true)}>
            <div className={styles.plusIcon}>
              <Plus size={24} />
            </div>
            <span>Create New Resume</span>
          </div>

          {/* Upload Resume Card */}
          <div className={`${styles.createCard} ${styles.uploadCard} glass-card`} onClick={openUploadModal}>
            <div className={styles.plusIcon}>
              <Upload size={24} />
            </div>
            <span>Upload Resume</span>
            <span className={styles.uploadHint}>Import from PDF</span>
          </div>

          {filteredResumes.map((resume) => (
            <div
              key={resume._id}
              className={`${styles.resumeCard} glass-container animate-fade-in`}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/editor/${resume._id}`)}
            >
              <div className={styles.resumeInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileText style={{ color: 'var(--accent-color)' }} size={20} />
                  <span className={styles.templateBadge}>{resume.template}</span>
                </div>
                <h3 className={styles.resumeTitle}>{resume.title}</h3>
                <span className={styles.resumeMeta}>
                  Updated: {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/editor/${resume._id}`);
                  }}
                  title="Edit Resume"
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={(e) => handleDeleteResume(resume._id, e)}
                  title="Delete Resume"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredResumes.length === 0 && resumes.length > 0 && (
          <div className={styles.emptyState}>
            <h3>No results found</h3>
            <p>Try searching for a different term.</p>
          </div>
        )}
      </main>

      {/* Create Resume Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} glass-container`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>New Resume</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateResume} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Resume Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer Resume"
                  className="glass-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Base Template</label>
                <div className={styles.templateSelectGrid}>
                  {[
                    { id: 'classic', name: 'Classic Professional' },
                    { id: 'modern', name: 'Modern Split' },
                    { id: 'tech', name: 'Tech Developer' },
                    { id: 'creative', name: 'Elegant Creative' },
                    { id: 'faang', name: 'FAANG Resume' },
                    { id: 'google', name: 'Google Style' },
                    { id: 'harvard', name: 'Harvard' },
                    { id: 'stanford', name: 'Stanford' },
                    { id: 'mit', name: 'MIT' },
                    { id: 'minimal', name: 'Minimal' },
                    { id: 'elegant', name: 'Elegant' },
                    { id: 'executive', name: 'Executive' },
                    { id: 'ats', name: 'ATS Basic' },
                    { id: 'developer', name: 'Developer Resume' },
                    { id: 'pm', name: 'Product Manager' },
                    { id: 'designer', name: 'Designer' },
                    { id: 'internship', name: 'Internship Resume' },
                    { id: 'academic', name: 'Academic CV' },
                  ].map((temp) => (
                    <div
                      key={temp.id}
                      className={`${styles.templateOption} ${newTemplate === temp.id ? styles.templateOptionActive : ''}`}
                      onClick={() => setNewTemplate(temp.id)}
                    >
                      <span className={styles.templateName}>{temp.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="glass-btn" style={{ marginTop: '12px' }} disabled={creating}>
                {creating ? <span className={styles.loadingSpinner}></span> : 'Create & Design'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resume Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => !uploading && setShowUploadModal(false)}>
          <div className={`${styles.modal} glass-container`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Upload Resume</h2>
              <button className={styles.closeBtn} onClick={() => !uploading && setShowUploadModal(false)} disabled={uploading}>
                <X size={20} />
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${uploadFile ? styles.dropZoneHasFile : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              {uploadFile ? (
                <div className={styles.fileSelected}>
                  <CheckCircle size={28} style={{ color: 'var(--success, #10b981)' }} />
                  <span className={styles.fileName}>{uploadFile.name}</span>
                  <span className={styles.fileSize}>{(uploadFile.size / 1024).toFixed(1)} KB</span>
                  <button
                    type="button"
                    className={styles.changeFileBtn}
                    onClick={(e) => { e.stopPropagation(); setUploadFile(null); setUploadError(''); }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className={styles.dropZoneContent}>
                  <Upload size={32} style={{ color: 'var(--accent-color)', marginBottom: '8px' }} />
                  <span className={styles.dropZoneTitle}>Drop your PDF here</span>
                  <span className={styles.dropZoneSubtitle}>or click to browse • Max 10 MB</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className={styles.uploadErrorMsg}>
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Template Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Template for Editing</label>
              <div className={styles.templateSelectGrid}>
                {[
                  { id: 'classic', name: 'Classic Professional' },
                  { id: 'modern', name: 'Modern Split' },
                  { id: 'tech', name: 'Tech Developer' },
                  { id: 'creative', name: 'Elegant Creative' },
                  { id: 'faang', name: 'FAANG Resume' },
                  { id: 'google', name: 'Google Style' },
                  { id: 'harvard', name: 'Harvard' },
                  { id: 'stanford', name: 'Stanford' },
                  { id: 'mit', name: 'MIT' },
                  { id: 'minimal', name: 'Minimal' },
                  { id: 'elegant', name: 'Elegant' },
                  { id: 'executive', name: 'Executive' },
                  { id: 'ats', name: 'ATS Basic' },
                  { id: 'developer', name: 'Developer Resume' },
                  { id: 'pm', name: 'Product Manager' },
                  { id: 'designer', name: 'Designer' },
                  { id: 'internship', name: 'Internship Resume' },
                  { id: 'academic', name: 'Academic CV' },
                ].map((temp) => (
                  <div
                    key={temp.id}
                    className={`${styles.templateOption} ${uploadTemplate === temp.id ? styles.templateOptionActive : ''}`}
                    onClick={() => setUploadTemplate(temp.id)}
                  >
                    <span className={styles.templateName}>{temp.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Text */}
            {uploadProgress && (
              <div className={styles.uploadProgressMsg}>
                <span className={styles.loadingSpinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                <span>{uploadProgress}</span>
              </div>
            )}

            {/* Upload Button */}
            <button
              type="button"
              className="glass-btn"
              style={{ marginTop: '4px', width: '100%' }}
              disabled={!uploadFile || uploading}
              onClick={handleUploadResume}
            >
              {uploading ? (
                <><span className={styles.loadingSpinner} style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span> Processing...</>
              ) : (
                <><Upload size={18} /> Upload & Parse</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
