'use client';

import { Resume, PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';

interface ExecutiveTemplateProps {
  resume: Resume;
}

/**
 * ExecutiveTemplate - Professional layout for senior positions
 * Design principles:
 * - Elegant, sophisticated typography with refined spacing
 * - Subtle branding elements and professional color palette
 * - Clean hierarchy emphasizing leadership and achievements
 * - Premium feel with refined details and balanced whitespace
 * - Emphasis on impact and executive presence
 */
export function ExecutiveTemplate({ resume }: ExecutiveTemplateProps) {
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
      <div className="mb-10 pb-6 border-b border-gray-300">
        {/* Name with elegant typography */}
        {content.full_name && (
          <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            {content.full_name}
          </h1>
        )}
        
        {/* Contact information in refined layout */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
          {content.email && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span>{content.email}</span>
            </div>
          )}
          {content.phone && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span>{content.phone}</span>
            </div>
          )}
          {content.location && (
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <span>{content.location}</span>
            </div>
          )}
        </div>

        {/* Professional links */}
        {(content.website || content.linkedin || content.github) && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
            {content.website && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span className="truncate">{content.website}</span>
              </div>
            )}
            {content.linkedin && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span className="truncate">{content.linkedin}</span>
              </div>
            )}
            {content.github && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span className="truncate">{content.github}</span>
              </div>
            )}
          </div>
        )}

        {/* Executive summary with emphasis */}
        {content.summary && (
          <div className="mt-5 pt-5 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {content.summary}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderEducation = (items: Education[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            {/* Subtle accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-transparent"></div>
            
            <div className="pl-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: 'Georgia, serif' }}>
                    {item.degree} in {item.field}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{item.institution}</p>
                </div>
                <div className="text-right text-sm text-gray-600 ml-6">
                  <p className="font-medium">
                    {item.start_date} – {item.current ? 'Present' : item.end_date}
                  </p>
                  {item.gpa && (
                    <p className="text-xs text-gray-500 mt-1">GPA: {item.gpa}</p>
                  )}
                </div>
              </div>
              {item.achievements && item.achievements.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {item.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-gray-400 mt-1.5 text-xs">▪</span>
                      <span className="leading-relaxed">{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExperience = (items: Experience[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            {/* Subtle accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-transparent"></div>
            
            <div className="pl-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: 'Georgia, serif' }}>
                    {item.position}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    {item.company} · {item.location}
                  </p>
                </div>
                <p className="text-sm text-gray-600 ml-6 font-medium">
                  {item.start_date} – {item.current ? 'Present' : item.end_date}
                </p>
              </div>
              {item.description && (
                <p className="mt-3 text-sm text-gray-700 leading-relaxed italic">
                  {item.description}
                </p>
              )}
              {item.achievements && item.achievements.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {item.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-gray-400 mt-1.5 text-xs">▪</span>
                      <span className="leading-relaxed">{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = (items: Project[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            {/* Subtle accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-transparent"></div>
            
            <div className="pl-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-base flex-1" style={{ fontFamily: 'Georgia, serif' }}>
                  {item.name}
                </h3>
                {(item.start_date || item.end_date) && (
                  <p className="text-sm text-gray-600 ml-6 font-medium">
                    {item.start_date} {item.end_date && `– ${item.end_date}`}
                  </p>
                )}
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{item.description}</p>
              )}
              {item.technologies && item.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {(item.url || item.github) && (
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  {item.url && (
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className="truncate">{item.url}</span>
                    </div>
                  )}
                  {item.github && (
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className="truncate">{item.github}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = (items: Skill[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map((skill, idx) => (
          <div key={idx} className="relative pl-5">
            {/* Subtle accent marker */}
            <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-400"></div>
            
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {skill.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCertifications = (items: Certification[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.id} className="relative">
            {/* Subtle accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-transparent"></div>
            
            <div className="pl-5">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">{item.issuer}</p>
                </div>
                <p className="text-sm text-gray-600 ml-6 font-medium">{item.date}</p>
              </div>
              {item.credential_id && (
                <p className="text-xs text-gray-500 mt-2">Credential: {item.credential_id}</p>
              )}
              {item.url && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  <span className="truncate">{item.url}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = (items: Award[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.id} className="relative">
            {/* Subtle accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-transparent"></div>
            
            <div className="pl-5">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">{item.issuer}</p>
                </div>
                <p className="text-sm text-gray-600 ml-6 font-medium">{item.date}</p>
              </div>
              {item.description && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCustom = (content: CustomContent) => {
    if (!content.content) return null;
    return (
      <div className="relative pl-5">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-transparent"></div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
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
      {/* Header with personal info - elegant and refined */}
      {personalInfo && renderPersonalInfo(personalInfo)}

      {/* Single-column layout with sophisticated spacing */}
      <div className="space-y-10">
        {visibleSections.map((section) => (
          <div key={section.id} className="animate-fade-in">
            {/* Section header with subtle branding element */}
            <div className="mb-5 relative">
              <div className="flex items-center gap-3">
                {/* Subtle branding accent */}
                <div className="w-1 h-6 bg-gradient-to-b from-gray-600 to-gray-400 rounded-full"></div>
                <h2 
                  className="text-lg font-semibold text-gray-900 uppercase tracking-widest" 
                  style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.15em' }}
                >
                  {section.title}
                </h2>
              </div>
              {/* Refined underline */}
              <div className="mt-2 ml-4 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>
            
            {/* Section content */}
            {renderSectionContent(section)}
          </div>
        ))}

        {/* Empty state with refined styling */}
        {visibleSections.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block border border-gray-300 px-8 py-6 rounded">
              <p className="text-gray-500 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                Add sections to your resume to see them here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtle footer branding element */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex justify-center">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
