export default function CreativeTemplate({ data }) {
  const {
    personalInfo = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    tools = [],
    themeColor = '#3b82f6',
    fontSize = '14px',
    margins = '1in',
    fontFamily = 'Inter',
    lineHeight = '1.5',
    sectionSpacing = '20px',
    itemSpacing = '12px',
    sidebarRatio = '30%',
    sidebarPosition = 'left',
    skillsColumns = '1',
    experienceColumns = '1',
    projectsColumns = '1',
    educationColumns = '1',
    sectionOrder = ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'],
    customSections = []
  } = data;

  const renderWideSection = (sectionKey) => {
    switch (sectionKey) {
      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience">
            <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
              Experience
            </h2>
            <div style={{
              display: experienceColumns === '2' ? 'grid' : 'flex',
              flexDirection: experienceColumns === '2' ? 'unset' : 'column',
              gridTemplateColumns: experienceColumns === '2' ? '1fr 1fr' : 'unset',
              gap: itemSpacing
            }}>
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a', fontSize: '0.9em' }}>
                    <span>{exp.role || 'Role'}</span>
                    <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.8em' }}>{exp.startDate} - {exp.endDate || 'Present'}</span>
                  </div>
                  <div style={{ fontSize: '0.85em', color: themeColor, fontWeight: '600', marginBottom: `calc(${itemSpacing} * 0.3)` }}>{exp.company}</div>
                  {exp.description && (
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.85em', whiteSpace: 'pre-line' }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'projects':
        if (projects.length === 0) return null;
        return (
          <div key="projects">
            <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
              Projects
            </h2>
            <div style={{
              display: projectsColumns === '2' ? 'grid' : 'flex',
              flexDirection: projectsColumns === '2' ? 'unset' : 'column',
              gridTemplateColumns: projectsColumns === '2' ? '1fr 1fr' : 'unset',
              gap: itemSpacing
            }}>
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a', fontSize: '0.9em' }}>
                    <span>{proj.name}</span>
                    {proj.technologies && <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.8em' }}>{proj.technologies}</span>}
                  </div>
                  {proj.link && <a href={proj.link} style={{ fontSize: '0.8em', color: themeColor }} target="_blank" rel="noreferrer">Project Link</a>}
                  {proj.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.2) 0 0 0`, color: '#475569', fontSize: '0.85em' }}>{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        // Try custom section
        const customSec = (customSections || []).find(s => s._id === sectionKey);
        if (customSec) {
          const contentVal = (customSec.fields && customSec.fields[0]?.value) || '';
          if (!contentVal.trim()) return null;
          return (
            <div key={sectionKey}>
              <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
                {customSec.title}
              </h2>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.85em', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                {contentVal}
              </p>
            </div>
          );
        }
        return null;
    }
  };

  const renderNarrowSection = (sectionKey) => {
    switch (sectionKey) {
      case 'skills': {
        const hasTechSkills =
          (skills.languages && skills.languages.length > 0) ||
          (skills.frontend && skills.frontend.length > 0) ||
          (skills.backend && skills.backend.length > 0) ||
          (skills.databases && skills.databases.length > 0) ||
          (skills.tools && skills.tools.length > 0) ||
          (skills.cloud && skills.cloud.length > 0) ||
          (skills.coreCs && skills.coreCs.length > 0) ||
          (skills.customTech && skills.customTech.length > 0);

        if (!hasTechSkills) return null;

        return (
          <div key="skills">
            <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
              Technical Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8em', color: '#334155' }}>
              {skills.languages && skills.languages.length > 0 && (
                <div><strong>Languages:</strong> {skills.languages.join(', ')}</div>
              )}
              {skills.frontend && skills.frontend.length > 0 && (
                <div><strong>Frontend:</strong> {skills.frontend.join(', ')}</div>
              )}
              {skills.backend && skills.backend.length > 0 && (
                <div><strong>Backend:</strong> {skills.backend.join(', ')}</div>
              )}
              {skills.databases && skills.databases.length > 0 && (
                <div><strong>Databases:</strong> {skills.databases.join(', ')}</div>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <div><strong>Developer Tools:</strong> {skills.tools.join(', ')}</div>
              )}
              {skills.cloud && skills.cloud.length > 0 && (
                <div><strong>Cloud:</strong> {skills.cloud.join(', ')}</div>
              )}
              {skills.coreCs && skills.coreCs.length > 0 && (
                <div><strong>Core CS:</strong> {skills.coreCs.join(', ')}</div>
              )}
              {(skills.customTech || []).map((item, idx) => (
                <div key={idx}><strong>{item.name || 'Category'}:</strong> {(item.value || []).join(', ')}</div>
              ))}
            </div>
          </div>
        );
      }
      case 'softSkills': {
        const hasSoftSkills =
          (skills.softSkills && skills.softSkills.length > 0) ||
          (skills.customSoft && skills.customSoft.length > 0);

        if (!hasSoftSkills) return null;

        return (
          <div key="softSkills">
            <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
              Soft Skills
            </h2>
            {skills.softSkills && skills.softSkills.length > 0 && (
              <div style={{ marginBottom: (skills.customSoft && skills.customSoft.length > 0) ? '6px' : '0' }}>
                {skillsColumns === '1' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75em', color: '#334155' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx}>• {skill}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skillsColumns}, 1fr)`, gap: '6px' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx} style={{ fontSize: '0.75em', background: '#f8fafc', border: `1px solid #e2e8f0`, padding: '3px 8px', borderRadius: '12px', color: '#334155', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {skills.customSoft && skills.customSoft.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8em', color: '#334155' }}>
                {skills.customSoft.map((item, idx) => (
                  <div key={idx}><strong>{item.name || 'Category'}:</strong> {(item.value || []).join(', ')}</div>
                ))}
              </div>
            )}
          </div>
        );
      }
      case 'tools': {
        if (!tools || tools.length === 0) return null;
        return (
          <div key="tools">
            <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
              Tools & Technologies
            </h2>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.85em' }}>
              {tools.join(', ')}
            </p>
          </div>
        );
      }
      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education">
            <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
              Education
            </h2>
            <div style={{
              display: educationColumns === '2' ? 'grid' : 'flex',
              flexDirection: educationColumns === '2' ? 'unset' : 'column',
              gridTemplateColumns: educationColumns === '2' ? '1fr 1fr' : 'unset',
              gap: itemSpacing
            }}>
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.85em' }}>{edu.degree}</div>
                  <div style={{ fontSize: '0.8em', color: '#475569', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span>{edu.school}</span>
                    {edu.gpaType && edu.gpaValue && (
                      <span style={{ color: '#64748b' }}>• {edu.gpaType}: {edu.gpaValue}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75em', color: '#64748b' }}>{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'certs':
        if (certifications.length === 0 && languages.length === 0) return null;
        return (
          <div key="certs" style={{ display: 'flex', flexDirection: 'column', gap: sectionSpacing }}>
            {certifications.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
                  Certifications
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8em', color: '#475569' }}>
                  {certifications.map((cert, idx) => (
                    <div key={idx}>
                      <strong>{cert.name}</strong>
                      <div>{cert.issuer} ({cert.date})</div>
                      {cert.credentialId && <div style={{ fontSize: '0.95em', color: '#64748b' }}>ID: {cert.credentialId}</div>}
                      {cert.link && <div style={{ marginTop: '2px' }}><a href={cert.link} style={{ color: themeColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">Verify Certificate</a></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.1em', fontWeight: '700', color: '#0f172a', marginBottom: '10px', borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px' }}>
                  Languages
                </h2>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.85em' }}>{languages.join(', ')}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      fontFamily: fontFamily.includes(' ') ? `"${fontFamily}", sans-serif` : `${fontFamily}, sans-serif`,
      fontSize: fontSize,
      padding: margins,
      color: '#1e293b',
      lineHeight: lineHeight,
      backgroundColor: '#ffffff',
      width: '100%',
      minHeight: '11in',
      boxSizing: 'border-box'
    }}>
      {/* Top Accent Line */}
      <div style={{ height: '6px', backgroundColor: themeColor, width: '100%', marginBottom: sectionSpacing, borderRadius: '2px' }}></div>

      {/* Header */}
      <div style={{ marginBottom: sectionSpacing }}>
        <h1 style={{ fontSize: '2.2em', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        {personalInfo.title && (
          <p style={{ fontSize: '1.1em', fontWeight: '500', color: themeColor, margin: '0 0 12px 0', fontStyle: 'italic' }}>
            {personalInfo.title}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.85em', color: '#475569', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px 0' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span><a href={personalInfo.website} style={{ color: themeColor, fontWeight: '500' }} target="_blank" rel="noreferrer">Portfolio</a></span>}
          {personalInfo.linkedin && <span><a href={personalInfo.linkedin} style={{ color: themeColor, fontWeight: '500' }} target="_blank" rel="noreferrer">LinkedIn</a></span>}
          {personalInfo.github && <span><a href={personalInfo.github} style={{ color: themeColor, fontWeight: '500' }} target="_blank" rel="noreferrer">GitHub</a></span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={{ marginBottom: sectionSpacing }}>
          <p style={{ margin: 0, color: '#334155', fontSize: '0.95em', textAlign: 'justify', lineHeight: '1.6' }}>
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: sidebarPosition === 'right' ? '2fr 1fr' : '1fr 2fr',
        gap: '24px'
      }}>
        {/* Left Column (Wide Content) */}
        <div style={{
          gridColumn: sidebarPosition === 'right' ? '1' : '2',
          display: 'flex',
          flexDirection: 'column',
          gap: sectionSpacing
        }}>
          {sectionOrder.map(renderWideSection)}
        </div>

        {/* Right Column (Sidebar/Narrow Content) */}
        <div style={{
          gridColumn: sidebarPosition === 'right' ? '2' : '1',
          display: 'flex',
          flexDirection: 'column',
          gap: sectionSpacing
        }}>
          {sectionOrder.map(renderNarrowSection)}
        </div>
      </div>
    </div>
  );
}
