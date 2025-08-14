import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/smslogo.png" alt="SMS Logo" className="h-10 w-10" />
              <span className="text-white font-bold text-xl">Student Management System</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              to="/students"
              className={`text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/students')}`}
            >
              Students
            </Link>
            <Link
              to="/courses"
              className={`text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${isActive('/courses')}`}
            >
              Courses
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
