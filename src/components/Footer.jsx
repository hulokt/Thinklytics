import React from 'react';
import { Button } from "./ui/button";
import { Link } from 'react-router-dom';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  TrendingUp
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "Dashboard", to: "/coming-soon/dashboard" },
      { name: "Analytics", to: "/coming-soon/analytics" },
      { name: "Study Plans", to: "/coming-soon/study-plans" },
      { name: "Practice Tests", to: "/coming-soon/practice-tests" },
      { name: "Mobile App", to: "/coming-soon/mobile" }
    ],
    company: [
      { name: "About Us", to: "/about" },
      { name: "Careers", to: "/careers" },
      { name: "Press", to: "/press" },
      { name: "Blog", to: "/blog" },
      { name: "Contact", to: "/contact" }
    ],
    support: [
      { name: "Help Center", to: "/help" },
      { name: "Community", to: "/community" },
      { name: "Tutorials", to: "/tutorials" },
      { name: "API Docs", to: "/api-docs" },
      { name: "Status", to: "/status" }
    ],
    legal: [
      { name: "Privacy Policy", to: "/privacy-policy" },
      { name: "Terms of Service", to: "/terms" },
      { name: "Cookie Policy", to: "/cookies" },
      { name: "GDPR", to: "/gdpr" }
    ]
  };

  const stats = [
    { icon: BookOpen, value: "50K+", label: "Questions Analyzed" },
    { icon: Users, value: "15K+", label: "Active Students" },
    { icon: Award, value: "89%", label: "Average Improvement" },
    { icon: TrendingUp, value: "1400+", label: "Average Score Increase" }
  ];

  return (
    <footer className="bg-slate-900 border-t border-white/10">
      {/* Newsletter Section */}
      <div className="py-16 px-6 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Stay Updated with SAT 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Success Tips</span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Get weekly study strategies, test-taking tips, and exclusive content delivered to your inbox. 
                Join thousands of students who've improved their scores with our insights.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 h-12 text-white" style={{color: 'white'}}>
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 px-6 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <img src="/logo.png" alt="Thinklytics Logo" className="w-10 h-10 rounded-lg object-cover" />
                <span className="text-white text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Thinklytics
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering students to achieve their SAT goals through intelligent analytics and personalized study strategies.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>support@thinklytics.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>Tampa, Florida</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Dashboard</Link></li>
                <li><Link to="/study-plans" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Study Plans</Link></li>
                <li><Link to="/practice-tests" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Practice Tests</Link></li>
                <li><Link to="/mobile" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">Mobile App</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link to={link.to} className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link to={link.to} className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link to={link.to} className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="py-8 px-6 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Thinklytics. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500 transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 