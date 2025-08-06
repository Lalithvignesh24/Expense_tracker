import React, { useState } from 'react';
import {
  FaBars, FaTimes, FaHome, FaExchangeAlt, FaChartLine,
  FaWallet, FaTags, FaUserCircle, FaSignOutAlt
} from 'react-icons/fa'; // Importing necessary icons

const Sidebar = ({ activeSection, setActiveSection, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false); // State to manage sidebar open/close on mobile

  const navItems = [
    { name: 'Overview', icon: FaHome, section: 'overview' },
    { name: 'Transactions', icon: FaExchangeAlt, section: 'transactions' },
    { name: 'Stats', icon: FaChartLine, section: 'stats' },
    { name: 'Wallets', icon: FaWallet, section: 'wallets' },
    { name: 'Category', icon: FaTags, section: 'category' },
    { name: 'Account', icon: FaUserCircle, section: 'account' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar Background Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
      >
        {/* Logo/App Name */}
        <div className="p-6 text-2xl font-bold text-white border-b border-gray-700 flex items-center gap-3">
          <img
            src="logo1.jpg" // Placeholder logo
            alt="BudgetBuddy Logo"
            className="w-10 h-10 rounded-full"
          />
          BudgetBuddy
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => {
                setActiveSection(item.section);
                setIsOpen(false); // Close sidebar on item click for mobile
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-lg
                ${activeSection === item.section
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                transition duration-200 ease-in-out transform hover:scale-[1.02]`}
              aria-current={activeSection === item.section ? "page" : undefined}
            >
              <item.icon className="text-xl" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-lg text-red-400 hover:bg-red-700 hover:text-white
              transition duration-200 ease-in-out transform hover:scale-[1.02]"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-xl" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
