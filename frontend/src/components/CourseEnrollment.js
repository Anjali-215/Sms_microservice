import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from './Alert';

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
         <Alert
           type="error"
           message={error}
           duration={5000}
           onClose={() => setError(null)}
         />
       )}
      
             {success && (
         <Alert
           type="success"
           message={success}
           duration={5000}
           onClose={() => setSuccess('')}
         />
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
