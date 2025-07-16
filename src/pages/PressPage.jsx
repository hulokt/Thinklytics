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
    <div className="min-h-screen homepage-bg transition-colors duration-300">
      {/* Header */}
      <div className="homepage-card shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg homepage-card hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 homepage-text-primary" />
            </button>
            <h1 className="text-3xl font-bold homepage-text-primary">Press & Media</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl homepage-feature-icon mb-6">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Latest
            <span className="homepage-gradient-text"> News</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Read our latest press releases, media coverage, and company announcements.
          </p>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8">Press Releases</h3>
          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex items-center space-x-4 mb-2">
                  <Calendar className="w-5 h-5 text-[var(--brand-60)]" />
                  <span className="homepage-text-muted text-sm">{new Date(release.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xl font-semibold homepage-text-primary mb-2">{release.title}</h4>
                <p className="homepage-text-secondary mb-4">{release.summary}</p>
                <a href={release.link} className="inline-flex items-center blue-gradient-text hover:underline">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Read More
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Media Contact */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white text-center">
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