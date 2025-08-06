import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const SignUpPage = () => { // Removed onLoginClick prop as it's handled internally now
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch('https://expense-tracker-kghc.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registration successful! Please log in.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login'); // Navigate to login page after successful signup
        }, 2000); // Redirect after 2 seconds
      } else {
        setErrorMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('Network error or server unavailable. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6 bg-cover bg-center"
        >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-indigo-800/70 to-purple-900/70"></div>

      <div className="relative bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-500 ease-in-out scale-100 hover:scale-105">
        <div className="text-center mb-8">
          <img
            src="logo1.jpg"
            alt="BudgetBuddy Logo"
            className="w-16 h-16 mx-auto mb-4 rounded-full shadow-md"
            aria-label="BudgetBuddy Logo"
          />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Join BudgetBuddy!
          </h2>
          <p className="text-gray-600">Create your new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-100"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login'); // Use navigate for internal routing
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200 ease-in-out"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
