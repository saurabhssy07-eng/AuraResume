export default function MinimalTemplate({ data }) {
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
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Professional Summary
            </h2>
            <p style={{ margin: 0, color: '#374151', textAlign: 'justify', fontSize: '0.95em' }}>
              {personalInfo.summary}
            </p>
          </div>
        );
      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 12px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Work Experience
            </h2>
            <div style={{
              display: experienceColumns === '2' ? 'grid' : 'block',
              gridTemplateColumns: experienceColumns === '2' ? '1fr 1fr' : 'none',
              gap: experienceColumns === '2' ? '16px' : 'none'
            }}>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: experienceColumns === '2' ? '0' : (i < experience.length - 1 ? itemSpacing : '0') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1f2937', fontSize: '0.95em' }}>
                    <span>{exp.role || 'Role'} • {exp.company || 'Company'}</span>
                    <span style={{ fontWeight: 'normal', color: '#4b5563', fontSize: '0.9em' }}>{exp.startDate} - {exp.endDate || 'Present'}</span>
                  </div>
                  {exp.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.4) 0 0 0`, color: '#4b5563', fontSize: '0.9em', whiteSpace: 'pre-line' }}>
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
          <div key="education" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 12px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Education
            </h2>
            <div style={{
              display: educationColumns === '2' ? 'grid' : 'block',
              gridTemplateColumns: educationColumns === '2' ? '1fr 1fr' : 'none',
              gap: educationColumns === '2' ? '16px' : 'none'
            }}>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: educationColumns === '2' ? '0' : (i < education.length - 1 ? itemSpacing : '0') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1f2937', fontSize: '0.95em' }}>
                    <span>{edu.degree || 'Degree'}</span>
                    <span style={{ fontWeight: 'normal', color: '#4b5563', fontSize: '0.9em' }}>{edu.startDate} - {edu.endDate || 'Present'}</span>
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '0.9em', display: 'flex', gap: '8px' }}>
                    <span>{edu.school || 'School'}</span>
                    {edu.gpaType && edu.gpaValue && (
                      <span style={{ color: '#6b7280' }}>• {edu.gpaType}: {edu.gpaValue}</span>
                    )}
                  </div>
                  {edu.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.4) 0 0 0`, color: '#4b5563', fontSize: '0.85em' }}>{edu.description}</p>
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
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 12px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Key Projects
            </h2>
            <div style={{
              display: projectsColumns === '2' ? 'grid' : 'block',
              gridTemplateColumns: projectsColumns === '2' ? '1fr 1fr' : 'none',
              gap: projectsColumns === '2' ? '16px' : 'none'
            }}>
              {projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: projectsColumns === '2' ? '0' : (i < projects.length - 1 ? itemSpacing : '0') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1f2937', fontSize: '0.95em' }}>
                    <span>
                      {proj.name}
                      {proj.link && <a href={proj.link} style={{ color: themeColor !== '#3b82f6' ? themeColor : '#333', fontSize: '0.85em', marginLeft: '8px', fontWeight: 'normal' }} target="_blank" rel="noreferrer">Link</a>}
                    </span>
                    {proj.technologies && <span style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '0.85rem' }}>{proj.technologies}</span>}
                  </div>
                  {proj.description && (
                    <p style={{ margin: `calc(${itemSpacing} * 0.4) 0 0 0`, color: '#4b5563', fontSize: '0.9em' }}>{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
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
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Technical Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#374151', fontSize: '0.95em' }}>
              {skills.languages && skills.languages.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Languages:</strong> {skills.languages.join(', ')}</span>
                </div>
              )}
              {skills.frontend && skills.frontend.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Frontend:</strong> {skills.frontend.join(', ')}</span>
                </div>
              )}
              {skills.backend && skills.backend.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Backend:</strong> {skills.backend.join(', ')}</span>
                </div>
              )}
              {skills.databases && skills.databases.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Databases:</strong> {skills.databases.join(', ')}</span>
                </div>
              )}
              {skills.tools && skills.tools.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Developer Tools:</strong> {skills.tools.join(', ')}</span>
                </div>
              )}
              {skills.cloud && skills.cloud.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Cloud & Deployment:</strong> {skills.cloud.join(', ')}</span>
                </div>
              )}
              {skills.coreCs && skills.coreCs.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>Core CS:</strong> {skills.coreCs.join(', ')}</span>
                </div>
              )}
              {(skills.customTech || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '4px' }}>
                  <span>•</span>
                  <span><strong>{item.name || 'Category'}:</strong> {(item.value || []).join(', ')}</span>
                </div>
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
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Soft Skills
            </h2>
            {skills.softSkills && skills.softSkills.length > 0 && (
              <div style={{ marginBottom: (skills.customSoft && skills.customSoft.length > 0) ? '6px' : '0' }}>
                {skillsColumns === '1' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: 0, color: '#374151', fontSize: '0.95em' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx}>• {skill}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skillsColumns}, 1fr)`, gap: '8px', margin: 0, color: '#374151', fontSize: '0.95em' }}>
                    {skills.softSkills.map((skill, idx) => (
                      <span key={idx}>• {skill}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {skills.customSoft && skills.customSoft.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#374151', fontSize: '0.95em' }}>
                {skills.customSoft.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px' }}>
                    <span>•</span>
                    <span><strong>{item.name || 'Category'}:</strong> {(item.value || []).join(', ')}</span>
                  </div>
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
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Tools & Technologies
            </h2>
            <p style={{ margin: 0, color: '#374151', fontSize: '0.95em' }}>
              {tools.join(', ')}
            </p>
          </div>
        );
      }
      case 'certs':
        if (certifications.length === 0) return null;
        return (
          <div key="certs" style={{ marginBottom: sectionSpacing }}>
            <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
              Certifications
            </h2>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#4b5563', fontSize: '0.9em' }}>
              {certifications.map((cert, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  <strong>{cert.name}</strong> - {cert.issuer} ({cert.date})
                  {cert.credentialId && <span> • ID: {cert.credentialId}</span>}
                  {cert.link && <a href={cert.link} style={{ color: themeColor !== '#3b82f6' ? themeColor : '#333', fontSize: '0.85em', marginLeft: '8px', fontWeight: 'normal', textDecoration: 'underline' }} target="_blank" rel="noreferrer">Verify</a>}
                </li>
              ))}
            </ul>
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
              <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', borderBottom: themeColor !== '#3b82f6' ? `2px solid ${themeColor}` : 'none', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'lowercase', color: '#1f2937', letterSpacing: '0.03em' }}>
                {customSec.title}
              </h2>
              <p style={{ margin: 0, color: '#374151', fontSize: '0.95em', whiteSpace: 'pre-line', textAlign: 'justify' }}>
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
      padding: margins,
      color: '#1f2937',
      lineHeight: lineHeight,
      backgroundColor: '#ffffff',
      width: '100%',
      minHeight: '11in',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'left', marginBottom: sectionSpacing }}>
        <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: '0 0 6px 0', color: themeColor !== '#3b82f6' ? themeColor : '#333', textTransform: 'lowercase', letterSpacing: '0.05em' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        {personalInfo.title && (
          <p style={{ fontSize: '1.1em', fontWeight: '600', color: '#4b5563', margin: '0 0 10px 0' }}>
            {personalInfo.title}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.85em', color: '#4b5563' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.website && <span>• <a href={personalInfo.website} style={{ color: themeColor !== '#3b82f6' ? themeColor : '#333' }} target="_blank" rel="noreferrer">{personalInfo.website}</a></span>}
          {personalInfo.linkedin && <span>• <a href={personalInfo.linkedin} style={{ color: themeColor !== '#3b82f6' ? themeColor : '#333' }} target="_blank" rel="noreferrer">LinkedIn</a></span>}
          {personalInfo.github && <span>• <a href={personalInfo.github} style={{ color: themeColor !== '#3b82f6' ? themeColor : '#333' }} target="_blank" rel="noreferrer">GitHub</a></span>}
        </div>
      </div>

      {/* Dynamic Sections based on sectionOrder */}
      {sectionOrder.map(renderSection)}
    </div>
  );
}
