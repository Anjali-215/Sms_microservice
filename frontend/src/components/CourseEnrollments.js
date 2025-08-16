import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Preloader from './Preloader';
import PageHeader from './PageHeader';

function CourseEnrollments() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentDetails, setEnrollmentDetails] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses from:', process.env.REACT_APP_COURSE_SERVICE_URL);
      const response = await axios.get(`${process.env.REACT_APP_COURSE_SERVICE_URL}/courses/`);
      console.log('Courses response:', response.data);
      setCourses(response.data);
      
      // Fetch student details for each course
      const details = {};
      console.log('Processing courses for enrollment details');
      for (const course of response.data) {
        console.log('Processing course:', course);
        if (course.enrolled_students && course.enrolled_students.length > 0) {
          console.log('Found enrolled students:', course.enrolled_students);
          const studentPromises = course.enrolled_students.map(studentId => {
            console.log('Fetching student:', studentId);
            return axios.get(`${process.env.REACT_APP_STUDENT_SERVICE_URL}/students/${studentId}`);
          });
          const students = await Promise.all(studentPromises);
          console.log('Student details:', students.map(res => res.data));
          details[course._id] = students.map(res => res.data);
        } else {
          console.log('No students enrolled in course:', course.code);
          details[course._id] = [];
        }
      }
      setEnrollmentDetails(details);
      setError(null);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch enrollment data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div>
      <PageHeader
        title="Course Enrollments"
        subtitle="View all enrolled students for each course"
        icon={(props) => (
          <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{course.name}</h3>
              <p className="text-sm text-gray-600">Course Code: {course.code}</p>
              <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
              <p className="text-sm text-gray-600">
                Enrollment: {enrollmentDetails[course._id]?.length || 0} / {course.max_students} students
              </p>
            </div>
            
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Enrolled Students</h4>
              {enrollmentDetails[course._id]?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrollmentDetails[course._id].map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {student.first_name[0]}{student.last_name[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.first_name} {student.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {student.grade.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No students enrolled yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseEnrollments;
