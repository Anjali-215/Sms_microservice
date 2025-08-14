import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

      console.log('Fetching from:', { studentServiceUrl, courseServiceUrl });

      const [studentsRes, coursesRes] = await Promise.all([
        axios.get(`${studentServiceUrl}/students/`),
        axios.get(`${courseServiceUrl}/courses/`)
      ]);
      
      console.log('Response data:', {
        students: studentsRes.data,
        courses: coursesRes.data
      });

      setStats({
        totalStudents: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
        totalCourses: Array.isArray(coursesRes.data) ? coursesRes.data.length : 0
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Error: ${error.response.status} - ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Error: No response received from server');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Students Overview</h3>
          <p className="text-4xl font-bold text-blue-600 mb-4">{stats.totalStudents}</p>
          <p className="text-gray-600 mb-4">Total Students Enrolled</p>
          <Link
            to="/students"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Students
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Courses Overview</h3>
          <p className="text-4xl font-bold text-green-600 mb-4">{stats.totalCourses}</p>
          <p className="text-gray-600 mb-4">Total Available Courses</p>
          <Link
            to="/courses"
            className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Courses
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Student Management</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>Add new students</li>
              <li>Update student information</li>
              <li>View student details</li>
              <li>Manage student enrollment</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Course Management</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>Create new courses</li>
              <li>Update course details</li>
              <li>Assign instructors</li>
              <li>Set course capacity</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">System Information</h3>
        <div className="text-gray-600">
          <p>• Student Service: {process.env.REACT_APP_STUDENT_SERVICE_URL || 'http://localhost:8000'}</p>
          <p>• Course Service: {process.env.REACT_APP_COURSE_SERVICE_URL || 'http://localhost:8001'}</p>
          <p>• Database Monitor: Available at port 8081</p>
          <p className="mt-4">
            To monitor the database, visit{' '}
            <a
              href="http://localhost:8081"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              MongoDB Express Interface
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;