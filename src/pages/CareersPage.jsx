import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Heart, Zap, Shield, Target } from 'lucide-react';

const CareersPage = ({ onBack }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'product', name: 'Product' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'support', name: 'Support' }
  ];

  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Engineer",
      department: "engineering",
      location: "Tampa, FL (Hybrid)",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      description: "Build and scale our educational platform using React, Node.js, and PostgreSQL.",
      requirements: [
        "5+ years of full-stack development experience",
        "Expertise in React, Node.js, and PostgreSQL",
        "Experience with educational technology",
        "Strong problem-solving skills"
      ]
    },
    {
      id: 2,
      title: "Product Manager",
      department: "product",
      location: "Remote",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      description: "Lead product strategy and development for our SAT preparation platform.",
      requirements: [
        "3+ years of product management experience",
        "Background in education or edtech",
        "Strong analytical and communication skills",
        "Experience with user research and data analysis"
      ]
    },
    {
      id: 3,
      title: "Content Strategist",
      department: "marketing",
      location: "Tampa, FL",
      type: "Full-time",
      salary: "$70,000 - $90,000",
      description: "Create compelling content that helps students succeed on the SAT.",
      requirements: [
        "2+ years of content creation experience",
        "Knowledge of SAT/ACT testing",
        "Excellent writing and editing skills",
        "Experience with SEO and social media"
      ]
    },
    {
      id: 4,
      title: "Customer Success Manager",
      department: "support",
      location: "Remote",
      type: "Full-time",
      salary: "$60,000 - $80,000",
      description: "Help students and educators get the most out of our platform.",
      requirements: [
        "2+ years of customer success experience",
        "Background in education preferred",
        "Excellent communication skills",
        "Data-driven approach to problem solving"
      ]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision coverage for you and your family."
    },
    {
      icon: Zap,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and unlimited PTO."
    },
    {
      icon: Target,
      title: "Growth & Learning",
      description: "Professional development budget and learning opportunities."
    },
    {
      icon: Shield,
      title: "Security & Stability",
      description: "Competitive salary, equity options, and 401(k) matching."
    }
  ];

  const culture = [
    {
      title: "Student-First Mindset",
      description: "Everything we do is focused on helping students succeed."
    },
    {
      title: "Data-Driven Decisions",
      description: "We use analytics and insights to guide our product development."
    },
    {
      title: "Continuous Learning",
      description: "We believe in personal and professional growth for everyone."
    },
    {
      title: "Collaborative Environment",
      description: "Work with passionate people who share your commitment to education."
    }
  ];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === selectedDepartment);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Our Team</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Build the Future of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Education</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join our mission to democratize high-quality SAT preparation and help thousands of students 
            achieve their college dreams. We're looking for passionate individuals who want to make a difference.
          </p>
        </div>

        {/* Culture Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Culture</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {culture.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Benefits & Perks</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                  <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Open Positions</h3>
            <div className="flex space-x-2">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDepartment === dept.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 lg:flex-col lg:items-end">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium text-center">
                      Position Filled
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Requirements:</h5>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No positions available</h4>
              <p className="text-gray-600 dark:text-gray-300">
                We don't have any open positions in this department right now. 
                Check back later or send us your resume for future opportunities.
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Interested in joining our team?</h3>
          <p className="text-lg mb-6 opacity-90">
            While we don't have any open positions at the moment, we're always looking for talented individuals. 
            Send us your resume and we'll keep it on file for future opportunities.
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
            Send Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareersPage; 