import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import type { PersonalInfo, Education, Experience, Project, Skill } from '../types';

const templates = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean and contemporary design with a focus on readability',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Stand out with a unique layout perfect for creative roles',
    image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'minimal',
    name: 'Minimal Classic',
    description: 'Traditional format with a modern minimal twist',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300&h=400'
  }
];

const domains = [
  'Software Development',
  'Data Science',
  'Web Development',
  'UI/UX Design',
  'Product Management',
  'DevOps',
  'Blockchain',
  'Artificial Intelligence'
];

export default function TemplateSelection() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [selectedDomain, setSelectedDomain] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resumeData, setResumeData] = React.useState<{
    personalInfo: PersonalInfo | null;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    skills: Skill[];
  } | null>(null);

  React.useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const [
        { data: personalInfo },
        { data: education },
        { data: experience },
        { data: projects },
        { data: skills }
      ] = await Promise.all([
        supabase
          .from('personal_info')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('education')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('experience')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('skills')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
      ]);

      setResumeData({
        personalInfo: personalInfo || null,
        education: education || [],
        experience: experience || [],
        projects: projects || [],
        skills: skills || []
      });
    } catch (error) {
      console.error('Error fetching resume data:', error);
      alert('Error loading resume data. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const generatePDF = async () => {
    if (!resumeData?.personalInfo) {
      alert('Please add your personal information first');
      return;
    }

    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;
      const lineHeight = 7;
      const sectionSpacing = 10;

      // Filter data based on selected domain (case-insensitive)
      const domainExperience = resumeData.experience.filter(exp => 
        exp.domain?.some(d => d.toLowerCase() === selectedDomain.toLowerCase())
      );
      const domainProjects = resumeData.projects.filter(proj => 
        proj.domain?.some(d => d.toLowerCase() === selectedDomain.toLowerCase())
      );
      const domainSkills = resumeData.skills.filter(skill => 
        skill.domain?.some(d => d.toLowerCase() === selectedDomain.toLowerCase())
      );

      // Log filtered data for debugging
      console.log('Selected Domain:', selectedDomain);
      console.log('Filtered Experience:', domainExperience);
      console.log('Filtered Projects:', domainProjects);
      console.log('Filtered Skills:', domainSkills);

      // Header with personal info
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const nameWidth = doc.getTextWidth(resumeData.personalInfo.full_name);
      doc.text(resumeData.personalInfo.full_name, (pageWidth - nameWidth) / 2, yPos);
      yPos += lineHeight * 2;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [
        resumeData.personalInfo.email,
        resumeData.personalInfo.phone,
        resumeData.personalInfo.address,
        resumeData.personalInfo.linkedin && `LinkedIn: ${resumeData.personalInfo.linkedin}`,
        resumeData.personalInfo.github && `GitHub: ${resumeData.personalInfo.github}`,
        resumeData.personalInfo.portfolio && `Portfolio: ${resumeData.personalInfo.portfolio}`
      ].filter(Boolean);

      const contactText = contactInfo.join(' | ');
      const contactLines = doc.splitTextToSize(contactText, contentWidth);
      doc.text(contactLines, margin, yPos);
      yPos += (lineHeight * contactLines.length) + sectionSpacing;

      // Experience Section
      if (domainExperience.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
        yPos += lineHeight + 2;
        doc.setFontSize(11);

        for (const exp of domainExperience) {
          // Check if we need a new page
          if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
          }

          doc.setFont('helvetica', 'bold');
          doc.text(exp.position, margin, yPos);
          
          doc.setFont('helvetica', 'normal');
          const dateText = `${formatDate(exp.start_date)} - ${exp.end_date ? formatDate(exp.end_date) : 'Present'}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, yPos);
          
          yPos += lineHeight;
          
          doc.setFont('helvetica', 'italic');
          doc.text(exp.company, margin, yPos);
          yPos += lineHeight;

          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(exp.description, contentWidth);
          doc.text(descLines, margin, yPos);
          yPos += (lineHeight * descLines.length) + sectionSpacing;
        }
      }

      // Education Section
      if (resumeData.education.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', margin, yPos);
        yPos += lineHeight + 2;
        doc.setFontSize(11);

        for (const edu of resumeData.education) {
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree, margin, yPos);
          
          doc.setFont('helvetica', 'normal');
          const dateText = `${formatDate(edu.start_date)} - ${edu.end_date ? formatDate(edu.end_date) : 'Present'}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, yPos);
          
          yPos += lineHeight;
          
          doc.setFont('helvetica', 'italic');
          const institutionText = `${edu.institution}, ${edu.field_of_study}`;
          doc.text(institutionText, margin, yPos);
          yPos += lineHeight;

          if (edu.gpa) {
            doc.setFont('helvetica', 'normal');
            doc.text(`GPA: ${edu.gpa}`, margin, yPos);
            yPos += lineHeight;
          }

          yPos += sectionSpacing / 2;
        }
        yPos += sectionSpacing / 2;
      }

      // Projects Section
      if (domainProjects.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECTS', margin, yPos);
        yPos += lineHeight + 2;
        doc.setFontSize(11);

        for (const proj of domainProjects) {
          doc.setFont('helvetica', 'bold');
          doc.text(proj.title, margin, yPos);
          yPos += lineHeight;

          if (proj.technologies?.length > 0) {
            doc.setFont('helvetica', 'italic');
            const techText = `Technologies: ${proj.technologies.join(', ')}`;
            const techLines = doc.splitTextToSize(techText, contentWidth);
            doc.text(techLines, margin, yPos);
            yPos += lineHeight * techLines.length;
          }

          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(proj.description, contentWidth);
          doc.text(descLines, margin, yPos);
          yPos += (lineHeight * descLines.length);

          if (proj.github_url || proj.live_url) {
            yPos += lineHeight / 2;
            const links = [
              proj.github_url && `GitHub: ${proj.github_url}`,
              proj.live_url && `Live: ${proj.live_url}`
            ].filter(Boolean);
            doc.setFont('helvetica', 'italic');
            doc.text(links.join(' | '), margin, yPos);
            yPos += lineHeight;
          }

          yPos += sectionSpacing;
        }
      }

      // Skills Section
      if (domainSkills.length > 0) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', margin, yPos);
        yPos += lineHeight + 2;
        doc.setFontSize(11);

        const skillsByLevel = domainSkills.reduce((acc, skill) => {
          if (!acc[skill.level]) acc[skill.level] = [];
          acc[skill.level].push(skill.name);
          return acc;
        }, {} as Record<string, string[]>);

        const levels = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
        for (const level of levels) {
          if (skillsByLevel[level]) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${level}:`, margin, yPos);
            yPos += lineHeight;
            
            doc.setFont('helvetica', 'normal');
            const skillText = skillsByLevel[level].join(', ');
            const skillLines = doc.splitTextToSize(skillText, contentWidth - 10);
            doc.text(skillLines, margin + 10, yPos);
            yPos += (lineHeight * skillLines.length) + (lineHeight / 2);
          }
        }
      }

      // Save the PDF
      const fileName = `${resumeData.personalInfo.full_name.replace(/\s+/g, '_')}_${selectedDomain.replace(/\s+/g, '_')}_Resume.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Error generating resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = () => {
    if (!selectedTemplate || !selectedDomain) {
      alert('Please select both a template and domain');
      return;
    }
    generatePDF();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={handleGenerateResume}
              disabled={!selectedTemplate || !selectedDomain || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate Resume
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!resumeData?.personalInfo && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please add your personal information first.{' '}
                  <button
                    onClick={() => navigate('/resume-form')}
                    className="font-medium underline text-yellow-700 hover:text-yellow-600"
                  >
                    Go to Resume Form
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {/* Domain Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Domain</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {domains.map(domain => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`
                    p-4 rounded-lg text-left transition-all
                    ${selectedDomain === domain
                      ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-200'
                    }
                  `}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`
                    group relative rounded-lg overflow-hidden transition-all
                    ${selectedTemplate === template.id
                      ? 'ring-2 ring-indigo-500 ring-offset-2'
                      : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'
                    }
                  `}
                >
                  <div className="aspect-w-3 aspect-h-4">
                    <img
                      src={template.image}
                      alt={template.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-200">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}