import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Overview from '../components/Overview';
import Transactions from '../components/Transactions';
import Stats from '../components/Stats';
import Wallets from '../components/Wallets';
import Category from '../components/Category';
import Account from '../components/Account';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const DashboardPage = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [userName, setUserName] = useState('User'); // State to hold user's name
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    // Retrieve user name from localStorage when component mounts
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Function to check token validity
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, redirect to login
        onLogout(); // Clear any remaining local storage items
        navigate('/login');
        return;
      }

      try {
        // Send a request to a protected route to check token validity
        // A simple GET request to /api/expenses or /api/wallets would suffice
        const response = await fetch('http://localhost:5000/api/expenses', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If response is not OK (e.g., 401 Unauthorized due to expired token)
          console.log('Token invalid or expired. Logging out...');
          onLogout();
          navigate('/login');
        }
        // If response is OK, token is still valid, do nothing
      } catch (error) {
        // Handle network errors (server down, etc.)
        console.error('Network error during token validation:', error);
        // Optionally, you might want to log out here too if persistent network errors
        // indicate a deeper issue or inability to authenticate.
        // For now, we'll let the user stay if it's just a temporary network glitch.
      }
    };

    // Check immediately on mount
    checkTokenValidity();

    // Set up an interval to check token validity periodically (e.g., every 5 minutes)
    const intervalId = setInterval(checkTokenValidity, 5 * 60 * 1000); // 5 minutes

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);

  }, [onLogout, navigate]); // Dependencies for useEffect

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview />;
      case 'transactions':
        return <Transactions setActiveSection={setActiveSection} />;
      case 'stats':
        return <Stats />;
      case 'wallets':
        return <Wallets />;
      case 'category':
        return <Category />;
      case 'account':
        return <Account />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-inter antialiased">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 ease-in-out">
        <Header userName={userName} />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
