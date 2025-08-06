import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCog, FaSave } from 'react-icons/fa'; // Removed FaTrashAlt and FaExclamationTriangle

const Account = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('INR'); // Default currency
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // For success/error messages after actions

  useEffect(() => {
    // Load user info from localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    const storedPreferredCurrency = localStorage.getItem('preferredCurrency');

    if (storedUserName) setUserName(storedUserName);
    if (storedUserEmail) setUserEmail(storedUserEmail);
    if (storedPreferredCurrency) setPreferredCurrency(storedPreferredCurrency);

    setLoading(false); // Data loaded from local storage
  }, []);

  const handleCurrencyChange = (e) => {
    setPreferredCurrency(e.target.value);
  };

  const handleSaveChanges = () => {
    setMessage('');
    try {
      localStorage.setItem('preferredCurrency', preferredCurrency);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error('Error saving settings to local storage:', err);
      setMessage('Failed to save settings.');
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading account settings...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaUserCircle /> Account Settings
      </h2>

      {message && (
        <div className={`px-4 py-3 rounded relative mb-4 ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* General Settings Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaCog /> General Settings
        </h3>
        <div className="space-y-4">
          {/* User Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900 text-lg font-semibold">{userName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <p className="text-gray-900 text-lg font-semibold">{userEmail}</p>
          </div>

          {/* Currency Preference */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Select your preferred currency
            </label>
            <select
              id="currency"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={preferredCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
              {/* Add more currencies as needed */}
            </select>
          </div>

          <button
            onClick={handleSaveChanges}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <FaSave /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
