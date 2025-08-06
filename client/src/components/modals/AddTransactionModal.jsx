import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa'; // Removed FaPlusCircle

const AddTransactionModal = ({ isOpen, onClose, selectedWallet, onTransactionAdded, onGoToCategory }) => {
  const [type, setType] = useState('expense'); // Default to expense
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  // Effect to fetch categories when modal opens or type changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setCategoryError('Authentication token missing. Please log in again.');
        setLoadingCategories(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
          // Set default category if available and matches type
          const defaultCategory = data.find(cat => cat.type === type.toLowerCase());
          if (defaultCategory) {
            setCategory(defaultCategory.name);
          } else {
            setCategory(''); // Clear if no matching category
          }
        } else {
          setCategoryError(data.message || 'Failed to fetch categories.');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError('Network error while fetching categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen, type]); // Re-fetch when modal opens or type changes

  // Filter categories based on selected type
  const filteredCategories = categories.filter(cat => cat.type === type.toLowerCase());

  // Reset form when modal opens or selected wallet changes
  useEffect(() => {
    if (isOpen) {
      setType('expense');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrorMessage('');
      setSuccessMessage('');
      // Category will be set by the category fetching effect
    }
  }, [isOpen, selectedWallet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedWallet) {
      setErrorMessage('Please select a wallet first.');
      return;
    }
    if (!description || !amount || !category || !date) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setErrorMessage('Amount must be a positive number.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Authentication token missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          category,
          date,
          notes,
          type,
          walletId: selectedWallet._id, // Send the selected wallet's ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Transaction added successfully!');
        onTransactionAdded(data); // Pass the new transaction data up
        // Clear form fields after successful submission
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setCategory(filteredCategories.length > 0 ? filteredCategories[0].name : ''); // Reset category to first available
        setTimeout(() => {
          setSuccessMessage('');
          onClose(); // Close modal after a short delay
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Failed to add transaction.');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      setErrorMessage('Network error or server unavailable. Please try again later.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col relative transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close add transaction modal"
        >
          <FaTimes size={24} />
        </button>

        <div className="p-6 pb-0"> {/* Header content, no bottom padding */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Add New Transaction</h2>
          {selectedWallet && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md mb-4 text-center font-medium">
              Wallet: <span className="font-semibold">{selectedWallet.name}</span> ({selectedWallet.currency} {selectedWallet.balance.toFixed(2)})
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 pt-0"> {/* Adjusted padding */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-red-600"
                    name="type"
                    value="expense"
                    checked={type === 'expense'}
                    onChange={() => setType('expense')}
                  />
                  <span className="ml-2 text-gray-900">Expense</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-600"
                    name="type"
                    value="income"
                    checked={type === 'income'}
                    onChange={() => setType('income')}
                  />
                  <span className="ml-2 text-gray-900">Income</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <input
                id="description"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
              <input
                id="amount"
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <FaSpinner className="animate-spin" /> Loading categories...
                </div>
              ) : categoryError ? (
                <div className="text-red-600 text-sm">{categoryError}</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  No categories available for this type. <button type="button" onClick={onGoToCategory} className="text-indigo-600 hover:underline">Add one!</button>
                </div>
              ) : (
                <select
                  id="category"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {filteredCategories.map(cat => (
                    <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                id="date"
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                id="notes"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer with Submit Button - always visible */}
        <div className="p-6 pt-0 border-t border-gray-200 bg-white"> {/* Added border-t and bg-white */}
          <button
            type="submit"
            onClick={handleSubmit} // Attach handler to button
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
            disabled={loadingCategories || categoryError || filteredCategories.length === 0} // Disable if categories are loading/error/none
          >
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
