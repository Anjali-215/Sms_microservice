import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CourseEnrollment({ studentId, onEnrollmentComplete }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      console.log('Fetching courses from:', process.env.REACT_APP_COURSE_SERVICE_URL);
      const response = await axios.get(`${process.env.REACT_APP_COURSE_SERVICE_URL}/courses/`);
      console.log('Courses response:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch available courses: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess('');
      
      // Call the student service endpoint to register for the course
      const response = await axios.post(
        `${process.env.REACT_APP_STUDENT_SERVICE_URL}/students/${studentId}/register/${courseId}`,
        {},  // empty body
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data) {
        // Get the course name for the success message
        const enrolledCourse = courses.find(course => course._id === courseId);
        const courseName = enrolledCourse ? enrolledCourse.name : 'course';
        
        setSuccess(`Successfully enrolled in ${courseName}! You can view your enrollments in the Enrollments tab.`);
        if (onEnrollmentComplete) {
          onEnrollmentComplete(response.data);
        }
        // Remove the enrolled course from the list
        setCourses(courses.filter(course => course._id !== courseId));
      } else {
        setError('Enrollment response was empty');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      let errorMessage;
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.detail || error.response.data?.message || 'Failed to enroll in course';
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Failed to enroll in course';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-2">Available Courses</h4>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 animate-fade-in">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course._id} className="border rounded-lg p-4 bg-white shadow-sm">
            <h5 className="font-semibold">{course.name}</h5>
            <p className="text-sm text-gray-600">{course.code}</p>
            <p className="text-sm text-gray-600">Credits: {course.credits}</p>
            <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
            <button
              onClick={() => handleEnroll(course._id)}
              disabled={loading}
              className={`mt-2 px-4 py-2 rounded text-white ${
                loading
                  ? 'bg-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseEnrollment;
