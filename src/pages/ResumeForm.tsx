import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PersonalInfo, Education, Experience, Project, Skill } from '../types';

export default function ResumeForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('personal');
  const [loading, setLoading] = React.useState(false);

  const [personalInfo, setPersonalInfo] = React.useState<Partial<PersonalInfo>>({});
  const [education, setEducation] = React.useState<Partial<Education>[]>([{}]);
  const [experience, setExperience] = React.useState<Partial<Experience>[]>([{}]);
  const [projects, setProjects] = React.useState<Partial<Project>[]>([{}]);
  const [skills, setSkills] = React.useState<Partial<Skill>[]>([{}]);

  // Fetch existing data when component mounts
  React.useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch personal info
      const { data: personalData, error: personalError } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!personalError && personalData) {
        setPersonalInfo(personalData);
      }

      // Fetch education
      const { data: educationData } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (educationData?.length) setEducation(educationData);

      // Fetch experience
      const { data: experienceData } = await supabase
        .from('experience')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (experienceData?.length) setExperience(experienceData);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (projectsData?.length) setProjects(projectsData);

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (skillsData?.length) setSkills(skillsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Save personal info
      if (personalInfo.full_name && personalInfo.email) {
        const { error: personalError } = await supabase
          .from('personal_info')
          .upsert({
            ...personalInfo,
            user_id: user.id,
            updated_at: new Date().toISOString()
          })
          .select();
        if (personalError) throw personalError;
      }

      // Save education entries
      const educationPromises = education
        .filter(edu => edu.institution && edu.degree && edu.field_of_study)
        .map(edu => 
          supabase
            .from('education')
            .upsert({
              ...edu,
              user_id: user.id,
              updated_at: new Date().toISOString()
            })
            .select()
        );

      // Save experience entries
      const experiencePromises = experience
        .filter(exp => exp.company && exp.position && exp.description)
        .map(exp =>
          supabase
            .from('experience')
            .upsert({
              ...exp,
              user_id: user.id,
              updated_at: new Date().toISOString(),
              domain: exp.domain || []
            })
            .select()
        );

      // Save projects
      const projectPromises = projects
        .filter(proj => proj.title && proj.description)
        .map(proj =>
          supabase
            .from('projects')
            .upsert({
              ...proj,
              user_id: user.id,
              updated_at: new Date().toISOString(),
              technologies: proj.technologies || [],
              domain: proj.domain || []
            })
            .select()
        );

      // Save skills
      const skillPromises = skills
        .filter(skill => skill.name && skill.level)
        .map(skill =>
          supabase
            .from('skills')
            .upsert({
              ...skill,
              user_id: user.id,
              updated_at: new Date().toISOString(),
              domain: skill.domain || []
            })
            .select()
        );

      await Promise.all([
        ...educationPromises,
        ...experiencePromises,
        ...projectPromises,
        ...skillPromises
      ]);

      alert('Resume data saved successfully!');
      navigate('/templates');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' }
  ];

  const renderPersonalInfoForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={personalInfo.full_name || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={personalInfo.email || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={personalInfo.phone || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={personalInfo.address || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input
            type="url"
            value={personalInfo.linkedin || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
          <input
            type="url"
            value={personalInfo.github || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
          <input
            type="url"
            value={personalInfo.portfolio || ''}
            onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderEducationForm = () => (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
          {education.length > 1 && (
            <button
              onClick={() => setEducation(education.filter((_, i) => i !== index))}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={edu.institution || ''}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = { ...edu, institution: e.target.value };
                  setEducation(newEducation);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input
                type="text"
                value={edu.degree || ''}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = { ...edu, degree: e.target.value };
                  setEducation(newEducation);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field of Study</label>
              <input
                type="text"
                value={edu.field_of_study || ''}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = { ...edu, field_of_study: e.target.value };
                  setEducation(newEducation);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GPA</label>
              <input
                type="number"
                step="0.01"
                value={edu.gpa || ''}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = { ...edu, gpa: parseFloat(e.target.value) };
                  setEducation(newEducation);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={edu.start_date || ''}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = { ...edu, start_date: e.target.value };
                  setEducation(newEducation);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={edu.end_date || ''}
                onChange={(e) => {
                  const newEducation = [...education];
                  newEducation[index] = { ...edu, end_date: e.target.value };
                  setEducation(newEducation);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setEducation([...education, {}])}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </button>
    </div>
  );

  const renderExperienceForm = () => (
    <div className="space-y-6">
      {experience.map((exp, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
          {experience.length > 1 && (
            <button
              onClick={() => setExperience(experience.filter((_, i) => i !== index))}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => {
                  const newExperience = [...experience];
                  newExperience[index] = { ...exp, company: e.target.value };
                  setExperience(newExperience);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={exp.position || ''}
                onChange={(e) => {
                  const newExperience = [...experience];
                  newExperience[index] = { ...exp, position: e.target.value };
                  setExperience(newExperience);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={exp.start_date || ''}
                onChange={(e) => {
                  const newExperience = [...experience];
                  newExperience[index] = { ...exp, start_date: e.target.value };
                  setExperience(newExperience);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={exp.end_date || ''}
                onChange={(e) => {
                  const newExperience = [...experience];
                  newExperience[index] = { ...exp, end_date: e.target.value };
                  setExperience(newExperience);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                value={exp.description || ''}
                onChange={(e) => {
                  const newExperience = [...experience];
                  newExperience[index] = { ...exp, description: e.target.value };
                  setExperience(newExperience);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Domains (comma-separated)</label>
              <input
                type="text"
                value={exp.domain?.join(', ') || ''}
                onChange={(e) => {
                  const newExperience = [...experience];
                  newExperience[index] = {
                    ...exp,
                    domain: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                  };
                  setExperience(newExperience);
                }}
                placeholder="e.g., Web Development, Frontend, React"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setExperience([...experience, {}])}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </button>
    </div>
  );

  const renderProjectsForm = () => (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
          {projects.length > 1 && (
            <button
              onClick={() => setProjects(projects.filter((_, i) => i !== index))}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={project.title || ''}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = { ...project, title: e.target.value };
                  setProjects(newProjects);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={4}
                value={project.description || ''}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = { ...project, description: e.target.value };
                  setProjects(newProjects);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
              <input
                type="url"
                value={project.github_url || ''}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = { ...project, github_url: e.target.value };
                  setProjects(newProjects);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Live URL</label>
              <input
                type="url"
                value={project.live_url || ''}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = { ...project, live_url: e.target.value };
                  setProjects(newProjects);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
              <input
                type="text"
                value={project.technologies?.join(', ') || ''}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = {
                    ...project,
                    technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  };
                  setProjects(newProjects);
                }}
                placeholder="e.g., React, Node.js, TypeScript"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Domains (comma-separated)</label>
              <input
                type="text"
                value={project.domain?.join(', ') || ''}
                onChange={(e) => {
                  const newProjects = [...projects];
                  newProjects[index] = {
                    ...project,
                    domain: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                  };
                  setProjects(newProjects);
                }}
                placeholder="e.g., Web Development, Frontend, Mobile"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setProjects([...projects, {}])}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </button>
    </div>
  );

  const renderSkillsForm = () => (
    <div className="space-y-6">
      {skills.map((skill, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
          {skills.length > 1 && (
            <button
              onClick={() => setSkills(skills.filter((_, i) => i !== index))}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Skill Name</label>
              <input
                type="text"
                value={skill.name || ''}
                onChange={(e) => {
                  const newSkills = [...skills];
                  newSkills[index] = { ...skill, name: e.target.value };
                  setSkills(newSkills);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                value={skill.level || ''}
                onChange={(e) => {
                  const newSkills = [...skills];
                  newSkills[index] = { ...skill, level: e.target.value as any };
                  setSkills(newSkills);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Domains (comma-separated)</label>
              <input
                type="text"
                value={skill.domain?.join(', ') || ''}
                onChange={(e) => {
                  const newSkills = [...skills];
                  newSkills[index] = {
                    ...skill,
                    domain: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                  };
                  setSkills(newSkills);
                }}
                placeholder="e.g., Frontend, Backend, DevOps"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSkills([...skills, {}])}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </button>
    </div>
  );

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
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'personal' && renderPersonalInfoForm()}
            {activeTab === 'education' && renderEducationForm()}
            {activeTab === 'experience' && renderExperienceForm()}
            {activeTab === 'projects' && renderProjectsForm()}
            {activeTab === 'skills' && renderSkillsForm()}
          </div>
        </div>
      </main>
    </div>
  );
}