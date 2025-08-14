import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Preloader from './Preloader';
import PageHeader from './PageHeader';
import Card from './Card';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageGrade: 0,
    activeStudents: 0
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    generateRecentActivity(); // Simulated activity for demo
  }, []);

  const fetchStats = async () => {
    try {
      const studentServiceUrl = process.env.REACT_APP_STUDENT_SERVICE_URL || 'http://localhost:8000';
      const courseServiceUrl = process.env.REACT_APP_COURSE_SERVICE_URL || 'http://localhost:8001';

      const [studentsRes, coursesRes] = await Promise.all([
        axios.get(`${studentServiceUrl}/students/`),
        axios.get(`${courseServiceUrl}/courses/`)
      ]);
      
      const students = studentsRes.data;
      const averageGrade = students.length > 0
        ? students.reduce((acc, student) => acc + student.grade, 0) / students.length
        : 0;

      setStats({
        totalStudents: students.length,
        totalCourses: coursesRes.data.length,
        averageGrade: averageGrade.toFixed(2),
        activeStudents: students.length // In a real app, you'd filter active students
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = () => {
    // Simulated recent activity
    setRecentActivity([
      { type: 'student', action: 'enrolled', name: 'John Doe', course: 'Computer Science 101', time: '2 hours ago' },
      { type: 'course', action: 'updated', name: 'Advanced Mathematics', instructor: 'Dr. Smith', time: '3 hours ago' },
      { type: 'grade', action: 'submitted', student: 'Alice Johnson', course: 'Physics 201', time: '4 hours ago' },
      { type: 'student', action: 'completed', name: 'Bob Wilson', course: 'Chemistry 101', time: '5 hours ago' },
    ]);
  };

  if (loading) {
    return <Preloader />;
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'student':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'course':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'grade':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Dashboard Overview" 
        subtitle="Welcome back! Here's what's happening in your institution."
        icon={(props) => (
          <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 animate-fade-in" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="transform hover:scale-105 transition-medium">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 bg-opacity-75">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-medium">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 bg-opacity-75">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Courses</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-medium">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 bg-opacity-75">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Average Grade</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.averageGrade}</p>
            </div>
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-medium">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 bg-opacity-75">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Students</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.activeStudents}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions" className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/students" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-medium">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <div className="ml-3">
                  <h4 className="font-semibold text-blue-900">Add New Student</h4>
                  <p className="text-sm text-blue-700">Register a new student</p>
                </div>
              </div>
            </Link>

            <Link to="/courses" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-medium">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div className="ml-3">
                  <h4 className="font-semibold text-green-900">Add New Course</h4>
                  <p className="text-sm text-green-700">Create a new course</p>
                </div>
              </div>
            </Link>

            <Link to="/students" className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-medium">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className="ml-3">
                  <h4 className="font-semibold text-yellow-900">View Reports</h4>
                  <p className="text-sm text-yellow-700">Access student reports</p>
                </div>
              </div>
            </Link>

            <Link to="/courses" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-medium">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="ml-3">
                  <h4 className="font-semibold text-purple-900">Schedule Classes</h4>
                  <p className="text-sm text-purple-700">Manage course schedule</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Recent Activity" className="h-full">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-medium">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'student' && `${activity.name} ${activity.action} in ${activity.course}`}
                    {activity.type === 'course' && `${activity.name} was ${activity.action} by ${activity.instructor}`}
                    {activity.type === 'grade' && `${activity.student} received grades for ${activity.course}`}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;