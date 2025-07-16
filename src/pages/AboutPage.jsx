import React from 'react';
import { ArrowLeft, Users, Target, Award, TrendingUp, BookOpen, Zap, Shield } from 'lucide-react';
import logoImage from "/logo.png";

const AboutPage = ({ onBack }) => {
  const stats = [
    { icon: Users, value: "15,000+", label: "Active Students" },
    { icon: BookOpen, value: "50,000+", label: "Questions Analyzed" },
    { icon: Award, value: "89%", label: "Average Improvement" },
    { icon: TrendingUp, value: "1400+", label: "Average Score Increase" }
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Founder & CEO",
      bio: "Former SAT instructor with 15+ years experience. PhD in Education from Stanford.",
      image: logoImage
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      bio: "Tech leader with expertise in educational technology and data analytics.",
      image: logoImage
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Content",
      bio: "Curriculum specialist with deep knowledge of SAT test structure and strategies.",
      image: logoImage
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Student-First Approach",
      description: "Every feature is designed with student success in mind, backed by educational research."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging cutting-edge technology to provide personalized learning experiences."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data is protected with enterprise-grade security and privacy measures."
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
            <h1 className="text-3xl font-bold homepage-text-primary">About Thinklytics</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Empowering Students to Achieve Their
            <span className="homepage-gradient-text"> SAT Goals</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Thinklytics was born from a simple belief: every student deserves access to intelligent, 
            personalized SAT preparation that adapts to their unique learning style and goals.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl homepage-feature-icon mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold homepage-text-primary mb-2">{stat.value}</div>
              <div className="text-sm homepage-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="homepage-card rounded-2xl shadow-xl p-8 mb-16 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Our Mission</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg homepage-text-secondary leading-relaxed mb-6">
                We're on a mission to democratize high-quality SAT preparation by combining 
                advanced analytics with proven educational strategies. Our platform helps students 
                understand their strengths and weaknesses, track their progress, and develop 
                personalized study plans that maximize their potential.
              </p>
              <p className="text-lg homepage-text-secondary leading-relaxed">
                By leveraging data-driven insights and adaptive learning technology, we're helping 
                thousands of students achieve their college dreams and unlock new opportunities.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                <p className="homepage-text-secondary">Personalized learning paths based on individual performance</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                <p className="homepage-text-secondary">Real-time analytics and progress tracking</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                <p className="homepage-text-secondary">Expert-curated content and strategies</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                <p className="homepage-text-secondary">Community support and peer learning</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Our Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg homepage-feature-icon mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold homepage-text-primary mb-3">{value.title}</h4>
                <p className="homepage-text-secondary">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Our Team</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg text-center homepage-hover-glow">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-xl font-semibold homepage-text-primary mb-2">{member.name}</h4>
                <p className="blue-gradient-text font-medium mb-3">{member.role}</p>
                <p className="homepage-text-secondary text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Our Story</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg leading-relaxed mb-6">
                Thinklytics began in 2020 when our founder, Dr. Sarah Chen, noticed that many of her 
                students were struggling with traditional SAT prep methods. They needed more than just 
                practice tests – they needed intelligent insights into their learning patterns.
              </p>
              <p className="text-lg leading-relaxed">
                What started as a simple tracking tool has grown into a comprehensive platform that 
                has helped over 15,000 students improve their SAT scores by an average of 1400+ points.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span>2020 - Founded with a mission to democratize SAT prep</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span>2021 - Launched first AI-powered analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span>2022 - Reached 10,000 active students</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span>2024 - Expanded to serve 15,000+ students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 