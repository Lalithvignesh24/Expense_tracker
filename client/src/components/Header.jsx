import React from 'react';
import { FaBell, FaUserCircle, FaArrowLeft } from 'react-icons/fa'; // Import FaArrowLeft
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation

const Header = ({ userName }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location to decide when to show back button

  // Function to go back in browser history
  const handleGoBack = () => {
    navigate(-1); // Go back one step in history
  };

  // Determine if the back button should be shown
  // We typically don't show it on the dashboard overview or login/signup pages
  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/';

  return (
    <header className="bg-white shadow-sm p-4 sm:p-6 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-indigo-600 transition duration-200 mr-2"
            aria-label="Go back"
          >
            <FaArrowLeft size={24} />
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Budget View</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-indigo-600 transition duration-200" aria-label="Notifications">
          <FaBell size={24} />
        </button> 
        <div className="flex items-center gap-2 text-gray-600">
          <FaUserCircle size={30} />
          <span className="hidden sm:inline text-lg font-medium">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
