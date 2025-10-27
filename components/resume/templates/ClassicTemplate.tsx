'use client';

import { Resume, PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';

interface ClassicTemplateProps {
  resume: Resume;
}

export function ClassicTemplate({ resume }: ClassicTemplateProps) {
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
      <div className="mb-6 pb-4 border-b-2 border-gray-800 text-center">
        {content.full_name && (
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-wide">
            {content.full_name}
          </h1>
        )}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-gray-700">
          {content.email && <span>{content.email}</span>}
          {content.phone && <span>•</span>}
          {content.phone && <span>{content.phone}</span>}
          {content.location && <span>•</span>}
          {content.location && <span>{content.location}</span>}
        </div>
        {(content.website || content.linkedin || content.github) && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-gray-700 mt-1">
            {content.website && <span className="truncate">{content.website}</span>}
            {content.linkedin && content.website && <span>•</span>}
            {content.linkedin && <span className="truncate">{content.linkedin}</span>}
            {content.github && (content.website || content.linkedin) && <span>•</span>}
            {content.github && <span className="truncate">{content.github}</span>}
          </div>
        )}
        {content.summary && (
          <p className="mt-3 text-sm text-gray-800 leading-relaxed text-left font-serif">
            {content.summary}
          </p>
        )}
      </div>
    );
  };

  const renderEducation = (items: Education[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-serif font-bold text-gray-900">{item.institution}</h3>
                <p className="text-sm text-gray-800 italic">
                  {item.degree} in {item.field}
                </p>
              </div>
              <div className="text-right text-sm text-gray-700 ml-4">
                <p>
                  {item.start_date} - {item.current ? 'Present' : item.end_date}
                </p>
                {item.gpa && <p>GPA: {item.gpa}</p>}
              </div>
            </div>
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-gray-800 list-disc list-inside">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
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
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-serif font-bold text-gray-900">{item.position}</h3>
                <p className="text-sm text-gray-800 italic">{item.company}, {item.location}</p>
              </div>
              <p className="text-sm text-gray-700 ml-4">
                {item.start_date} - {item.current ? 'Present' : item.end_date}
              </p>
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-gray-800">{item.description}</p>
            )}
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-gray-800 list-disc list-inside">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
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
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif font-bold text-gray-900 flex-1">{item.name}</h3>
              {(item.start_date || item.end_date) && (
                <p className="text-sm text-gray-700 ml-4">
                  {item.start_date} {item.end_date && `- ${item.end_date}`}
                </p>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-gray-800">{item.description}</p>
            )}
            {item.technologies && item.technologies.length > 0 && (
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Technologies:</span> {item.technologies.join(', ')}
              </p>
            )}
            {(item.url || item.github) && (
              <div className="mt-1 text-xs text-gray-600">
                {item.url && <span className="truncate block">URL: {item.url}</span>}
                {item.github && <span className="truncate block">GitHub: {item.github}</span>}
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
      <div className="space-y-2">
        {items.map((skill, idx) => (
          <div key={idx}>
            <span className="font-serif font-bold text-gray-900 text-sm">{skill.category}:</span>{' '}
            <span className="text-sm text-gray-800">{skill.items.join(', ')}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCertifications = (items: Certification[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-serif font-bold text-gray-900 text-sm">{item.name}</h3>
                <p className="text-sm text-gray-800 italic">{item.issuer}</p>
              </div>
              <p className="text-sm text-gray-700 ml-4">{item.date}</p>
            </div>
            {item.credential_id && (
              <p className="text-xs text-gray-600 mt-1">Credential ID: {item.credential_id}</p>
            )}
            {item.url && (
              <p className="text-xs text-gray-600 mt-1 truncate">{item.url}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = (items: Award[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-serif font-bold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-800 italic">{item.issuer}</p>
              </div>
              <p className="text-sm text-gray-700 ml-4">{item.date}</p>
            </div>
            {item.description && (
              <p className="text-sm text-gray-800 mt-1">{item.description}</p>
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
        <p className="text-sm text-gray-800 whitespace-pre-wrap font-serif">{content.content}</p>
      </div>
    );
  };

  return (
    <div 
      className="min-h-full font-serif"
      style={{
        fontFamily: styling.font_family,
        fontSize: `${styling.font_size_body}pt`,
        lineHeight: styling.line_height,
        color: styling.color_text,
      }}
    >
      {/* Header with Personal Info */}
      {personalInfo && renderPersonalInfo(personalInfo)}

      {/* Single-column layout for all sections */}
      <div className="space-y-5">
        {visibleSections.map((section) => (
          <div key={section.id} className="animate-fade-in">
            <div className="mb-3">
              <h2 className="text-base font-serif font-bold text-gray-900 uppercase tracking-wider border-b border-gray-800 pb-1">
                {section.title}
              </h2>
            </div>
            {renderSectionContent(section)}
          </div>
        ))}

        {/* Empty state */}
        {visibleSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-sans">
              Add sections to your resume to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
