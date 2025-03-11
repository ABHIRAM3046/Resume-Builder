import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Layout, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Resume Builder</h1>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Add Resume Data Card */}
          <Link
            to="/resume-form"
            className="relative group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-indigo-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-900">Add Resume Data</h2>
              </div>
              <p className="mt-4 text-gray-600">
                Enter or update your personal information, education, experience, projects, and skills.
                Tag them with relevant domains for better organization.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>

          {/* Choose Template Card */}
          <Link
            to="/templates"
            className="relative group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <Layout className="h-8 w-8 text-indigo-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-900">Choose Template</h2>
              </div>
              <p className="mt-4 text-gray-600">
                Select from our professionally designed templates and customize your resume for specific
                domains. Preview and download your perfect resume.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>
        </div>
      </main>
    </div>
  );
}