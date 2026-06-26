export default function ModernTemplate({ data }) {
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
    lineHeight = '1.4',
    sectionSpacing = '15px',
    itemSpacing = '10px',
    sidebarRatio = '30%',
    sidebarPosition = 'left',
    skillsColumns = '1',
    experienceColumns = '1',
    projectsColumns = '1',
    educationColumns = '1',
    sectionOrder = ['personal', 'experience', 'education', 'projects', 'skills', 'certs', 'tools', 'softSkills', 'ats'],
    customSections = []
  } = data;

  const gridColsStyle = sidebarPosition === 'right' ? `1fr ${sidebarRatio}` : `${sidebarRatio} 1fr`;

  const renderSidebarSection = (sectionKey) => {
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
            <h2 style={{ fontSize: '0.9em', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
              Technical Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75em', color: '#374151' }}>
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
            <h2 style={{ fontSize: '0.9em', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
              Soft Skills
            </h2>
            {skills.softSkills && skills.softSkills.length > 0 && (
              <div style={{ marginBottom: (skills.customSoft && skills.customSoft.length > 0) ? '6px' : '0' }}>
                {skillsColumns === '1' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75em', color: '#374151' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx}>• {skill}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skillsColumns}, 1fr)`, gap: '6px' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx} style={{ fontSize: '0.75em', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '3px 8px', borderRadius: '4px', color: '#374151', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {skills.customSoft && skills.customSoft.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75em', color: '#374151' }}>
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
            <h2 style={{ fontSize: '0.9em', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
              Tools & Technologies
            </h2>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.85em' }}>
              {tools.join(', ')}
            </p>
          </div>
        );
      }
      case 'certs':
        if (certifications.length === 0 && languages.length === 0) return null;
        return (
          <div key="certs" style={{ display: 'flex', flexDirection: 'column', gap: sectionSpacing }}>
            {certifications.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.9em', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
                  Certifications
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: itemSpacing, fontSize: '0.8em', color: '#4b5563' }}>
                  {certifications.map((cert, idx) => (
                    <div key={idx}>
                      <div style={{ fontWeight: 'bold', color: '#374151' }}>{cert.name}</div>
                      <div>{cert.issuer} ({cert.date})</div>
                      {cert.credentialId && <div style={{ fontSize: '0.95em', color: '#6b7280' }}>ID: {cert.credentialId}</div>}
                      {cert.link && <div style={{ marginTop: '2px' }}><a href={cert.link} style={{ color: themeColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">Verify Certificate</a></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <h2 style={{ fontSize: '0.9em', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
                  Languages
                </h2>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '0.85em' }}>{languages.join(', ')}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMainSection = (sectionKey) => {
    switch (sectionKey) {
      case 'personal':
        if (!personalInfo.summary) return null;
        return (
          <div key="personal">
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', borderBottom: `2px solid ${themeColor}`, paddingBottom: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Profile Summary
            </h2>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9em', textAlign: 'justify' }}>
              {personalInfo.summary}
            </p>
          </div>
        );
      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience">
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', borderBottom: `2px solid ${themeColor}`, paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#374151', fontSize: '0.9em' }}>
                    <span>{exp.role || 'Role'}</span>
                    <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.85em' }}>{exp.startDate} - {exp.endDate || 'Present'}</span>
                  </div>
                  <div style={{ fontSize: '0.85em', fontWeight: '600', color: themeColor, marginBottom: `calc(${itemSpacing} * 0.4)` }}>
                    {exp.company || 'Company'}
                  </div>
                  {exp.description && (
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.85em', whiteSpace: 'pre-line' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education">
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', borderBottom: `2px solid ${themeColor}`, paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#374151', fontSize: '0.9em' }}>
                    <span>{edu.degree || 'Degree'}</span>
                    <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.85em' }}>{edu.startDate} - {edu.endDate || 'Present'}</span>
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#4b5563', display: 'flex', gap: '8px' }}>
                    <span>{edu.school || 'School'}</span>
                    {edu.gpaType && edu.gpaValue && (
                      <span style={{ color: '#6b7280' }}>• {edu.gpaType}: {edu.gpaValue}</span>
                    )}
                  </div>
                  {edu.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.4) 0 0 0`, color: '#6b7280', fontSize: '0.8em' }}>{edu.description}</p>
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
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', borderBottom: `2px solid ${themeColor}`, paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#374151', fontSize: '0.9em' }}>
                    <span>{proj.name}</span>
                    {proj.technologies && <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.8em' }}>{proj.technologies}</span>}
                  </div>
                  {proj.link && (
                    <a href={proj.link} style={{ fontSize: '0.8em', color: themeColor }} target="_blank" rel="noreferrer">
                      View Project
                    </a>
                  )}
                  {proj.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.4) 0 0 0`, color: '#4b5563', fontSize: '0.85em' }}>{proj.description}</p>
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
              <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1f2937', borderBottom: `2px solid ${themeColor}`, paddingBottom: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {customSec.title}
              </h2>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9em', whiteSpace: 'pre-line', textAlign: 'justify' }}>
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
      fontFamily: fontFamily.includes(' ') ? `"${fontFamily}", sans-serif` : `${fontFamily}, sans-serif`,
      fontSize: fontSize,
      color: '#1f2937',
      lineHeight: lineHeight,
      backgroundColor: '#ffffff',
      width: '100%',
      minHeight: '11in',
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: gridColsStyle,
      gap: '24px',
      padding: margins
    }}>
      {/* Sidebar Column */}
      <div style={{
        gridColumn: sidebarPosition === 'right' ? '2' : '1',
        borderRight: sidebarPosition === 'right' ? 'none' : '1px solid #e5e7eb',
        borderLeft: sidebarPosition === 'right' ? '1px solid #e5e7eb' : 'none',
        paddingRight: sidebarPosition === 'right' ? '0' : '16px',
        paddingLeft: sidebarPosition === 'right' ? '16px' : '0',
        display: 'flex',
        flexDirection: 'column',
        gap: sectionSpacing
      }}>
        {/* Name Info */}
        <div>
          <h1 style={{ fontSize: '1.6em', fontWeight: 'bold', color: themeColor, margin: '0 0 4px 0', lineHeight: '1.2' }}>
            {personalInfo.fullName || 'Your Name'}
          </h1>
          {personalInfo.title && (
            <p style={{ fontSize: '0.95em', fontWeight: '600', color: '#4b5563', margin: 0 }}>
              {personalInfo.title}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div>
          <h2 style={{ fontSize: '0.9em', fontWeight: 'bold', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>
            Contact
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8em', color: '#4b5563', wordBreak: 'break-all' }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.website && <span><a href={personalInfo.website} style={{ color: themeColor }} target="_blank" rel="noreferrer">Website</a></span>}
            {personalInfo.linkedin && <span><a href={personalInfo.linkedin} style={{ color: themeColor }} target="_blank" rel="noreferrer">LinkedIn</a></span>}
            {personalInfo.github && <span><a href={personalInfo.github} style={{ color: themeColor }} target="_blank" rel="noreferrer">GitHub</a></span>}
          </div>
        </div>

        {/* Sidebar sections in sectionOrder relative order */}
        {sectionOrder.map(renderSidebarSection)}
      </div>

      {/* Main Content Column */}
      <div style={{
        gridColumn: sidebarPosition === 'right' ? '1' : '2',
        display: 'flex',
        flexDirection: 'column',
        gap: sectionSpacing
      }}>
        {/* Main Content sections in sectionOrder relative order */}
        {sectionOrder.map(renderMainSection)}
      </div>
    </div>
  );
}
