'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, Download, CheckCircle, AlertTriangle, Save, Moon, Sun, Eye, Settings, ArrowUp, ArrowDown, X, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react';
import styles from '../editor.module.css';

// Import Templates
import ClassicTemplate from '../../../components/templates/ClassicTemplate';
import ModernTemplate from '../../../components/templates/ModernTemplate';
import TechTemplate from '../../../components/templates/TechTemplate';
import CreativeTemplate from '../../../components/templates/CreativeTemplate';
import FAANGTemplate from '../../../components/templates/FAANGTemplate';
import GoogleTemplate from '../../../components/templates/GoogleTemplate';
import HarvardTemplate from '../../../components/templates/HarvardTemplate';
import StanfordTemplate from '../../../components/templates/StanfordTemplate';
import MITTemplate from '../../../components/templates/MITTemplate';
import MinimalTemplate from '../../../components/templates/MinimalTemplate';
import ElegantTemplate from '../../../components/templates/ElegantTemplate';
import ExecutiveTemplate from '../../../components/templates/ExecutiveTemplate';
import ATSBasicTemplate from '../../../components/templates/ATSBasicTemplate';
import DeveloperTemplate from '../../../components/templates/DeveloperTemplate';
import ProductManagerTemplate from '../../../components/templates/ProductManagerTemplate';
import DesignerTemplate from '../../../components/templates/DesignerTemplate';
import InternshipTemplate from '../../../components/templates/InternshipTemplate';
import AcademicCVTemplate from '../../../components/templates/AcademicCVTemplate';

// Default built-in section order
const DEFAULT_SECTION_ORDER = ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'];

// Human-readable labels for built-in sections
const SECTION_LABELS = {
  personal: 'Personal Information',
  experience: 'Work Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Technical Skills',
  certs: 'Certifications',
  tools: 'Tools & Technologies',
  softSkills: 'Soft Skills',
  ats: 'ATS Score Checker',
};

export default function ResumeEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Resume Data State
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Accordion Sections Toggle
  const [openSections, setOpenSections] = useState({
    personal: true,
    experience: false,
    education: false,
    projects: false,
    skills: false,
    certs: false,
    tools: false,
    softSkills: false,
    formatting: false,
    ats: false,
  });

  // Section order state
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);
  // Guard against rapid reorder clicks
  const [isReordering, setIsReordering] = useState(false);

  // Custom Modals State
  const [isCustomSectionModalOpen, setIsCustomSectionModalOpen] = useState(false);
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // History State for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isUndoRedoAction = useRef(false);
  const contentRef = useRef(null);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── Reorder helpers ───────────────────────────────────────
  const persistOrder = useCallback(async (newOrder) => {
    setIsReordering(true);
    try {
      const res = await fetch(`/api/resumes/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionOrder: newOrder }),
      });
      if (!res.ok) throw new Error(`Reorder failed (${res.status})`);
      const data = await res.json();
      if (data.resume) {
        setResumeData((prev) => ({ ...prev, ...data.resume }));
      }
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setIsReordering(false);
    }
  }, [id]);

  const moveSection = useCallback((key, direction) => {
    setSectionOrder((prev) => {
      const idx = prev.indexOf(key);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const newOrder = [...prev];
      [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
      // Fire persist in background
      persistOrder(newOrder);
      return newOrder;
    });
  }, [persistOrder]);

  // ─── Custom Section helpers ────────────────────────────────
  const handleAddCustomSection = async (title) => {
    if (!title || !title.trim()) return;
    try {
      const res = await fetch(`/api/resumes/${id}/custom-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      if (data.resume) {
        setResumeData(data.resume);
        setSectionOrder(data.resume.sectionOrder || [...sectionOrder, data.section?._id]);
        // Auto-expand the new section
        if (data.section?._id) {
          setOpenSections((prev) => ({ ...prev, [data.section._id]: true }));
        }
      }
    } catch (err) {
      console.error('Add custom section error:', err);
      alert('Failed to add custom section: ' + err.message);
    }
  };

  const handleDeleteCustomSection = async (sectionId) => {
    try {
      const res = await fetch(`/api/resumes/${id}/custom-section/${sectionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete custom section');
      const data = await res.json();
      if (data.resume) {
        setResumeData(data.resume);
        setSectionOrder(data.resume.sectionOrder || sectionOrder.filter((k) => k !== sectionId));
      }
    } catch (err) {
      console.error('Delete custom section error:', err);
      alert('Failed to delete custom section.');
    }
  };

  const handleRemovePredefinedSection = async (sectionKey) => {
    const newOrder = sectionOrder.filter((k) => k !== sectionKey);
    setSectionOrder(newOrder);
    await persistOrder(newOrder);
  };

  // ─── Fetch Resume Data ─────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user) {
      fetchResume();
    }
  }, [user, authLoading, id]);

  const fetchResume = async () => {
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
        // Migration: populate sectionOrder for older resumes
        let order = [];
        if (data.sectionOrder && data.sectionOrder.length > 0) {
          order = [...data.sectionOrder];
        } else {
          // Build default + any existing custom section ids
          const customIds = (data.customSections || []).map((s) => s._id);
          order = [...DEFAULT_SECTION_ORDER, ...customIds];
        }
        // Ensure tools exists in order
        if (!order.includes('tools')) {
          const softIdx = order.indexOf('softSkills');
          const atsIdx = order.indexOf('ats');
          const targetIdx = softIdx !== -1 ? softIdx : (atsIdx !== -1 ? atsIdx : order.length);
          order.splice(targetIdx, 0, 'tools');
        }
        // Ensure softSkills exists in order
        if (!order.includes('softSkills')) {
          const atsIdx = order.indexOf('ats');
          if (atsIdx !== -1) {
            order.splice(atsIdx, 0, 'softSkills');
          } else {
            order.push('softSkills');
          }
        }
        setSectionOrder(order);

        // Initialize history
        setHistory([{ resumeData: data, sectionOrder: order }]);
        setHistoryPointer(0);
      } else {
        setError('Resume not found or unauthorized access.');
      }
    } catch (err) {
      setError('Failed to fetch resume.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Debounced History Recording (Undo/Redo) ────────────────
  useEffect(() => {
    if (!resumeData || loading) return;

    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const currentState = { resumeData, sectionOrder };

      if (history.length === 0) {
        setHistory([currentState]);
        setHistoryPointer(0);
        return;
      }

      const lastState = history[historyPointer];

      // Deep compare string representation to avoid duplicate history states
      if (!lastState || JSON.stringify(lastState) !== JSON.stringify(currentState)) {
        const cleanHistory = history.slice(0, historyPointer + 1);
        const newHistory = [...cleanHistory, currentState];
        setHistory(newHistory);
        setHistoryPointer(newHistory.length - 1);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [resumeData, sectionOrder, loading]);

  const undo = () => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      const targetState = history[newPointer];
      isUndoRedoAction.current = true;
      setHistoryPointer(newPointer);
      setResumeData(targetState.resumeData);
      setSectionOrder(targetState.sectionOrder);
    }
  };

  const redo = () => {
    if (historyPointer < history.length - 1) {
      const newPointer = historyPointer + 1;
      const targetState = history[newPointer];
      isUndoRedoAction.current = true;
      setHistoryPointer(newPointer);
      setResumeData(targetState.resumeData);
      setSectionOrder(targetState.sectionOrder);
    }
  };

  // ─── Debounced Auto-Save ───────────────────────────────────
  useEffect(() => {
    if (!resumeData || loading) return;

    setSaveStatus('Saving...');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resumeData),
        });
        if (res.ok) {
          setSaveStatus('Saved');
        } else {
          setSaveStatus('Error');
        }
      } catch (err) {
        setSaveStatus('Error');
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [resumeData]);

  // ─── Form Change Handlers ─────────────────────────────────
  const handlePersonalInfoChange = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleResumeConfigChange = (field, value) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  // Repeater Field Handlers (Experience, Education, Projects, Certs)
  const addRepeaterItem = (section, emptyObj) => {
    setResumeData((prev) => ({ ...prev, [section]: [...prev[section], emptyObj] }));
  };

  const updateRepeaterItem = (section, index, field, value) => {
    setResumeData((prev) => {
      const newList = [...prev[section]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [section]: newList };
    });
  };

  const removeRepeaterItem = (section, index) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, idx) => idx !== index),
    }));
  };

  // Skills & Languages (comma separated)
  const handleListChange = (field, value) => {
    const list = value.split(',').map((item) => item.trim()).filter((item) => item !== '');
    setResumeData((prev) => ({ ...prev, [field]: list }));
  };

  // ─── ATS Score ─────────────────────────────────────────────
  const calculateATS = () => {
    if (!resumeData) return { score: 0, checks: [] };

    let score = 0;
    const checks = [];

    if (resumeData.personalInfo?.fullName) {
      score += 10; checks.push({ label: 'Full Name listed', pass: true });
    } else {
      checks.push({ label: 'Full Name missing', pass: false });
    }

    if (resumeData.personalInfo?.email) {
      score += 10; checks.push({ label: 'Email Address listed', pass: true });
    } else {
      checks.push({ label: 'Email Address missing', pass: false });
    }

    if (resumeData.personalInfo?.phone) {
      score += 10; checks.push({ label: 'Phone Number listed', pass: true });
    } else {
      checks.push({ label: 'Phone Number missing', pass: false });
    }

    if (resumeData.personalInfo?.location) {
      score += 5; checks.push({ label: 'Location/City listed', pass: true });
    } else {
      checks.push({ label: 'Location missing (Optional but recommended)', pass: false, optional: true });
    }

    const summaryLen = resumeData.personalInfo?.summary?.length || 0;
    if (summaryLen > 50) {
      score += 15; checks.push({ label: 'Professional Summary added (Optimal length)', pass: true });
    } else {
      checks.push({ label: 'Professional Summary too short or missing', pass: false });
    }

    const expCount = resumeData.experience?.length || 0;
    if (expCount >= 2) {
      score += 20; checks.push({ label: 'Multiple work history items listed', pass: true });
    } else if (expCount === 1) {
      score += 10; checks.push({ label: 'One work history item listed', pass: true });
    } else {
      checks.push({ label: 'Work Experience missing (High priority)', pass: false });
    }

    const skillsObj = resumeData.skills || {};
    const customTechCount = (skillsObj.customTech || []).reduce((acc, c) => acc + (c.value?.length || 0), 0);
    const customSoftCount = (skillsObj.customSoft || []).reduce((acc, c) => acc + (c.value?.length || 0), 0);
    const standaloneToolsCount = resumeData.tools?.length || 0;
    const skillsCount = (skillsObj.languages?.length || 0) +
                        (skillsObj.frontend?.length || 0) +
                        (skillsObj.backend?.length || 0) +
                        (skillsObj.databases?.length || 0) +
                        (skillsObj.tools?.length || 0) +
                        (skillsObj.cloud?.length || 0) +
                        (skillsObj.coreCs?.length || 0) +
                        (skillsObj.softSkills?.length || 0) +
                        customTechCount +
                        customSoftCount +
                        standaloneToolsCount;
    if (skillsCount >= 5) {
      score += 20; checks.push({ label: '5+ keywords/skills listed', pass: true });
    } else if (skillsCount > 0) {
      score += 10; checks.push({ label: 'Skills listed', pass: true });
    } else {
      checks.push({ label: 'Skills list missing (Crucial for keywords matches)', pass: false });
    }

    const projCount = resumeData.projects?.length || 0;
    if (projCount >= 1) {
      score += 10; checks.push({ label: 'Projects details listed', pass: true });
    } else {
      checks.push({ label: 'No key projects listed', pass: false, optional: true });
    }

    return { score, checks };
  };

  // ─── PDF Export (Backend Puppeteer Engine) ──
  const downloadPDF = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData?.personalInfo?.fullName?.replace(/\\s+/g, '_') || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export Error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Template switch ───────────────────────────────────────
  const renderTemplate = () => {
    const dataWithOrder = { ...resumeData, sectionOrder };
    switch (resumeData.template) {
      case 'faang':    return <FAANGTemplate data={dataWithOrder} />;
      case 'google':   return <GoogleTemplate data={dataWithOrder} />;
      case 'harvard':  return <HarvardTemplate data={dataWithOrder} />;
      case 'stanford': return <StanfordTemplate data={dataWithOrder} />;
      case 'mit':      return <MITTemplate data={dataWithOrder} />;
      case 'minimal':  return <MinimalTemplate data={dataWithOrder} />;
      case 'elegant':  return <ElegantTemplate data={dataWithOrder} />;
      case 'executive': return <ExecutiveTemplate data={dataWithOrder} />;
      case 'ats':      return <ATSBasicTemplate data={dataWithOrder} />;
      case 'developer': return <DeveloperTemplate data={dataWithOrder} />;
      case 'pm':       return <ProductManagerTemplate data={dataWithOrder} />;
      case 'designer': return <DesignerTemplate data={dataWithOrder} />;
      case 'internship': return <InternshipTemplate data={dataWithOrder} />;
      case 'academic': return <AcademicCVTemplate data={dataWithOrder} />;
      case 'modern':  return <ModernTemplate data={dataWithOrder} />;
      case 'tech':    return <TechTemplate data={dataWithOrder} />;
      case 'creative': return <CreativeTemplate data={dataWithOrder} />;
      case 'classic':
      default:        return <ClassicTemplate data={dataWithOrder} />;
    }
  };

  // ─── Loading / Error states ────────────────────────────────
  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.loadingSpinner} style={{ borderColor: 'var(--text-secondary)', borderTopColor: 'var(--accent-color)', width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <h3>Error occurred</h3>
        <p>{error || 'Access denied.'}</p>
        <Link href="/dashboard" className="glass-btn">Go back to Dashboard</Link>
      </div>
    );
  }

  const { score, checks } = calculateATS();

  // ─── Section Accordion Header (shared renderer) ────────────
  const renderAccordionHeader = (sectionKey, label, isReorderable = true) => {
    const idx = sectionOrder.indexOf(sectionKey);
    const isFirst = idx === 0;
    const isLast = idx === sectionOrder.length - 1;

    return (
      <div className={styles.accordionHeader} onClick={() => toggleSection(sectionKey)}>
        <span>{label}</span>
        <div className={styles.sectionActions}>
          {isReorderable && (
            <>
              <button
                className={styles.sectionArrow}
                disabled={isFirst || isReordering}
                onClick={(e) => { e.stopPropagation(); moveSection(sectionKey, 'up'); }}
                title="Move up"
              >
                <ArrowUp size={16} />
              </button>
              <button
                className={styles.sectionArrow}
                disabled={isLast || isReordering}
                onClick={(e) => { e.stopPropagation(); moveSection(sectionKey, 'down'); }}
                title="Move down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                className={styles.sectionArrow}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTargetId(sectionKey);
                  setIsDeleteModalOpen(true);
                }}
                title="Remove Section"
                style={{ color: 'var(--danger, #ef4444)' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {openSections[sectionKey] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
    );
  };

  // ─── Section Content Renderers ─────────────────────────────
  const renderPersonalSection = () => (
    <div className={styles.accordionContent}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Full Name</label>
            {resumeData.personalInfo?.fullName && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('fullName', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Full Name"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.fullName || ''} onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Job Title</label>
            {resumeData.personalInfo?.title && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('title', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Job Title"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.title || ''} onChange={(e) => handlePersonalInfoChange('title', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Email</label>
            {resumeData.personalInfo?.email && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('email', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Email"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="email" className="glass-input" value={resumeData.personalInfo?.email || ''} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Phone</label>
            {resumeData.personalInfo?.phone && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('phone', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Phone"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.phone || ''} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Location</label>
            {resumeData.personalInfo?.location && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('location', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Location"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.location || ''} onChange={(e) => handlePersonalInfoChange('location', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Website</label>
            {resumeData.personalInfo?.website && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('website', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Website"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.website || ''} onChange={(e) => handlePersonalInfoChange('website', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>GitHub</label>
            {resumeData.personalInfo?.github && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('github', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear GitHub"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.github || ''} onChange={(e) => handlePersonalInfoChange('github', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>LinkedIn</label>
            {resumeData.personalInfo?.linkedin && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('linkedin', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear LinkedIn"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <input type="text" className="glass-input" value={resumeData.personalInfo?.linkedin || ''} onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)} />
        </div>
        <div className={`${styles.formGroup} ${styles.spanFull}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Professional Summary</label>
            {resumeData.personalInfo?.summary && (
              <button
                type="button"
                onClick={() => handlePersonalInfoChange('summary', '')}
                style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                title="Clear Professional Summary"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          <textarea className="glass-input" rows={4} value={resumeData.personalInfo?.summary || ''} onChange={(e) => handlePersonalInfoChange('summary', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className={styles.accordionContent}>
      {(resumeData.experience || []).map((exp, i) => (
        <div key={i} className={styles.repeaterItem}>
          <button className={styles.removeBtn} onClick={() => removeRepeaterItem('experience', i)}><Trash2 size={16} /></button>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Company</label>
              <input type="text" className="glass-input" value={exp.company || ''} onChange={(e) => updateRepeaterItem('experience', i, 'company', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Role</label>
              <input type="text" className="glass-input" value={exp.role || ''} onChange={(e) => updateRepeaterItem('experience', i, 'role', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="text" className="glass-input" value={exp.startDate || ''} onChange={(e) => updateRepeaterItem('experience', i, 'startDate', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input type="text" className="glass-input" value={exp.endDate || ''} onChange={(e) => updateRepeaterItem('experience', i, 'endDate', e.target.value)} />
            </div>
            <div className={`${styles.formGroup} ${styles.spanFull}`}>
              <label>Description</label>
              <textarea className="glass-input" rows={3} value={exp.description || ''} onChange={(e) => updateRepeaterItem('experience', i, 'description', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="glass-btn-secondary" onClick={() => addRepeaterItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '' })}>
        <Plus size={16} /> Add Experience
      </button>
    </div>
  );

  const renderEducationSection = () => (
    <div className={styles.accordionContent}>
      {(resumeData.education || []).map((edu, i) => (
        <div key={i} className={styles.repeaterItem}>
          <button className={styles.removeBtn} onClick={() => removeRepeaterItem('education', i)}><Trash2 size={16} /></button>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>School</label>
              <input type="text" className="glass-input" value={edu.school || ''} onChange={(e) => updateRepeaterItem('education', i, 'school', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Degree</label>
              <input type="text" className="glass-input" value={edu.degree || ''} onChange={(e) => updateRepeaterItem('education', i, 'degree', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="text" className="glass-input" value={edu.startDate || ''} onChange={(e) => updateRepeaterItem('education', i, 'startDate', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input type="text" className="glass-input" value={edu.endDate || ''} onChange={(e) => updateRepeaterItem('education', i, 'endDate', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Grade / Score Type</label>
              <select
                className="glass-input"
                value={edu.gpaType || ''}
                onChange={(e) => updateRepeaterItem('education', i, 'gpaType', e.target.value)}
              >
                <option value="" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>None</option>
                <option value="CGPA" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>CGPA</option>
                <option value="SGPA" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>SGPA</option>
                <option value="GPA" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>GPA</option>
                <option value="Percentage" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Percentage</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Grade / Score</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. 9.5, 3.8/4, 92%"
                value={edu.gpaValue || ''}
                onChange={(e) => updateRepeaterItem('education', i, 'gpaValue', e.target.value)}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.spanFull}`}>
              <label>Description</label>
              <textarea className="glass-input" rows={2} value={edu.description || ''} onChange={(e) => updateRepeaterItem('education', i, 'description', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="glass-btn-secondary" onClick={() => addRepeaterItem('education', { school: '', degree: '', startDate: '', endDate: '', description: '', gpaType: '', gpaValue: '' })}>
        <Plus size={16} /> Add Education
      </button>
    </div>
  );

  const renderProjectsSection = () => (
    <div className={styles.accordionContent}>
      {(resumeData.projects || []).map((proj, i) => (
        <div key={i} className={styles.repeaterItem}>
          <button className={styles.removeBtn} onClick={() => removeRepeaterItem('projects', i)}><Trash2 size={16} /></button>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Project Name</label>
              <input type="text" className="glass-input" value={proj.name || ''} onChange={(e) => updateRepeaterItem('projects', i, 'name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Technologies</label>
              <input type="text" className="glass-input" value={proj.technologies || ''} onChange={(e) => updateRepeaterItem('projects', i, 'technologies', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Link</label>
              <input type="text" className="glass-input" value={proj.link || ''} onChange={(e) => updateRepeaterItem('projects', i, 'link', e.target.value)} />
            </div>
            <div className={`${styles.formGroup} ${styles.spanFull}`}>
              <label>Description</label>
              <textarea className="glass-input" rows={3} value={proj.description || ''} onChange={(e) => updateRepeaterItem('projects', i, 'description', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="glass-btn-secondary" onClick={() => addRepeaterItem('projects', { name: '', description: '', technologies: '', link: '' })}>
        <Plus size={16} /> Add Project
      </button>
    </div>
  );

  const handleCategorizedSkillChange = (category, value) => {
    const list = value.split(',').map((item) => item.trim()).filter((item) => item !== '');
    setResumeData((prev) => ({
      ...prev,
      skills: {
        ...(prev.skills || {}),
        [category]: list
      }
    }));
  };

  const addCustomSkill = (type) => {
    setResumeData((prev) => {
      const skillsObj = prev.skills || {};
      const currentList = skillsObj[type] || [];
      return {
        ...prev,
        skills: {
          ...skillsObj,
          [type]: [...currentList, { name: '', value: [] }]
        }
      };
    });
  };

  const updateCustomSkill = (type, index, field, value) => {
    setResumeData((prev) => {
      const skillsObj = prev.skills || {};
      const newList = [...(skillsObj[type] || [])];
      if (field === 'value') {
        newList[index] = {
          ...newList[index],
          value: value.split(',').map(v => v.trim()).filter(v => v !== '')
        };
      } else {
        newList[index] = {
          ...newList[index],
          [field]: value
        };
      }
      return {
        ...prev,
        skills: {
          ...skillsObj,
          [type]: newList
        }
      };
    });
  };

  const deleteCustomSkill = (type, index) => {
    setResumeData((prev) => {
      const skillsObj = prev.skills || {};
      const newList = (skillsObj[type] || []).filter((_, idx) => idx !== index);
      return {
        ...prev,
        skills: {
          ...skillsObj,
          [type]: newList
        }
      };
    });
  };

  const renderSkillsSection = () => (
    <div className={styles.accordionContent}>
      <div className={styles.formGroup}>
        <label>Programming Languages (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. C, C++, Python, JavaScript" value={(resumeData.skills?.languages || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('languages', e.target.value)} />
      </div>
      <div className={styles.formGroup}>
        <label>Frontend (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. React.js, HTML5, CSS3, Tailwind CSS" value={(resumeData.skills?.frontend || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('frontend', e.target.value)} />
      </div>
      <div className={styles.formGroup}>
        <label>Backend (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. Node.js, Express.js" value={(resumeData.skills?.backend || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('backend', e.target.value)} />
      </div>
      <div className={styles.formGroup}>
        <label>Databases (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. MongoDB, MySQL" value={(resumeData.skills?.databases || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('databases', e.target.value)} />
      </div>
      <div className={styles.formGroup}>
        <label>Tools / Developer Tools (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. Git, GitHub, VS Code, Postman" value={(resumeData.skills?.tools || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('tools', e.target.value)} />
      </div>
      <div className={styles.formGroup}>
        <label>Cloud & Deployment (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. Firebase, Vercel, Render" value={(resumeData.skills?.cloud || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('cloud', e.target.value)} />
      </div>
      <div className={styles.formGroup}>
        <label>Core CS (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. DSA, OOPs, DBMS, OS, Computer Networks" value={(resumeData.skills?.coreCs || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('coreCs', e.target.value)} />
      </div>

      {/* Custom categories */}
      {(resumeData.skills?.customTech || []).map((item, idx) => (
        <div key={idx} className={styles.repeaterItem} style={{ border: '1px dashed var(--glass-border)', padding: '12px', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
          <button type="button" className={styles.removeBtn} onClick={() => deleteCustomSkill('customTech', idx)} style={{ top: '8px', right: '8px' }}><Trash2 size={16} /></button>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Custom Category Title</label>
              <input type="text" className="glass-input" placeholder="e.g. Machine Learning" value={item.name || ''} onChange={(e) => updateCustomSkill('customTech', idx, 'name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Skills (comma separated)</label>
              <input type="text" className="glass-input" placeholder="e.g. TensorFlow, PyTorch" value={(item.value || []).join(', ')} onChange={(e) => updateCustomSkill('customTech', idx, 'value', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="glass-btn-secondary" onClick={() => addCustomSkill('customTech')} style={{ marginTop: '8px', width: '100%' }}>
        <Plus size={16} /> Add Custom Tech Category
      </button>
    </div>
  );

  const renderSoftSkillsSection = () => (
    <div className={styles.accordionContent}>
      <div className={styles.formGroup}>
        <label>Soft Skills (comma separated)</label>
        <input type="text" className="glass-input" placeholder="e.g. Problem Solving, Leadership, Team Collaboration" value={(resumeData.skills?.softSkills || []).join(', ')} onChange={(e) => handleCategorizedSkillChange('softSkills', e.target.value)} />
      </div>

      {/* Custom soft categories */}
      {(resumeData.skills?.customSoft || []).map((item, idx) => (
        <div key={idx} className={styles.repeaterItem} style={{ border: '1px dashed var(--glass-border)', padding: '12px', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
          <button type="button" className={styles.removeBtn} onClick={() => deleteCustomSkill('customSoft', idx)} style={{ top: '8px', right: '8px' }}><Trash2 size={16} /></button>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Custom Category Title</label>
              <input type="text" className="glass-input" placeholder="e.g. Methodologies" value={item.name || ''} onChange={(e) => updateCustomSkill('customSoft', idx, 'name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Skills (comma separated)</label>
              <input type="text" className="glass-input" placeholder="e.g. Agile, Scrum" value={(item.value || []).join(', ')} onChange={(e) => updateCustomSkill('customSoft', idx, 'value', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="glass-btn-secondary" onClick={() => addCustomSkill('customSoft')} style={{ marginTop: '8px', width: '100%' }}>
        <Plus size={16} /> Add Custom Soft Category
      </button>
    </div>
  );

  const renderToolsSection = () => (
    <div className={styles.accordionContent}>
      <div className={styles.formGroup}>
        <label>Tools & Technologies (comma separated)</label>
        <textarea className="glass-input" rows={3} placeholder="e.g. Tableau, MS Excel, Power BI, JIRA" value={(resumeData.tools || []).join(', ')} onChange={(e) => handleListChange('tools', e.target.value)} />
      </div>
    </div>
  );

  const renderCertsSection = () => (
    <div className={styles.accordionContent}>
      {(resumeData.certifications || []).map((cert, i) => (
        <div key={i} className={styles.repeaterItem}>
          <button className={styles.removeBtn} onClick={() => removeRepeaterItem('certifications', i)}><Trash2 size={16} /></button>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Certification Name</label>
              <input type="text" className="glass-input" value={cert.name || ''} onChange={(e) => updateRepeaterItem('certifications', i, 'name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Issuer</label>
              <input type="text" className="glass-input" value={cert.issuer || ''} onChange={(e) => updateRepeaterItem('certifications', i, 'issuer', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Date</label>
              <input type="text" className="glass-input" value={cert.date || ''} onChange={(e) => updateRepeaterItem('certifications', i, 'date', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Certificate Link</label>
              <input type="text" className="glass-input" value={cert.link || ''} onChange={(e) => updateRepeaterItem('certifications', i, 'link', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Credential ID</label>
              <input type="text" className="glass-input" value={cert.credentialId || ''} onChange={(e) => updateRepeaterItem('certifications', i, 'credentialId', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button className="glass-btn-secondary" onClick={() => addRepeaterItem('certifications', { name: '', issuer: '', date: '', link: '', credentialId: '' })}>
        <Plus size={16} /> Add Certification
      </button>
    </div>
  );

  const renderATSSection = () => (
    <div className={styles.accordionContent}>
      <div className={styles.atsContainer}>
        <div className={styles.scoreWrapper}>
          <div
            className={styles.scoreCircle}
            style={{
              borderColor: score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)',
              color: score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)',
            }}
          >
            {score}
          </div>
          <div className={styles.scoreText}>
            <span className={styles.scoreLabel}>ATS Score</span>
            <span className={styles.scoreDesc}>
              {score >= 80 ? 'Excellent! Highly searchable.' : score >= 50 ? 'Good, but has room to optimize.' : 'Low score. Complete missing sections.'}
            </span>
          </div>
        </div>

        <div className={styles.checkList}>
          {checks.map((item, idx) => (
            <div key={idx} className={styles.checkItem}>
              {item.pass ? (
                <CheckCircle size={16} className={styles.checkSuccess} />
              ) : (
                <AlertTriangle size={16} className={styles.checkWarning} style={{ color: item.optional ? 'var(--warning)' : 'var(--danger)' }} />
              )}
              <span style={{ color: item.pass ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Map section keys to their content renderers
  const sectionRenderers = {
    personal: renderPersonalSection,
    experience: renderExperienceSection,
    education: renderEducationSection,
    projects: renderProjectsSection,
    skills: renderSkillsSection,
    certs: renderCertsSection,
    tools: renderToolsSection,
    softSkills: renderSoftSkillsSection,
    ats: renderATSSection,
  };

  // ─── Formatting Section Renderer ───────────────────────────
  const renderFormattingSection = () => {
    const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#e11d48', '#f59e0b', '#475569'];
    const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Lora', 'Courier New'];
    const FONT_SIZES = ['10px', '11px', '12px', '13px', '14px', '15px', '16px'];
    const MARGINS = [
      { value: '0.25in', label: 'Minimal (0.25")' },
      { value: '0.4in', label: 'Super Narrow (0.4")' },
      { value: '0.5in', label: 'Narrow (0.5")' },
      { value: '0.75in', label: 'Moderate (0.75")' },
      { value: '1in', label: 'Standard (1")' }
    ];

    const currentTemplate = resumeData.template || 'classic';

    return (
      <div className={styles.accordionContent}>
        <div className={styles.controlsGrid}>
          {/* Base Template Selection */}
          <div className={styles.formGroup}>
            <label>Base Template</label>
            <div className={styles.templateSelectGrid}>
              {[
                { id: 'classic', name: 'Classic' },
                { id: 'modern', name: 'Modern Split' },
                { id: 'tech', name: 'Tech Dev' },
                { id: 'creative', name: 'Creative' },
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
                  className={`${styles.templateOption} ${currentTemplate === temp.id ? styles.templateOptionActive : ''}`}
                  onClick={() => handleResumeConfigChange('template', temp.id)}
                >
                  <span className={styles.templateName}>{temp.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div className={styles.formGroup}>
            <label>Theme Color</label>
            <div className={styles.colorPicker}>
              {COLORS.map((color) => (
                <div
                  key={color}
                  className={`${styles.colorDot} ${resumeData.themeColor === color ? styles.colorDotActive : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleResumeConfigChange('themeColor', color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Font Family, Font Size, Margins Grid */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Font Family</label>
              <select
                className="glass-input"
                value={resumeData.fontFamily || 'Inter'}
                onChange={(e) => handleResumeConfigChange('fontFamily', e.target.value)}
              >
                {FONTS.map((font) => (
                  <option key={font} value={font} style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Font Size</label>
              <select
                className="glass-input"
                value={resumeData.fontSize || '14px'}
                onChange={(e) => handleResumeConfigChange('fontSize', e.target.value)}
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size} style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Margins</label>
              <select
                className="glass-input"
                value={resumeData.margins || '1in'}
                onChange={(e) => handleResumeConfigChange('margins', e.target.value)}
              >
                {MARGINS.map((m) => (
                  <option key={m.value} value={m.value} style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Split layout settings */}
            {(currentTemplate === 'modern' || currentTemplate === 'creative') && (
              <>
                <div className={styles.formGroup}>
                  <label>Sidebar Position</label>
                  <select
                    className="glass-input"
                    value={resumeData.sidebarPosition || 'left'}
                    onChange={(e) => handleResumeConfigChange('sidebarPosition', e.target.value)}
                  >
                    <option value="left" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Left</option>
                    <option value="right" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Right</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Sidebar Width Ratio</label>
                  <select
                    className="glass-input"
                    value={resumeData.sidebarRatio || '30%'}
                    onChange={(e) => handleResumeConfigChange('sidebarRatio', e.target.value)}
                  >
                    <option value="25%" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Narrow (25%)</option>
                    <option value="30%" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Medium (30%)</option>
                    <option value="35%" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Wide (35%)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Section Columns Control */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>Section Column Layouts</label>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Skills Columns</label>
                <select
                  className="glass-input"
                  value={resumeData.skillsColumns || '3'}
                  onChange={(e) => handleResumeConfigChange('skillsColumns', e.target.value)}
                >
                  <option value="1" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>1 Column</option>
                  <option value="2" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>2 Columns</option>
                  <option value="3" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>3 Columns</option>
                  <option value="4" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>4 Columns</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Experience Layout</label>
                <select
                  className="glass-input"
                  value={resumeData.experienceColumns || '1'}
                  onChange={(e) => handleResumeConfigChange('experienceColumns', e.target.value)}
                >
                  <option value="1" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Single Column</option>
                  <option value="2" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Split 2 Columns</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Projects Layout</label>
                <select
                  className="glass-input"
                  value={resumeData.projectsColumns || '1'}
                  onChange={(e) => handleResumeConfigChange('projectsColumns', e.target.value)}
                >
                  <option value="1" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Single Column</option>
                  <option value="2" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Split 2 Columns</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Education Layout</label>
                <select
                  className="glass-input"
                  value={resumeData.educationColumns || '1'}
                  onChange={(e) => handleResumeConfigChange('educationColumns', e.target.value)}
                >
                  <option value="1" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Single Column</option>
                  <option value="2" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Split 2 Columns</option>
                </select>
              </div>
            </div>
          </div>

          {/* Spacing & Density Control */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>Spacing & Density</label>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Line Height</label>
                <select
                  className="glass-input"
                  value={resumeData.lineHeight || '1.4'}
                  onChange={(e) => handleResumeConfigChange('lineHeight', e.target.value)}
                >
                  <option value="1.15" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Compact (1.15)</option>
                  <option value="1.2" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Tight (1.2)</option>
                  <option value="1.3" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Moderate (1.3)</option>
                  <option value="1.4" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Normal (1.4)</option>
                  <option value="1.5" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Relaxed (1.5)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Section Spacing</label>
                <select
                  className="glass-input"
                  value={resumeData.sectionSpacing || '15px'}
                  onChange={(e) => handleResumeConfigChange('sectionSpacing', e.target.value)}
                >
                  <option value="6px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Compact (6px)</option>
                  <option value="10px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Tight (10px)</option>
                  <option value="15px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Moderate (15px)</option>
                  <option value="20px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Normal (20px)</option>
                  <option value="25px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Relaxed (25px)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Item Spacing</label>
                <select
                  className="glass-input"
                  value={resumeData.itemSpacing || '10px'}
                  onChange={(e) => handleResumeConfigChange('itemSpacing', e.target.value)}
                >
                  <option value="4px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Compact (4px)</option>
                  <option value="6px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Tight (6px)</option>
                  <option value="10px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Moderate (10px)</option>
                  <option value="14px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Normal (14px)</option>
                  <option value="18px" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Relaxed (18px)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render a custom section
  const renderCustomSectionContent = (section) => (
    <div className={styles.accordionContent}>
      <div className={styles.formGroup}>
        <label>Section Content</label>
        <textarea
          className="glass-input"
          rows={4}
          placeholder="Enter content for this section..."
          value={(section.fields && section.fields[0]?.value) || ''}
          onChange={(e) => {
            const updatedCustom = (resumeData.customSections || []).map((s) =>
              s._id === section._id ? { ...s, fields: [{ key: 'content', value: e.target.value }] } : s
            );
            setResumeData((prev) => ({ ...prev, customSections: updatedCustom }));
          }}
        />
      </div>
      <button
        className="glass-btn-secondary"
        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
        onClick={() => {
          setDeleteTargetId(section._id);
          setIsDeleteModalOpen(true);
        }}
      >
        <Trash2 size={16} /> Delete Section
      </button>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
            <ArrowLeft size={20} />
            <span>Dashboard</span>
          </button>
          <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }}></div>
          <input
            type="text"
            className={styles.resumeTitle}
            value={resumeData.title}
            onChange={(e) => handleResumeConfigChange('title', e.target.value)}
          />
          <span style={{ fontSize: '0.85rem', color: saveStatus === 'Error' ? 'var(--danger)' : 'var(--text-muted)' }}>
            {saveStatus === 'Saving...' ? 'Saving...' : saveStatus === 'Saved' ? 'Changes saved' : 'Failed to save!'}
          </span>
        </div>

        <div className={styles.navRight}>
          <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
            <button
              className="glass-btn-secondary"
              onClick={undo}
              disabled={historyPointer <= 0}
              title="Undo change"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem', height: '36px' }}
            >
              <Undo size={14} />
              <span>Undo</span>
            </button>
            <button
              className="glass-btn-secondary"
              onClick={redo}
              disabled={historyPointer >= history.length - 1}
              title="Redo change"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem', height: '36px' }}
            >
              <Redo size={14} />
              <span>Redo</span>
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
            <button
              className="glass-btn-secondary"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
              title="Zoom In"
              style={{ padding: '6px', height: '36px', width: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <ZoomIn size={16} />
            </button>
            <button
              className="glass-btn-secondary"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              title="Zoom Out"
              style={{ padding: '6px', height: '36px', width: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <ZoomOut size={16} />
            </button>
          </div>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="glass-btn" onClick={downloadPDF} disabled={isExporting}>
            <Download size={18} /> {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </nav>

      <div className={styles.editorLayout}>
        {/* Left: Accordion Forms Panel */}
        <div className={styles.formPanel}>
          {/* Template & Formatting Section */}
          <div className={styles.accordion}>
            {renderAccordionHeader('formatting', 'Template & Formatting', false)}
            {openSections.formatting && renderFormattingSection()}
          </div>

          {sectionOrder.map((sectionKey) => {
            // Built-in section
            if (SECTION_LABELS[sectionKey]) {
              return (
                <div key={sectionKey} className={styles.accordion}>
                  {renderAccordionHeader(sectionKey, SECTION_LABELS[sectionKey])}
                  {openSections[sectionKey] && sectionRenderers[sectionKey]()}
                </div>
              );
            }

            // Custom section (matched by _id)
            const customSection = (resumeData.customSections || []).find((s) => s._id === sectionKey);
            if (customSection) {
              return (
                <div key={sectionKey} className={styles.accordion}>
                  {renderAccordionHeader(sectionKey, customSection.title || 'Custom Section')}
                  {openSections[sectionKey] && renderCustomSectionContent(customSection)}
                </div>
              );
            }

            // Unknown key — skip silently (orphan cleanup)
            return null;
          })}

          {/* Add Section Button */}
          <button
            className="glass-btn-secondary"
            style={{ width: '100%', marginTop: '8px', position: 'relative', zIndex: 10 }}
            onClick={() => {
              console.log('Add Section button clicked!');
              setCustomSectionTitle('');
              setIsCustomSectionModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Section
          </button>
        </div>

        {/* Right: Live Preview Panel */}
        <div className={styles.previewPanel}>
          <div 
            className={styles.a4Page} 
            id="resume-preview-root"
            ref={contentRef}
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              marginBottom: `${zoomLevel > 1 ? (zoomLevel - 1) * 11 : 0}in`
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {isCustomSectionModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCustomSectionModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Section</h2>
              <button className={styles.closeBtn} onClick={() => setIsCustomSectionModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            {/* If there are hidden predefined sections, show them here */}
            {(() => {
              const hiddenPredefined = Object.keys(SECTION_LABELS).filter(
                (key) => !(sectionOrder || []).includes(key)
              );
              if (hiddenPredefined.length === 0) return null;
              return (
                <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Re-enable Predefined Sections
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {hiddenPredefined.map((key) => (
                      <button
                        key={key}
                        type="button"
                        className="glass-btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        onClick={async () => {
                          const newOrder = [...sectionOrder, key];
                          setSectionOrder(newOrder);
                          await persistOrder(newOrder);
                          setOpenSections((prev) => ({ ...prev, [key]: true }));
                          setIsCustomSectionModalOpen(false);
                        }}
                      >
                        <Plus size={12} style={{ marginRight: '4px' }} /> {SECTION_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (customSectionTitle.trim()) {
                await handleAddCustomSection(customSectionTitle);
                setIsCustomSectionModalOpen(false);
                setCustomSectionTitle('');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label>Add a Custom Section</label>
                <input
                  type="text"
                  placeholder="e.g. Volunteer Work, Publications"
                  className="glass-input"
                  value={customSectionTitle}
                  onChange={(e) => setCustomSectionTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="glass-btn-secondary" onClick={() => setIsCustomSectionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="glass-btn">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Hide Section Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {deleteTargetId && SECTION_LABELS[deleteTargetId] ? 'Remove Section' : 'Delete Section'}
              </h2>
              <button className={styles.closeBtn} onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                {deleteTargetId && SECTION_LABELS[deleteTargetId] ? (
                  `Are you sure you want to remove the "${SECTION_LABELS[deleteTargetId]}" section? This will hide it from your resume layout, but your entered data will be preserved if you choose to add it back later.`
                ) : (
                  "Are you sure you want to delete this custom section? This will delete all content within this section. This action cannot be undone."
                )}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="glass-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="glass-btn"
                  style={{ backgroundColor: 'var(--danger)', color: 'white', borderColor: 'transparent' }}
                  onClick={async () => {
                    if (deleteTargetId) {
                      if (SECTION_LABELS[deleteTargetId]) {
                        await handleRemovePredefinedSection(deleteTargetId);
                      } else {
                        await handleDeleteCustomSection(deleteTargetId);
                      }
                      setIsDeleteModalOpen(false);
                      setDeleteTargetId(null);
                    }
                  }}
                >
                  {deleteTargetId && SECTION_LABELS[deleteTargetId] ? 'Remove' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
