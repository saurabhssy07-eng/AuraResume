export default function TechTemplate({ data }) {
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
    lineHeight = '1.45',
    sectionSpacing = '16px',
    itemSpacing = '10px',
    skillsColumns = '1',
    experienceColumns = '1',
    projectsColumns = '1',
    educationColumns = '1',
    sectionOrder = ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'],
    customSections = []
  } = data;

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'personal':
        if (!personalInfo.summary) return null;
        return (
          <div key="personal" style={{ marginBottom: sectionSpacing }}>
            <p style={{ margin: 0, color: '#334155', fontSize: '0.9em', textAlign: 'justify' }}>
              {personalInfo.summary}
            </p>
          </div>
        );
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
          <div key="skills" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &gt; Technical Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155', fontSize: '0.9em' }}>
              {skills.languages && skills.languages.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Languages:</strong> {skills.languages.join(', ')}
                </p>
              )}
              {skills.frontend && skills.frontend.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Frontend:</strong> {skills.frontend.join(', ')}
                </p>
              )}
              {skills.backend && skills.backend.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Backend:</strong> {skills.backend.join(', ')}
                </p>
              )}
              {skills.databases && skills.databases.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Databases:</strong> {skills.databases.join(', ')}
                </p>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Developer Tools:</strong> {skills.tools.join(', ')}
                </p>
              )}
              {skills.cloud && skills.cloud.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Cloud & Deployment:</strong> {skills.cloud.join(', ')}
                </p>
              )}
              {skills.coreCs && skills.coreCs.length > 0 && (
                <p style={{ margin: 0 }}>
                  <strong>Core CS:</strong> {skills.coreCs.join(', ')}
                </p>
              )}
              {(skills.customTech || []).map((item, idx) => (
                <p key={idx} style={{ margin: 0 }}>
                  <strong>{item.name || 'Category'}:</strong> {(item.value || []).join(', ')}
                </p>
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
          <div key="softSkills" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &gt; Soft Skills
            </h2>
            {skills.softSkills && skills.softSkills.length > 0 && (
              <div style={{ marginBottom: (skills.customSoft && skills.customSoft.length > 0) ? '6px' : '0' }}>
                {skillsColumns === '1' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155', fontSize: '0.9em' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx}># {skill}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skillsColumns}, 1fr)`, gap: '8px', color: '#334155', fontSize: '0.9em' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx}># {skill}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {skills.customSoft && skills.customSoft.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155', fontSize: '0.9em' }}>
                {skills.customSoft.map((item, idx) => (
                  <p key={idx} style={{ margin: 0 }}>
                    <strong>{item.name || 'Category'}:</strong> {(item.value || []).join(', ')}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      }
      case 'tools': {
        if (!tools || tools.length === 0) return null;
        return (
          <div key="tools" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &gt; Tools & Technologies
            </h2>
            <p style={{ margin: 0, color: '#334155', fontSize: '0.9em' }}>
              {tools.join(', ')}
            </p>
          </div>
        );
      }
      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &gt; Professional Experience
            </h2>
            <div style={{
              display: experienceColumns === '2' ? 'grid' : 'block',
              gridTemplateColumns: experienceColumns === '2' ? '1fr 1fr' : 'none',
              gap: experienceColumns === '2' ? '16px' : 'none'
            }}>
              {experience.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: experienceColumns === '2' ? '0' : (idx < experience.length - 1 ? itemSpacing : '0') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a', fontSize: '0.9em' }}>
                    <span>{exp.role || 'Role'} @ {exp.company || 'Company'}</span>
                    <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.85em' }}>[{exp.startDate} - {exp.endDate || 'Present'}]</span>
                  </div>
                  {exp.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.4) 0 0 0`, color: '#475569', fontSize: '0.85em', whiteSpace: 'pre-line' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'projects':
        if (projects.length === 0) return null;
        return (
          <div key="projects" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &gt; Key Projects
            </h2>
            <div style={{
              display: projectsColumns === '2' ? 'grid' : 'block',
              gridTemplateColumns: projectsColumns === '2' ? '1fr 1fr' : 'none',
              gap: projectsColumns === '2' ? '16px' : 'none'
            }}>
              {projects.map((proj, idx) => (
                <div key={idx} style={{ marginBottom: projectsColumns === '2' ? '0' : (idx < projects.length - 1 ? itemSpacing : '0') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a', fontSize: '0.9em' }}>
                    <span>
                      {proj.name}
                      {proj.link && <a href={proj.link} style={{ color: themeColor, fontSize: '0.8em', marginLeft: '6px', textDecoration: 'underline' }} target="_blank" rel="noreferrer">[link]</a>}
                    </span>
                    {proj.technologies && <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.8em' }}>[{proj.technologies}]</span>}
                  </div>
                  {proj.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.2) 0 0 0`, color: '#475569', fontSize: '0.85em' }}>{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &gt; Academic Background
            </h2>
            <div style={{
              display: educationColumns === '2' ? 'grid' : 'block',
              gridTemplateColumns: educationColumns === '2' ? '1fr 1fr' : 'none',
              gap: educationColumns === '2' ? '16px' : 'none'
            }}>
              {education.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: educationColumns === '2' ? '0' : (idx < education.length - 1 ? `calc(${itemSpacing} * 0.8)` : '0') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a', fontSize: '0.9em' }}>
                    <span>
                      {edu.degree || 'Degree'} - {edu.school || 'School'}
                      {edu.gpaType && edu.gpaValue && (
                        <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.95em' }}> ({edu.gpaType}: {edu.gpaValue})</span>
                      )}
                    </span>
                    <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.85em' }}>[{edu.startDate} - {edu.endDate || 'Present'}]</span>
                  </div>
                  {edu.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.2) 0 0 0`, color: '#475569', fontSize: '0.8em' }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'certs':
        if (certifications.length === 0 && languages.length === 0) return null;
        return (
          <div key="certs" style={{ display: 'grid', gridTemplateColumns: certifications.length > 0 && languages.length > 0 ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: sectionSpacing }}>
            {certifications.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  &gt; Certifications
                </h2>
                <ul style={{ margin: 0, paddingLeft: '14px', color: '#475569', fontSize: '0.85em' }}>
                  {certifications.map((cert, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      <strong>{cert.name}</strong> ({cert.issuer}, {cert.date})
                      {cert.credentialId && <span> - ID: {cert.credentialId}</span>}
                      {cert.link && <a href={cert.link} style={{ color: themeColor, marginLeft: '6px', textDecoration: 'underline' }} target="_blank" rel="noreferrer">Verify</a>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {languages.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  &gt; Languages
                </h2>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.9em' }}>{languages.join(', ')}</p>
              </div>
            )}
          </div>
        );
      default:
        // Try custom section
        const customSec = (customSections || []).find(s => s._id === sectionKey);
        if (customSec) {
          const contentVal = (customSec.fields && customSec.fields[0]?.value) || '';
          if (!contentVal.trim()) return null;
          return (
            <div key={sectionKey} style={{ marginBottom: sectionSpacing }}>
              <h2 style={{ fontSize: '1em', fontWeight: '800', color: themeColor, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                &gt; {customSec.title}
              </h2>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.95em', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                {contentVal}
              </p>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div style={{
      fontFamily: `${fontFamily}, monospace, sans-serif`,
      fontSize: fontSize,
      padding: margins,
      color: '#0f172a',
      lineHeight: lineHeight,
      backgroundColor: '#ffffff',
      width: '100%',
      minHeight: '11in',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ paddingBottom: '12px', borderBottom: `3px double ${themeColor}`, marginBottom: sectionSpacing }}>
        <h1 style={{ fontSize: '1.8em', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.title && (
          <div style={{ fontSize: '0.95em', fontWeight: '600', color: themeColor, marginBottom: '8px' }}>
            {personalInfo.title}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8em', color: '#475569' }}>
          {personalInfo.email && <span>email: {personalInfo.email}</span>}
          {personalInfo.phone && <span>phone: {personalInfo.phone}</span>}
          {personalInfo.location && <span>loc: {personalInfo.location}</span>}
          {personalInfo.github && <span>github: <a href={personalInfo.github} style={{ color: themeColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">{personalInfo.github}</a></span>}
          {personalInfo.linkedin && <span>linkedin: <a href={personalInfo.linkedin} style={{ color: themeColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">LinkedIn</a></span>}
          {personalInfo.website && <span>web: <a href={personalInfo.website} style={{ color: themeColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">Portfolio</a></span>}
        </div>
      </div>

      {/* Dynamic Sections based on sectionOrder */}
      {sectionOrder.map(renderSection)}
    </div>
  );
}
