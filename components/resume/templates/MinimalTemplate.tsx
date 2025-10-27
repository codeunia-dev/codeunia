'use client';

import { Resume, PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';

interface MinimalTemplateProps {
  resume: Resume;
}

/**
 * MinimalTemplate - Ultra-clean layout with maximum whitespace
 * Design principles:
 * - Maximum whitespace for breathing room
 * - Minimal colors (black text on white background)
 * - Simple, clean typography
 * - Clear content hierarchy through spacing and font sizes
 * - No decorative elements or borders
 */
export function MinimalTemplate({ resume }: MinimalTemplateProps) {
  const { styling } = resume;
  
  // Get personal info section
  const personalInfoSection = resume.sections.find(s => s.type === 'personal_info');
  const personalInfo = personalInfoSection?.content as PersonalInfo | undefined;

  // Get all visible sections sorted by order
  const visibleSections = resume.sections
    .filter(s => s.visible && s.type !== 'personal_info')
    .sort((a, b) => a.order - b.order);

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
      case 'skills':
        return renderSkills(section.content as Skill[]);
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
      <div className="mb-12">
        {content.full_name && (
          <h1 className="text-4xl font-light text-gray-900 mb-6 tracking-tight">
            {content.full_name}
          </h1>
        )}
        
        {/* Contact information in a clean, minimal layout */}
        <div className="space-y-1 text-sm text-gray-600 mb-6">
          {content.email && (
            <div>{content.email}</div>
          )}
          {content.phone && (
            <div>{content.phone}</div>
          )}
          {content.location && (
            <div>{content.location}</div>
          )}
          {content.website && (
            <div className="truncate">{content.website}</div>
          )}
          {content.linkedin && (
            <div className="truncate">{content.linkedin}</div>
          )}
          {content.github && (
            <div className="truncate">{content.github}</div>
          )}
        </div>

        {/* Summary with extra spacing */}
        {content.summary && (
          <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
            {content.summary}
          </p>
        )}
      </div>
    );
  };

  const renderEducation = (items: Education[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-base">
                  {item.degree} in {item.field}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{item.institution}</p>
              </div>
              <div className="text-right text-sm text-gray-500 ml-6">
                <p>
                  {item.start_date} – {item.current ? 'Present' : item.end_date}
                </p>
                {item.gpa && <p className="mt-1">{item.gpa}</p>}
              </div>
            </div>
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {achievement}
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
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-base">{item.position}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.company} · {item.location}
                </p>
              </div>
              <p className="text-sm text-gray-500 ml-6">
                {item.start_date} – {item.current ? 'Present' : item.end_date}
              </p>
            </div>
            {item.description && (
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.description}</p>
            )}
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {achievement}
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
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 text-base flex-1">{item.name}</h3>
              {(item.start_date || item.end_date) && (
                <p className="text-sm text-gray-500 ml-6">
                  {item.start_date} {item.end_date && `– ${item.end_date}`}
                </p>
              )}
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.description}</p>
            )}
            {item.technologies && item.technologies.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                {item.technologies.join(' · ')}
              </p>
            )}
            {(item.url || item.github) && (
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                {item.url && <div className="truncate">{item.url}</div>}
                {item.github && <div className="truncate">{item.github}</div>}
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
      <div className="space-y-6">
        {items.map((skill, idx) => (
          <div key={idx}>
            <h3 className="font-medium text-gray-900 text-sm mb-2">{skill.category}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {skill.items.join(' · ')}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderCertifications = (items: Certification[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-base">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.issuer}</p>
              </div>
              <p className="text-sm text-gray-500 ml-6">{item.date}</p>
            </div>
            {item.credential_id && (
              <p className="text-xs text-gray-500 mt-2">{item.credential_id}</p>
            )}
            {item.url && (
              <p className="text-xs text-gray-500 mt-1 truncate">{item.url}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = (items: Award[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-base">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.issuer}</p>
              </div>
              <p className="text-sm text-gray-500 ml-6">{item.date}</p>
            </div>
            {item.description && (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCustom = (content: CustomContent) => {
    if (!content.content) return null;
    return (
      <div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {content.content}
        </p>
      </div>
    );
  };

  return (
    <div 
      className="min-h-full"
      style={{
        fontFamily: styling.font_family,
        fontSize: `${styling.font_size_body}pt`,
        lineHeight: styling.line_height,
        color: styling.color_text,
      }}
    >
      {/* Header with Personal Info - Maximum whitespace */}
      {personalInfo && renderPersonalInfo(personalInfo)}

      {/* Single-column layout with generous spacing */}
      <div className="space-y-12">
        {visibleSections.map((section) => (
          <div key={section.id} className="animate-fade-in">
            {/* Section title with minimal styling - just uppercase and spacing */}
            <h2 className="text-xs font-medium text-gray-900 uppercase tracking-widest mb-6 letter-spacing-wide">
              {section.title}
            </h2>
            {renderSectionContent(section)}
          </div>
        ))}

        {/* Empty state */}
        {visibleSections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Add sections to your resume to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
