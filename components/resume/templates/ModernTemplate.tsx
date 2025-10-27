'use client';

import { Resume, PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';

interface ModernTemplateProps {
  resume: Resume;
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { styling } = resume;
  
  // Create CSS variables from styling
  const styleVars = {
    '--resume-font-family': styling.font_family,
    '--resume-font-size-body': `${styling.font_size_body}pt`,
    '--resume-font-size-heading': `${styling.font_size_heading}pt`,
    '--resume-color-primary': styling.color_primary,
    '--resume-color-text': styling.color_text,
    '--resume-color-accent': styling.color_accent,
    '--resume-line-height': styling.line_height,
    '--resume-section-spacing': `${styling.section_spacing}rem`,
  } as React.CSSProperties;
  // Get personal info section
  const personalInfoSection = resume.sections.find(s => s.type === 'personal_info');
  const personalInfo = personalInfoSection?.content as PersonalInfo | undefined;

  // Get skills section for sidebar
  const skillsSection = resume.sections.find(s => s.type === 'skills' && s.visible);
  const skills = skillsSection?.content as Skill[] | undefined;

  // Get other sections for main content
  const mainSections = resume.sections.filter(
    s => s.visible && s.type !== 'personal_info' && s.type !== 'skills'
  ).sort((a, b) => a.order - b.order);

  // Render section content based on type
  const renderSectionContent = (section: { type: string; content: unknown; visible: boolean }) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'education':
        return renderEducation(section.content as Education[]);
      case 'experience':
        return renderExperience(section.content as Experience[]);
      case 'projects':
        return renderProjects(section.content as Project[]);
      case 'certifications':
        return renderCertifications(section.content as Certification[]);
      case 'awards':
        return renderAwards(section.content as Award[]);
      case 'custom':
        return renderCustom(section.content as CustomContent);
      default:
        return null;
    }
  };

  const renderPersonalInfo = (content: PersonalInfo) => {
    return (
      <div className="mb-8 pb-6 border-b-2 border-gradient-to-r from-purple-600 to-indigo-600">
        {content.full_name && (
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {content.full_name}
          </h1>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          {content.email && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600">✉</span>
              <span>{content.email}</span>
            </div>
          )}
          {content.phone && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600">☎</span>
              <span>{content.phone}</span>
            </div>
          )}
          {content.location && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600">📍</span>
              <span>{content.location}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 mt-2">
          {content.website && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600">🌐</span>
              <span className="truncate">{content.website}</span>
            </div>
          )}
          {content.linkedin && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600">in</span>
              <span className="truncate">{content.linkedin}</span>
            </div>
          )}
          {content.github && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600">⚡</span>
              <span className="truncate">{content.github}</span>
            </div>
          )}
        </div>
        {content.summary && (
          <p className="mt-4 text-sm text-gray-700 leading-relaxed">
            {content.summary}
          </p>
        )}
      </div>
    );
  };

  const renderEducation = (items: Education[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border-l-2 border-purple-400 pl-4">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{item.institution}</h3>
                <p className="text-sm text-gray-700 font-medium">
                  {item.degree} in {item.field}
                </p>
              </div>
              <div className="text-right text-sm text-purple-600 font-medium ml-4">
                <p>
                  {item.start_date} - {item.current ? 'Present' : item.end_date}
                </p>
                {item.gpa && <p className="text-gray-600">GPA: {item.gpa}</p>}
              </div>
            </div>
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExperience = (items: Experience[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border-l-2 border-purple-400 pl-4">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{item.position}</h3>
                <p className="text-sm text-gray-700 font-medium">{item.company} • {item.location}</p>
              </div>
              <p className="text-sm text-purple-600 font-medium ml-4">
                {item.start_date} - {item.current ? 'Present' : item.end_date}
              </p>
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-gray-700">{item.description}</p>
            )}
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = (items: Project[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border-l-2 border-purple-400 pl-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-gray-900 flex-1">{item.name}</h3>
              {(item.start_date || item.end_date) && (
                <p className="text-sm text-purple-600 font-medium ml-4">
                  {item.start_date} {item.end_date && `- ${item.end_date}`}
                </p>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-gray-700">{item.description}</p>
            )}
            {item.technologies && item.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {(item.url || item.github) && (
              <div className="mt-2 flex gap-3 text-xs text-gray-600">
                {item.url && <span className="truncate">🔗 {item.url}</span>}
                {item.github && <span className="truncate">⚡ {item.github}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = (items: Skill[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-3">
        {items.map((skill, idx) => (
          <div key={idx}>
            <h3 className="font-bold text-sm text-purple-700 mb-2">{skill.category}</h3>
            <div className="flex flex-wrap gap-2">
              {skill.items.map((item, itemIdx) => (
                <span
                  key={itemIdx}
                  className="px-2 py-1 text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCertifications = (items: Certification[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border-l-2 border-purple-400 pl-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-sm text-gray-700">{item.issuer}</p>
              </div>
              <p className="text-sm text-purple-600 font-medium ml-4">{item.date}</p>
            </div>
            {item.credential_id && (
              <p className="text-xs text-gray-600 mt-1">ID: {item.credential_id}</p>
            )}
            {item.url && (
              <p className="text-xs text-gray-600 mt-1 truncate">🔗 {item.url}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = (items: Award[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border-l-2 border-purple-400 pl-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-700">{item.issuer}</p>
              </div>
              <p className="text-sm text-purple-600 font-medium ml-4">{item.date}</p>
            </div>
            {item.description && (
              <p className="text-sm text-gray-700 mt-1">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCustom = (content: CustomContent) => {
    if (!content.content) return null;
    return (
      <div className="border-l-2 border-purple-400 pl-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.content}</p>
      </div>
    );
  };

  return (
    <div 
      className="min-h-full"
      style={{
        ...styleVars,
        fontFamily: styling.font_family,
        fontSize: `${styling.font_size_body}pt`,
        lineHeight: styling.line_height,
        color: styling.color_text,
      }}
    >
      {/* Header with Personal Info */}
      {personalInfo && renderPersonalInfo(personalInfo)}

      {/* Two-column layout: Main content + Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {mainSections.map((section) => (
            <div key={section.id} className="animate-fade-in">
              <div className="mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="h-0.5 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-transparent mt-1"></div>
              </div>
              {renderSectionContent(section)}
            </div>
          ))}

          {/* Empty state for main content */}
          {mainSections.length === 0 && !skillsSection && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Add sections to your resume to see them here
              </p>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width for Skills and Contact */}
        {skillsSection && (
          <div className="md:col-span-1 space-y-6">
            {/* Skills Section in Sidebar */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
              <div className="mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wide">
                  {skillsSection.title}
                </h2>
                <div className="h-0.5 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-transparent mt-1"></div>
              </div>
              {renderSkills(skills || [])}
            </div>

            {/* Contact Info Card in Sidebar */}
            {personalInfo && (personalInfo.email || personalInfo.phone || personalInfo.location) && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                <div className="mb-3">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wide">
                    Contact
                  </h2>
                  <div className="h-0.5 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-transparent mt-1"></div>
                </div>
                <div className="space-y-2 text-sm">
                  {personalInfo.email && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">✉</span>
                      <span className="text-gray-700 break-all">{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo.phone && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">☎</span>
                      <span className="text-gray-700">{personalInfo.phone}</span>
                    </div>
                  )}
                  {personalInfo.location && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">📍</span>
                      <span className="text-gray-700">{personalInfo.location}</span>
                    </div>
                  )}
                  {personalInfo.website && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">🌐</span>
                      <span className="text-gray-700 break-all text-xs">{personalInfo.website}</span>
                    </div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">in</span>
                      <span className="text-gray-700 break-all text-xs">{personalInfo.linkedin}</span>
                    </div>
                  )}
                  {personalInfo.github && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">⚡</span>
                      <span className="text-gray-700 break-all text-xs">{personalInfo.github}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
