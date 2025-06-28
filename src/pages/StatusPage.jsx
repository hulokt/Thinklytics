import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Clock, Activity, Server, Database, Globe, Zap } from 'lucide-react';

const StatusPage = ({ onBack }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const systemStatus = {
    overall: "operational",
    uptime: "99.98%",
    lastIncident: "2024-11-15",
    responseTime: "45ms"
  };

  const services = [
    {
      name: "Web Application",
      status: "operational",
      uptime: "99.99%",
      responseTime: "120ms",
      lastCheck: "2 minutes ago",
      description: "Main web platform and user interface"
    },
    {
      name: "API Services",
      status: "operational",
      uptime: "99.97%",
      responseTime: "45ms",
      lastCheck: "1 minute ago",
      description: "REST API and data endpoints"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.99%",
      responseTime: "15ms",
      lastCheck: "30 seconds ago",
      description: "Primary database and data storage"
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "99.98%",
      responseTime: "80ms",
      lastCheck: "1 minute ago",
      description: "User authentication and authorization"
    },
    {
      name: "Analytics Engine",
      status: "operational",
      uptime: "99.95%",
      responseTime: "200ms",
      lastCheck: "3 minutes ago",
      description: "Data processing and analytics"
    },
    {
      name: "File Storage",
      status: "operational",
      uptime: "99.96%",
      responseTime: "90ms",
      lastCheck: "2 minutes ago",
      description: "Image and file upload services"
    }
  ];

  const recentIncidents = [
    {
      id: 1,
      title: "Scheduled Maintenance - Analytics Engine",
      status: "resolved",
      date: "2024-12-10",
      duration: "30 minutes",
      description: "Routine maintenance to improve performance and add new features."
    },
    {
      id: 2,
      title: "Database Performance Optimization",
      status: "resolved",
      date: "2024-11-28",
      duration: "15 minutes",
      description: "Database query optimization to improve response times."
    },
    {
      id: 3,
      title: "API Rate Limiting Update",
      status: "resolved",
      date: "2024-11-15",
      duration: "10 minutes",
      description: "Updated rate limiting policies for better API performance."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-green-600 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 dark:text-yellow-400';
      case 'outage': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'outage': return XCircle;
      default: return Clock;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 dark:bg-green-900/20';
      case 'degraded': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'outage': return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatUptime = (uptime) => {
    return uptime;
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Status</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            System
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Status</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time status of Thinklytics services and infrastructure. 
            We're committed to providing reliable, high-performance service to all our users.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: {currentTime.toLocaleString()}
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">All Systems Operational</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              All Thinklytics services are running normally.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {systemStatus.uptime}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime (30 days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {systemStatus.responseTime}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Incidents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  15,000+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Service Status</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBgColor(service.status)} ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{service.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                      <div className="font-medium text-gray-900 dark:text-white">{service.uptime}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                      <div className="font-medium text-gray-900 dark:text-white">{service.responseTime}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Last Check:</span>
                      <div className="font-medium text-gray-900 dark:text-white">{service.lastCheck}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Incidents</h3>
          <div className="space-y-6">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {incident.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {incident.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-full">
                    {incident.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Date: {incident.date}</span>
                  <span>•</span>
                  <span>Duration: {incident.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Performance Metrics</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Server Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CPU Usage:</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Disk Usage:</span>
                  <span className="font-medium">45%</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Database Health</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Connections:</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Query Response:</span>
                  <span className="font-medium">15ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                  <span className="font-medium">2.3TB</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Network Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bandwidth:</span>
                  <span className="font-medium">1.2 Gbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Latency:</span>
                  <span className="font-medium">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Packet Loss:</span>
                  <span className="font-medium">0.01%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-lg mb-6 opacity-90">
            Get notified about system status updates, maintenance windows, and incidents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage; 