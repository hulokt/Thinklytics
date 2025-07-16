import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Code, Briefcase, Heart, Award } from 'lucide-react';

const CareersPage = ({ onBack }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = [
    { id: 'all', name: 'All Positions', count: 8 },
    { id: 'engineering', name: 'Engineering', count: 4 },
    { id: 'education', name: 'Education', count: 2 },
    { id: 'marketing', name: 'Marketing', count: 1 },
    { id: 'design', name: 'Design', count: 1 }
  ];

  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'engineering',
      location: 'Tampa, FL / Remote',
      type: 'Full-time',
      salary: '$120,000 - $160,000',
      description: 'Join our engineering team to build the next generation of educational technology.',
      requirements: ['5+ years of experience', 'React/Node.js expertise', 'Database design skills'],
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Education Content Specialist',
      department: 'education',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      description: 'Create and curate high-quality SAT preparation content for our platform.',
      requirements: ['Masters in Education', 'SAT expertise', 'Content creation experience'],
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'Frontend Developer',
      department: 'engineering',
      location: 'Tampa, FL',
      type: 'Full-time',
      salary: '$80,000 - $110,000',
      description: 'Build beautiful, responsive user interfaces for our learning platform.',
      requirements: ['React expertise', 'UI/UX sensibility', '3+ years experience'],
      posted: '3 days ago'
    },
    {
      id: 4,
      title: 'UX/UI Designer',
      department: 'design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$75,000 - $95,000',
      description: 'Design intuitive and engaging user experiences for students and educators.',
      requirements: ['Portfolio required', 'Figma/Sketch expertise', 'User research experience'],
      posted: '5 days ago'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      department: 'engineering',
      location: 'Tampa, FL / Remote',
      type: 'Full-time',
      salary: '$100,000 - $130,000',
      description: 'Manage our cloud infrastructure and deployment pipelines.',
      requirements: ['AWS/Azure experience', 'CI/CD expertise', 'Kubernetes knowledge'],
      posted: '1 week ago'
    },
    {
      id: 6,
      title: 'Data Scientist',
      department: 'engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$110,000 - $140,000',
      description: 'Analyze student data to improve learning outcomes and platform effectiveness.',
      requirements: ['Python/R expertise', 'ML/AI experience', 'Education data preferred'],
      posted: '4 days ago'
    },
    {
      id: 7,
      title: 'Marketing Manager',
      department: 'marketing',
      location: 'Tampa, FL',
      type: 'Full-time',
      salary: '$65,000 - $85,000',
      description: 'Lead marketing campaigns and grow our student community.',
      requirements: ['Digital marketing experience', 'Analytics skills', 'EdTech background preferred'],
      posted: '6 days ago'
    },
    {
      id: 8,
      title: 'Curriculum Developer',
      department: 'education',
      location: 'Remote',
      type: 'Contract',
      salary: '$50 - $80 per hour',
      description: 'Develop comprehensive SAT prep curricula and learning materials.',
      requirements: ['Educational design experience', 'SAT subject expertise', 'Assessment creation'],
      posted: '2 weeks ago'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, mental health support, and wellness programs'
    },
    {
      icon: Code,
      title: 'Growth & Learning',
      description: 'Professional development budget, conference attendance, and learning opportunities'
    },
    {
      icon: Users,
      title: 'Work-Life Balance',
      description: 'Flexible hours, remote work options, and unlimited PTO policy'
    },
    {
      icon: Award,
      title: 'Equity & Bonuses',
      description: 'Stock options, performance bonuses, and profit sharing for all employees'
    }
  ];

  const values = [
    {
      title: 'Student Success First',
      description: 'Every decision we make is driven by what\'s best for student learning and achievement.'
    },
    {
      title: 'Innovation & Excellence',
      description: 'We push the boundaries of educational technology to create exceptional learning experiences.'
    },
    {
      title: 'Diversity & Inclusion',
      description: 'We celebrate diverse perspectives and create an inclusive environment for all team members.'
    },
    {
      title: 'Transparency & Trust',
      description: 'We operate with openness, honesty, and build trust through our actions and communication.'
    }
  ];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === selectedDepartment);

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
            <h1 className="text-3xl font-bold homepage-text-primary">Careers</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Join Our
            <span className="homepage-gradient-text"> Mission</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Help us revolutionize SAT preparation and empower students to achieve their college dreams. 
            Build innovative technology that makes a real difference in education.
          </p>
        </div>

        {/* Company Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Our Values</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <h4 className="text-lg font-semibold homepage-text-primary mb-3">{value.title}</h4>
                <p className="homepage-text-secondary">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Why Work With Us?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center homepage-card p-6 rounded-xl shadow-lg homepage-hover-glow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl homepage-feature-icon mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold homepage-text-primary mb-3">{benefit.title}</h4>
                <p className="homepage-text-secondary text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Open Positions</h3>
          
          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDepartment === dept.id
                    ? 'homepage-cta-primary text-white'
                    : 'homepage-card homepage-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {dept.name} ({dept.count})
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-semibold homepage-text-primary mb-2">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm homepage-text-secondary">
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
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-sm homepage-text-secondary">Posted {job.posted}</span>
                    <button className="homepage-cta-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-xl transition-all duration-200">
                      Apply Now
                    </button>
                  </div>
                </div>
                
                <p className="homepage-text-secondary mb-4">{job.description}</p>
                
                <div>
                  <h5 className="font-semibold homepage-text-primary mb-2">Key Requirements:</h5>
                  <ul className="space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="homepage-text-secondary text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="mb-16 homepage-card rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Our Hiring Process</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">1</div>
              <h4 className="font-semibold homepage-text-primary mb-2">Application</h4>
              <p className="homepage-text-secondary text-sm">Submit your resume and cover letter</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">2</div>
              <h4 className="font-semibold homepage-text-primary mb-2">Screening</h4>
              <p className="homepage-text-secondary text-sm">Initial phone/video interview</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">3</div>
              <h4 className="font-semibold homepage-text-primary mb-2">Technical</h4>
              <p className="homepage-text-secondary text-sm">Skills assessment and portfolio review</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">4</div>
              <h4 className="font-semibold homepage-text-primary mb-2">Final Interview</h4>
              <p className="homepage-text-secondary text-sm">Meet the team and culture fit</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join our team and help transform the future of SAT preparation and student success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[var(--brand-60)] hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
              View All Positions
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-medium transition-colors">
              Learn About Our Culture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage; 