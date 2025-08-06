import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartPie } from 'react-icons/fa'; // Added icons for visual appeal

const Overview = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        // Fetch Wallets to calculate total balance
        const walletsResponse = await fetch('http://localhost:5000/api/wallets', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const walletsData = await walletsResponse.json();

        if (walletsResponse.ok) {
          const calculatedTotalBalance = walletsData.reduce((sum, wallet) => sum + wallet.balance, 0);
          setTotalBalance(calculatedTotalBalance);
        } else {
          setError(walletsData.message || 'Failed to fetch wallets.');
          setLoading(false);
          return;
        }

        // Fetch Expenses/Transactions to calculate total income and total expenses
        const expensesResponse = await fetch('http://localhost:5000/api/expenses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const expensesData = await expensesResponse.json();

        if (expensesResponse.ok) {
          const income = expensesData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const expense = expensesData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
          setTotalIncome(income);
          setTotalExpense(expense);
        } else {
          setError(expensesData.message || 'Failed to fetch transactions.');
          setLoading(false);
          return;
        }

      } catch (err) {
        console.error('Error fetching overview data:', err);
        setError('Network error or server unavailable while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading overview data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaChartPie /> Your Financial Overview
      </h2>

      <p className="text-gray-600 mb-8">A quick summary of your current financial status.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Total Balance</h3>
            <p className="text-4xl font-bold">₹{totalBalance.toFixed(2)}</p>
          </div>
          <FaWallet className="text-blue-300 text-5xl opacity-70" />
        </div>

        {/* Total Income Card */}
        <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Total Income</h3>
            <p className="text-4xl font-bold">₹{totalIncome.toFixed(2)}</p>
          </div>
          <FaArrowUp className="text-green-300 text-5xl opacity-70" />
        </div>

        {/* Total Expenses Card */}
        <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Total Expenses</h3>
            <p className="text-4xl font-bold">₹{totalExpense.toFixed(2)}</p>
          </div>
          <FaArrowDown className="text-red-300 text-5xl opacity-70" />
        </div>
      </div>

      {/* You can add more overview elements here, like recent transactions or budget summaries */}
      <div className="mt-10 text-center text-gray-500">
        <p>Explore other sections for detailed reports and management.</p>
      </div>
    </div>
  );
};

export default Overview;
