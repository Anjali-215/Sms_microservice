import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Preloader from './Preloader';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const studentServiceUrl = process.env.REACT_APP_STUDENT_SERVICE_URL || 'http://localhost:8000';
      const courseServiceUrl = process.env.REACT_APP_COURSE_SERVICE_URL || 'http://localhost:8001';

      const [studentsRes, coursesRes] = await Promise.all([
        axios.get(`${studentServiceUrl}/students/`),
        axios.get(`${courseServiceUrl}/courses/`)
      ]);
      
      setStats({
        totalStudents: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
        totalCourses: Array.isArray(coursesRes.data) ? coursesRes.data.length : 0
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <img src="/smslogo.png" alt="SMS Logo" className="h-16 w-16" />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">Total Students</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalStudents}</p>
              </div>
            </div>
            <Link
              to="/students"
              className="mt-4 block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Manage Students
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">Total Courses</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalCourses}</p>
              </div>
            </div>
            <Link
              to="/courses"
              className="mt-4 block text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Manage Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              to="/students"
              className="block bg-blue-50 hover:bg-blue-100 p-4 rounded-md transition duration-200"
            >
              <h4 className="text-lg font-semibold text-blue-700">Add New Student</h4>
              <p className="text-blue-600 mt-1">Register a new student in the system</p>
            </Link>
            <Link
              to="/courses"
              className="block bg-green-50 hover:bg-green-100 p-4 rounded-md transition duration-200"
            >
              <h4 className="text-lg font-semibold text-green-700">Create New Course</h4>
              <p className="text-green-600 mt-1">Add a new course to the curriculum</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">System Information</h3>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Student Service: Running on port 8000
            </p>
            <p className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Course Service: Running on port 8001
            </p>
            <p className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Database Monitor: Available at port 8081
            </p>
            <p className="mt-4">
              <a
                href="http://localhost:8081"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Open MongoDB Express Interface →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;