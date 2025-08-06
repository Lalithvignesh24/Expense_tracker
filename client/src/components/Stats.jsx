import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChartPie, FaArrowUp, FaArrowDown, FaCalendarDay, FaCalendarAlt, FaCalendarWeek
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// A color palette for the pie chart cells
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2', '#32CD32', '#FF6347', '#4682B4'];

const Stats = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('₹'); // Default to Rupee
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly'); // 'daily', 'monthly', 'yearly'

  // Aggregated data states for charts
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [timeframeData, setTimeframeData] = useState([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState([]);
  const [incomeCategoryData, setIncomeCategoryData] = useState([]);
  const [dailyActivityData, setDailyActivityData] = useState([]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('https://expense-tracker-kghc.onrender.com/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
      } else {
        setError(data.message || 'Failed to fetch transactions.');
      }
    } catch (err) {
      console.error('Stats: Network error fetching transactions:', err);
      setError('Network error while fetching transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const storedPreferredCurrency = localStorage.getItem('preferredCurrency');
    if (storedPreferredCurrency) {
      const currencySymbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
      };
      setPreferredCurrency(currencySymbols[storedPreferredCurrency] || storedPreferredCurrency);
    }
  }, [fetchTransactions]);

  // Data aggregation logic for charts
  useEffect(() => {
    const expensesSum = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const incomeSum = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalExpenses(expensesSum);
    setTotalIncome(incomeSum);

    const aggregateCategories = (data, topCount = 5) => {
        const categories = {};
        data.forEach(transaction => {
            const category = transaction.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + transaction.amount;
        });

        const sortedCategories = Object.entries(categories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topCount);

        const otherSum = Object.entries(categories)
            .slice(topCount)
            .reduce((sum, [, value]) => sum + value, 0);

        const result = sortedCategories.map(([name, value]) => ({ name, value }));

        if (otherSum > 0) {
            result.push({ name: 'Other', value: otherSum });
        }
        return result;
    };

    setExpenseCategoryData(aggregateCategories(transactions.filter(t => t.type === 'expense')));
    setIncomeCategoryData(aggregateCategories(transactions.filter(t => t.type === 'income')));

    const dailyActivity = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateKey = date.toLocaleDateString();
      dailyActivity[dateKey] = dailyActivity[dateKey] || { date: dateKey, expense: 0, income: 0 };
      if (transaction.type === 'expense') {
        dailyActivity[dateKey].expense += transaction.amount;
      } else if (transaction.type === 'income') {
        dailyActivity[dateKey].income += transaction.amount;
      }
    });

    const aggregateByTimeframe = (data, timeframe) => {
      const aggregated = {};
      data.forEach(transaction => {
        const date = new Date(transaction.date);
        let key;
        if (timeframe === 'daily') {
          key = date.toISOString().split('T')[0];
        } else if (timeframe === 'monthly') {
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
          key = date.getFullYear().toString();
        }

        aggregated[key] = aggregated[key] || { income: 0, expense: 0, name: key };
        if (transaction.type === 'income') {
          aggregated[key].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          aggregated[key].expense += transaction.amount;
        }
      });
      return Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name));
    };

    setDailyActivityData(Object.values(dailyActivity).sort((a, b) => new Date(a.date) - new Date(b.date)));
    setTimeframeData(aggregateByTimeframe(transactions, selectedTimeframe));

  }, [transactions, selectedTimeframe]);

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaChartPie /> Statistics & Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Total Expenses</h3>
            <p className="text-4xl font-bold text-red-800">{preferredCurrency}{totalExpenses.toFixed(2)}</p>
          </div>
          <FaArrowDown className="text-red-500 text-5xl opacity-70" />
        </div>
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-2">Total Income</h3>
            <p className="text-4xl font-bold text-green-800">{preferredCurrency}{totalIncome.toFixed(2)}</p>
          </div>
          <FaArrowUp className="text-green-500 text-5xl opacity-70" />
        </div>
      </div>

      {/* Timeframe Selector for Top Bar Chart */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedTimeframe('daily')}
          className={`px-4 py-2 rounded-md transition ${selectedTimeframe === 'daily' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <FaCalendarDay className="inline-block mr-2" /> Daily
        </button>
        <button
          onClick={() => setSelectedTimeframe('monthly')}
          className={`px-4 py-2 rounded-md transition ${selectedTimeframe === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <FaCalendarAlt className="inline-block mr-2" /> Monthly
        </button>
        <button
          onClick={() => setSelectedTimeframe('yearly')}
          className={`px-4 py-2 rounded-md transition ${selectedTimeframe === 'yearly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <FaCalendarWeek className="inline-block mr-2" /> Yearly
        </button>
      </div>

      {/* Bar Chart: Total Income vs Total Expense by Timeframe */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Income vs. Expense by {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}
        </h3>
        {timeframeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeframeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${preferredCurrency}${value}`} />
              <Tooltip formatter={(value) => `${preferredCurrency}${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" name="Income" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" fill="#F44336" name="Expense" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No data available for this timeframe.</p>
        )}
      </div>

      {/* Pie Charts: Categories of Expenses & Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Categories of Expenses</h3>
          {expenseCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80} // Made outerRadius smaller to create more space
                  fill="#8884d8"
                  isAnimationActive={false} // Disable animation to prevent layout shifts
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${preferredCurrency}${value.toFixed(2)}`, name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No expense categories to display.</p>
          )}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Categories of Income</h3>
          {incomeCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80} // Made outerRadius smaller
                  fill="#82ca9d"
                  isAnimationActive={false} // Disable animation
                >
                  {incomeCategoryData.map((entry, index) => (
                    <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${preferredCurrency}${value.toFixed(2)}`, name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No income categories to display.</p>
          )}
        </div>
      </div>

      {/* Bar Chart: Daily Activity (Income vs Expense) */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Daily Activity</h3>
        {dailyActivityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${preferredCurrency}${value}`} />
              <Tooltip formatter={(value) => `${preferredCurrency}${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#4CAF50" name="Income" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" fill="#F44336" name="Expense" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No daily activity data available.</p>
        )}
      </div>
    </div>
  );
};

export default Stats;
