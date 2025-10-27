'use client';

import { Resume, PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';

interface CreativeTemplateProps {
  resume: Resume;
}

/**
 * CreativeTemplate - Bold, colorful layout with unique asymmetric structure
 * Design principles:
 * - Vibrant color palette with gradients
 * - Asymmetric layout with visual interest
 * - Icons and visual elements throughout
 * - Creative use of shapes and backgrounds
 * - Bold typography with varied sizes
 */
export function CreativeTemplate({ resume }: CreativeTemplateProps) {
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
      <div className="relative mb-8 overflow-hidden">
        {/* Colorful background with geometric shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 opacity-90"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full -translate-y-32 translate-x-32 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full translate-y-24 -translate-x-24 opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10 p-8 text-white">
          {content.full_name && (
            <h1 className="text-5xl font-black mb-4 tracking-tight drop-shadow-lg">
              {content.full_name}
            </h1>
          )}
          
          {/* Contact info with icons */}
          <div className="flex flex-wrap gap-4 mb-4">
            {content.email && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">✉️</span>
                <span className="text-sm font-medium">{content.email}</span>
              </div>
            )}
            {content.phone && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">📱</span>
                <span className="text-sm font-medium">{content.phone}</span>
              </div>
            )}
            {content.location && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium">{content.location}</span>
              </div>
            )}
          </div>

          {/* Links with icons */}
          <div className="flex flex-wrap gap-3">
            {content.website && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">🌐</span>
                <span className="text-xs font-medium truncate max-w-[150px]">{content.website}</span>
              </div>
            )}
            {content.linkedin && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">💼</span>
                <span className="text-xs font-medium truncate max-w-[150px]">{content.linkedin}</span>
              </div>
            )}
            {content.github && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg">⚡</span>
                <span className="text-xs font-medium truncate max-w-[150px]">{content.github}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {content.summary && (
            <p className="mt-5 text-sm leading-relaxed bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              {content.summary}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderEducation = (items: Education[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-5">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="relative pl-6 border-l-4 border-gradient-to-b from-purple-500 to-pink-500"
            style={{ borderImage: 'linear-gradient(to bottom, rgb(168, 85, 247), rgb(236, 72, 153)) 1' }}
          >
            {/* Decorative circle */}
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white"></div>
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎓</span>
                  <h3 className="font-bold text-gray-900 text-base">{item.institution}</h3>
                </div>
                <p className="text-sm text-gray-700 font-semibold">
                  {item.degree} in {item.field}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                  <p className="text-xs font-bold text-purple-700">
                    {item.start_date} - {item.current ? 'Present' : item.end_date}
                  </p>
                </div>
                {item.gpa && (
                  <p className="text-xs text-gray-600 mt-1 font-semibold">GPA: {item.gpa}</p>
                )}
              </div>
            </div>
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1 text-xs">★</span>
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
      <div className="space-y-5">
        {items.map((item) => (
          <div 
            key={item.id}
            className="relative pl-6 border-l-4"
            style={{ borderImage: 'linear-gradient(to bottom, rgb(59, 130, 246), rgb(147, 51, 234)) 1' }}
          >
            {/* Decorative circle */}
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white"></div>
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💼</span>
                  <h3 className="font-bold text-gray-900 text-base">{item.position}</h3>
                </div>
                <p className="text-sm text-gray-700 font-semibold">
                  {item.company} • {item.location}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full ml-4">
                <p className="text-xs font-bold text-blue-700">
                  {item.start_date} - {item.current ? 'Present' : item.end_date}
                </p>
              </div>
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{item.description}</p>
            )}
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {item.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1 text-xs">★</span>
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
      <div className="space-y-5">
        {items.map((item) => (
          <div 
            key={item.id}
            className="relative pl-6 border-l-4"
            style={{ borderImage: 'linear-gradient(to bottom, rgb(34, 197, 94), rgb(59, 130, 246)) 1' }}
          >
            {/* Decorative circle */}
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-blue-500 border-2 border-white"></div>
            
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xl">🚀</span>
                <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
              </div>
              {(item.start_date || item.end_date) && (
                <div className="bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1 rounded-full ml-4">
                  <p className="text-xs font-bold text-green-700">
                    {item.start_date} {item.end_date && `- ${item.end_date}`}
                  </p>
                </div>
              )}
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-gray-700">{item.description}</p>
            )}
            {item.technologies && item.technologies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {(item.url || item.github) && (
              <div className="mt-3 flex gap-3 text-xs">
                {item.url && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <span>🔗</span>
                    <span className="truncate max-w-[200px]">{item.url}</span>
                  </div>
                )}
                {item.github && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <span>⚡</span>
                    <span className="truncate max-w-[200px]">{item.github}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = (items: Skill[]) => {
    if (!items || items.length === 0) return null;
    
    // Color schemes for different skill categories
    const colorSchemes = [
      'from-red-400 to-orange-400',
      'from-blue-400 to-cyan-400',
      'from-purple-400 to-pink-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-amber-400',
      'from-indigo-400 to-violet-400',
    ];

    return (
      <div className="space-y-5">
        {items.map((skill, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                {skill.category}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skill.items.map((item, itemIdx) => (
                <span
                  key={itemIdx}
                  className={`px-4 py-2 text-sm font-bold bg-gradient-to-r ${colorSchemes[idx % colorSchemes.length]} text-white rounded-lg shadow-md transform hover:scale-105 transition-transform`}
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
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className="relative pl-6 border-l-4"
            style={{ borderImage: 'linear-gradient(to bottom, rgb(251, 146, 60), rgb(251, 191, 36)) 1' }}
          >
            {/* Decorative circle */}
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 border-2 border-white"></div>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏆</span>
                  <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-700 font-medium">{item.issuer}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 px-3 py-1 rounded-full ml-4">
                <p className="text-xs font-bold text-orange-700">{item.date}</p>
              </div>
            </div>
            {item.credential_id && (
              <p className="text-xs text-gray-600 mt-2 bg-gray-50 px-2 py-1 rounded inline-block">
                ID: {item.credential_id}
              </p>
            )}
            {item.url && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                <span>🔗</span>
                <span className="truncate">{item.url}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAwards = (items: Award[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className="relative pl-6 border-l-4"
            style={{ borderImage: 'linear-gradient(to bottom, rgb(236, 72, 153), rgb(239, 68, 68)) 1' }}
          >
            {/* Decorative circle */}
            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-red-500 border-2 border-white"></div>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🌟</span>
                  <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-700 font-medium">{item.issuer}</p>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-red-100 px-3 py-1 rounded-full ml-4">
                <p className="text-xs font-bold text-pink-700">{item.date}</p>
              </div>
            </div>
            {item.description && (
              <p className="text-sm text-gray-700 mt-2">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCustom = (content: CustomContent) => {
    if (!content.content) return null;
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-l-4 border-purple-500">
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
      {/* Colorful header with personal info */}
      {personalInfo && renderPersonalInfo(personalInfo)}

      {/* Asymmetric layout - alternating section styles */}
      <div className="space-y-8">
        {visibleSections.map((section, index) => {
          // Alternate between different visual styles for asymmetry
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={section.id} 
              className={`animate-fade-in ${isEven ? '' : 'ml-4'}`}
            >
              {/* Section header with colorful gradient and icon */}
              <div className="mb-4 relative">
                <div className={`inline-block ${isEven ? '' : 'ml-auto'}`}>
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 uppercase tracking-wide inline-block">
                    {section.title}
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-full mt-1"></div>
                </div>
              </div>
              
              {/* Section content */}
              <div className={isEven ? '' : 'mr-4'}>
                {renderSectionContent(section)}
              </div>
            </div>
          );
        })}

        {/* Empty state with colorful design */}
        {visibleSections.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-8 rounded-2xl">
              <p className="text-gray-600 font-bold">
                ✨ Add sections to your resume to see them here ✨
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
