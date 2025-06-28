import React from 'react';
import { ArrowLeft, Newspaper, Calendar, Link as LinkIcon } from 'lucide-react';

const PressPage = ({ onBack }) => {
  const pressReleases = [
    {
      title: "Thinklytics Launches AI-Powered SAT Analytics Platform",
      date: "2024-11-01",
      summary: "Thinklytics announces the launch of its new AI-driven platform to help students prepare for the SAT with personalized analytics and study plans.",
      link: "#"
    },
    {
      title: "Thinklytics Reaches 15,000 Active Students Milestone",
      date: "2024-10-15",
      summary: "The company celebrates a major milestone, helping over 15,000 students improve their SAT scores.",
      link: "#"
    },
    {
      title: "EdTech Innovators: Thinklytics Featured in EdTech Magazine",
      date: "2024-09-20",
      summary: "EdTech Magazine highlights Thinklytics as a leader in personalized SAT preparation.",
      link: "#"
    }
  ];

  const mediaContacts = [
    {
      name: "Media Inquiries",
      email: "media@thinklytics.com",
      phone: "+1 (555) 123-4567"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Press & Media</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Latest
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> News</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Read our latest press releases, media coverage, and company announcements.
          </p>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Press Releases</h3>
          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(release.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{release.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{release.summary}</p>
                <a href={release.link} className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Read More
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Media Contact */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Media Contact</h3>
          {mediaContacts.map((contact, index) => (
            <div key={index} className="mb-4">
              <p className="text-lg font-medium">{contact.name}</p>
              <p className="opacity-90">Email: <a href={`mailto:${contact.email}`} className="underline hover:no-underline">{contact.email}</a></p>
              <p className="opacity-90">Phone: {contact.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PressPage; 