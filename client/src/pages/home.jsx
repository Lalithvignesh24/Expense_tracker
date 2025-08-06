import React from 'react';
import { FaArrowRight } from 'react-icons/fa'; // Only import the icons that are used
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 min-h-screen text-gray-800 font-inter antialiased">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 sm:py-5 shadow-md bg-white sticky top-0 z-50 rounded-b-lg">
        <div className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-black text-indigo-700 mb-3 sm:mb-0">
          <img
            src="logo1.jpg"
            alt="BudgetBuddy Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-sm"
            aria-label="BudgetBuddy Logo"
          />
          BudgetBuddy
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          <button
            className="text-indigo-600 border border-indigo-600 hover:text-white hover:bg-indigo-600 transition duration-200 ease-in-out transform hover:scale-105 px-4 py-2 rounded-md"
            aria-label="Navigate to Login"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:py-20 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 max-w-6xl mx-auto">
        {/* Left Content - Text and Call to Action */}
        <div className="flex-1 space-y-6 sm:space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Smarter Spending<br /> <span className="text-indigo-500">Starts Here</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
            Take control of your money, unlock the power to save!<br></br>
Turn everyday spending into a path to financial success.<br/><br/>
Spendwise gives you the clarity to manage your finances. <br/>With smart, easy-to-use tools, you can track your expenses, create achievable budgets, and reach your financial goals effortlessly.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 text-white px-7 py-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 mx-auto md:mx-0"
            aria-label="Get started with BudgetBuddy for free"
          >
            Get Started Free <FaArrowRight className="ml-1" />
          </button>

        </div>

        {/* Right Content - The new Image section */}
        <div className="flex-1 flex justify-center items-center relative z-10 p-4 md:p-0">
          <img
            src="expense1.jpg"
            alt="Pie Chart Illustration"
            className="w-full max-w-md h-auto rounded-xl"
          />
        </div>
      </section>

      {/* Features Section - Grid layout for features */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-100">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-10 sm:mb-12 text-gray-900">What You Get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 px-6 max-w-6xl mx-auto">
          {[
            'Smart Expense Logging',
            'Real-time Budgeting',
            'Category Insights',
            'Secure Cloud Backup',
            'AI Spending Suggestions',
            'Monthly Reports',
            'CSV/Excel Import',
            'Customizable Categories',
          ].map((feature, index) => (
            <div
              key={index}
              className="border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 text-center bg-gradient-to-br from-white to-gray-50 flex items-center justify-center min-h-[100px]"
            >
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">{feature}</h3>
            </div>
          ))}
        </div>
        {/* Call to action for features */}
        <div className="text-center mt-12">
          <button
            className="bg-indigo-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-600 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            aria-label="Discover all features"
          >
            Discover All Features
          </button>
        </div>
      </section>

      {/* About Section - Personal touch */}
      <section className="text-center py-12 sm:py-14 px-6 bg-blue-50">
        <img
          src="lalith.jpg"
          alt="Creator Lalith"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 shadow-md"
          aria-label="Creator's profile picture"
        />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900"> Hi, I'm Lalith</h3>
        <p className="text-gray-600 max-w-xl mx-auto mt-3 text-base sm:text-lg">
          I built BudgetBuddy to simplify money management for people like me.
          No teams, no fuss — just a passion project turned into a daily driver for smarter saving.
        </p>
      </section>

      {/* Footer - Consistent and accessible */}
      <footer className="bg-gray-800 text-white py-8 px-6 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm">
          <button className="hover:underline text-gray-300 transition duration-200" aria-label="View Terms and Conditions">
            Terms & Conditions
          </button>
          <button className="hover:underline text-gray-300 transition duration-200" aria-label="View Privacy Policy">
            Privacy Policy
          </button>
          <a href="/contact" className="hover:underline text-gray-300 transition duration-200" aria-label="Contact us">
            Contact Us
          </a>
        </div>
        <p className="text-gray-400 mt-4 text-xs sm:text-sm">© 2025 BudgetBuddy. All rights reserved.</p>
      </footer>

      {/* Custom Tailwind CSS animations (add these to your index.css or a global CSS file) */}
      <style>
        {`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounceSlow 2s infinite ease-in-out;
        }
        `}
      </style>
    </div>
  );
};

export default HomePage;
