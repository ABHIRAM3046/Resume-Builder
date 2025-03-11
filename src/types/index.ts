export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface PersonalInfo {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa?: number;
}

export interface Experience {
  id: string;
  user_id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  domain: string[];
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  technologies: string[];
  domain: string[];
  github_url?: string;
  live_url?: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  domain: string[];
}