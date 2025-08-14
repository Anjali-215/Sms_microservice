import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_STUDENT_SERVICE_URL || 'http://localhost:8000';

function Students() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    grade: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching students from:', API_URL);
      const response = await axios.get(`${API_URL}/students/`);
      console.log('Students response:', response.data);
      
      // Ensure each student has an id property
      const studentsWithIds = response.data.map(student => ({
        ...student,
        id: student._id || student.id // Use _id from MongoDB or fallback to id
      }));
      setStudents(studentsWithIds);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.request) {
        setError('Could not reach the server. Please try again later.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError(null);
    
    try {
      // Convert numeric fields
      const dataToSubmit = {
        ...formData,
        age: parseInt(formData.age),
        grade: parseFloat(formData.grade),
        courses: []
      };

      console.log('Submitting data:', dataToSubmit);

      if (isEditing && editingId) {
        const response = await axios.put(`${API_URL}/students/${editingId}`, dataToSubmit);
        console.log('Updated student:', response.data);
      } else {
        const response = await axios.post(`${API_URL}/students/`, dataToSubmit);
        console.log('Created student:', response.data);
      }
      
      await fetchStudents();
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        age: '',
        grade: '',
      });
      setIsEditing(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving student:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.request) {
        setError('Could not reach the server. Please try again later.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setIsEditing(true);
    setEditingId(student.id || student._id);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      age: student.age.toString(),
      grade: student.grade.toString(),
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Deleting student with id:', id);
      await axios.delete(`${API_URL}/students/${id}`);
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.request) {
        setError('Could not reach the server. Please try again later.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Students Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Age
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="1"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Grade
              <input
                type="number"
                step="0.1"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                required
                min="0"
                max="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {loading ? 'Processing...' : isEditing ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-center">Age</th>
              <th className="py-3 px-6 text-center">Grade</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 px-6 text-center">
                  No students found. Add one above!
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id || student._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="py-3 px-6 text-left">{student.email}</td>
                  <td className="py-3 px-6 text-center">{student.age}</td>
                  <td className="py-3 px-6 text-center">{student.grade}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleEdit(student)}
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id || student._id)}
                      disabled={loading}
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

export default Students;