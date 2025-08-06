import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';

const App = () => {
  // Initialize isLoggedIn based on whether a token exists in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // useEffect to check login status on component mount (initial load/refresh)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token on logout
    localStorage.removeItem('userName'); // Clear user data
    localStorage.removeItem('userEmail'); // Clear user data
    localStorage.removeItem('preferredCurrency'); // Clear user data
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* HomePage is the default route */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page Route */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace /> // If logged in, redirect to dashboard
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} /> // Otherwise, show login page
            )
          }
        />

        {/* Sign Up Page Route */}
        <Route
          path="/signup"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace /> // If logged in, redirect to dashboard
            ) : (
              <SignUpPage /> // Otherwise, show signup page
            )
          }
        />

        {/* Dashboard and its nested routes */}
        <Route
          path="/dashboard/*" // Use /* to match nested routes within dashboard
          element={
            isLoggedIn ? (
              <DashboardPage onLogout={handleLogout} /> // If logged in, show dashboard
            ) : (
              <Navigate to="/login" replace /> // Otherwise, redirect to login
            )
          }
        />

        {/* Fallback route for any unmatched paths */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
