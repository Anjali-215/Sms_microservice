import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: '',
    instructor: '',
    max_students: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8001/courses/');
      console.log('Fetched courses:', response.data);
      setCourses(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert numeric fields to numbers
      const dataToSubmit = {
        ...formData,
        credits: parseInt(formData.credits),
        max_students: parseInt(formData.max_students),
        enrolled_students: []  // Initialize empty array for new courses
      };

      if (isEditing && editingId) {
        console.log('Updating course with ID:', editingId);
        await axios.put(`http://localhost:8001/courses/${editingId}`, dataToSubmit);
      } else {
        console.log('Creating new course:', dataToSubmit);
        const response = await axios.post('http://localhost:8001/courses/', dataToSubmit);
        console.log('Created course:', response.data);
      }
      
      await fetchCourses();
      setFormData({
        code: '',
        name: '',
        description: '',
        credits: '',
        instructor: '',
        max_students: ''
      });
      setIsEditing(false);
      setEditingId(null);
      setError(null);
    } catch (error) {
      console.error('Error saving course:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to save course. Please try again.');
      }
    }
  };

  const handleEdit = (course) => {
    console.log('Editing course:', course);
    const courseId = course._id || course.id;
    if (!courseId) {
      console.error('No course ID found:', course);
      setError('Cannot edit course: No ID found');
      return;
    }
    setIsEditing(true);
    setEditingId(courseId);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description,
      credits: course.credits.toString(),
      instructor: course.instructor,
      max_students: course.max_students.toString()
    });
    setError(null);
  };

  const handleDelete = async (course) => {
    try {
      const courseId = course._id || course.id;
      if (!courseId) {
        console.error('No course ID found:', course);
        setError('Cannot delete course: No ID found');
        return;
      }
      console.log('Deleting course with ID:', courseId);
      await axios.delete(`http://localhost:8001/courses/${courseId}`);
      await fetchCourses();
      setError(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to delete course. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Courses Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Course Code
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Course Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Credits
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                required
                min="1"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Instructor
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Max Students
              <input
                type="number"
                name="max_students"
                value={formData.max_students}
                onChange={handleInputChange}
                required
                min="1"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isEditing ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Code</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Instructor</th>
              <th className="py-3 px-6 text-center">Credits</th>
              <th className="py-3 px-6 text-center">Max Students</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-6 text-center">
                  No courses found. Add one above!
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id || course.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{course.code}</td>
                  <td className="py-3 px-6 text-left">{course.name}</td>
                  <td className="py-3 px-6 text-left">{course.instructor}</td>
                  <td className="py-3 px-6 text-center">{course.credits}</td>
                  <td className="py-3 px-6 text-center">{course.max_students}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleEdit(course)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Courses;