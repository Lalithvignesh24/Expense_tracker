import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSearch, FaCalendarAlt, FaWallet, FaTags, FaArrowUp, FaArrowDown, FaTrashAlt, FaFileUpload } from 'react-icons/fa';
import WalletSelectionModal from '../components/modals/WalletSelectionModal';
import AddTransactionModal from '../components/modals/AddTransactionModal';
import ImportTransactionsModal from '../components/modals/ImportTransactionsModal';

const Transactions = ({ setActiveSection, resetTrigger }) => { // Added resetTrigger prop
  const [isWalletSelectionModalOpen, setIsWalletSelectionModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isImportTransactionsModalOpen, setIsImportTransactionsModalOpen] = useState(false);
  const [selectedFileForImport, setSelectedFileForImport] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterWallet, setFilterWallet] = useState('All Wallets');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State for reset confirmation modal (for all expenses)
  const [showConfirmResetExpenses, setShowConfirmResetExpenses] = useState(false);
  // NEW: State for single transaction delete confirmation
  const [showConfirmDeleteTransaction, setShowConfirmDeleteTransaction] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null); // Stores the transaction object to be deleted
  // NEW: State for reset income confirmation
  const [showConfirmResetIncomes, setShowConfirmResetIncomes] = useState(false);

  // Memoize fetchTransactions to prevent unnecessary re-renders in useEffect
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
      const response = await fetch('https://expense-tracker-kghc.onrender.com/api/expenses', { // Assuming this fetches all transactions
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
      console.error('Error fetching transactions:', err);
      setError('Network error while fetching transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wallets on component mount
  const fetchWallets = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('https://expense-tracker-kghc.onrender.com/api/wallets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setWallets(data);
        if (data.length === 0) {
          setIsWalletSelectionModalOpen(true);
        }
      } else {
        setError(data.message || 'Failed to fetch wallets.');
      }
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Network error while fetching wallets.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, as it's a general fetch

  // Initial fetch of transactions and wallets on component mount or resetTrigger change
  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, [fetchWallets, fetchTransactions, resetTrigger]); // Depend on memoized functions and resetTrigger

  const handleAddTransactionClick = () => {
    if (wallets.length === 0) {
      setIsWalletSelectionModalOpen(true);
    } else {
      if (selectedWallet) {
        setIsAddTransactionModalOpen(true);
      } else {
        setIsWalletSelectionModalOpen(true);
      }
    }
  };

  const handleWalletSelected = (wallet) => {
    setSelectedWallet(wallet);
    setIsWalletSelectionModalOpen(false);
    setIsAddTransactionModalOpen(true);
  };

  const handleTransactionAdded = (newTransaction) => {
    // Optimistically add the new transaction to the list
    setTransactions(prev => [newTransaction, ...prev]);
    // Update wallet balance in state if the new transaction affects it
    setWallets(prevWallets => prevWallets.map(w =>
      w._id === newTransaction.walletId._id ? { ...w, balance: newTransaction.walletId.balance } : w
    ));
    fetchTransactions(); // Re-fetch all transactions to ensure consistency and re-apply filters
    fetchWallets(); // Re-fetch wallets to ensure balances are updated
  };

  const handleGoToWallets = () => {
    setIsWalletSelectionModalOpen(false);
    if (setActiveSection) {
      setActiveSection('wallets');
    }
  };

  const handleGoToCategory = () => {
    setIsAddTransactionModalOpen(false);
    if (setActiveSection) {
      setActiveSection('category');
    }
  };

  // NEW: handleResetIncomes function
  const handleResetIncomes = async () => {
    setShowConfirmResetIncomes(false); // Close confirmation modal
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authentication token missing. Please log in again.');
      return;
    }
    try {
      const response = await fetch('https://expense-tracker-kghc.onrender.com/api/expenses/reset-incomes', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setMessage('All income transactions reset successfully!');
        fetchTransactions();
        fetchWallets();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to reset incomes.');
      }
    } catch (err) {
      console.error('Error resetting incomes:', err);
      setMessage('Network error or server unavailable. Failed to reset incomes.');
    }
  };


  const handleResetExpenses = async () => {
    setShowConfirmResetExpenses(false); // Close confirmation modal
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authentication token missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch('https://expense-tracker-kghc.onrender.com/api/expenses/reset-expenses', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setMessage('All expense transactions reset successfully!');
        fetchTransactions(); // Re-fetch transactions after reset
        fetchWallets(); // Re-fetch wallets to ensure balances are updated
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to reset expenses.');
      }
    } catch (err) {
      console.error('Error resetting expenses:', err);
      setMessage('Network error or server unavailable. Failed to reset expenses.');
    }
  };

  // NEW: Function to initiate single transaction deletion
  const confirmDeleteSingleTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setShowConfirmDeleteTransaction(true);
  };

  // NEW: Function to handle single transaction deletion
  const handleDeleteSingleTransaction = async () => {
    setShowConfirmDeleteTransaction(false); // Close confirmation modal
    setMessage('');

    if (!transactionToDelete) return; // Should not happen if modal is properly triggered

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authentication token missing. Please log in again.');
      return;
    }

    try {
      // Assuming backend endpoint for single transaction deletion is /api/expenses/:id
      const response = await fetch(`https://expense-tracker-kghc.onrender.com/api/expenses/${transactionToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setMessage(`Transaction "${transactionToDelete.description}" deleted successfully!`);
        // Optimistically remove the transaction from the UI
        setTransactions(prev => prev.filter(t => t._id !== transactionToDelete._id));
        fetchWallets(); // Re-fetch wallets to update balances
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to delete transaction.');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setMessage('Network error or server unavailable. Failed to delete transaction.');
    } finally {
      setTransactionToDelete(null); // Clear the transaction to delete state
    }
  };

  const handleFileChangeForImport = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileForImport(e.target.files[0]);
      setIsImportTransactionsModalOpen(true);
    }
  };

  const handleImportedTransactions = (importResultsFromModal) => {
    if (importResultsFromModal.importedCount > 0) {
      setMessage(`Successfully imported ${importResultsFromModal.importedCount} transactions.`);
    }
    if (importResultsFromModal.failedCount > 0) {
      setMessage(prev => `${prev} ${importResultsFromModal.failedCount} transactions failed to import.`);
    }
    fetchTransactions();
    fetchWallets();
    setIsImportTransactionsModalOpen(false);
    setSelectedFileForImport(null);
    setTimeout(() => setMessage(''), 5000);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearchTerm = searchTerm === '' ||
      (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'All Types' || transaction.type === filterType.toLowerCase();
    const matchesCategory = filterCategory === 'All Categories' || transaction.category === filterCategory;
    const matchesWallet = filterWallet === 'All Wallets' || (transaction.walletId && transaction.walletId._id === filterWallet);

    const transactionDate = new Date(transaction.date);
    const matchesStartDate = !startDate || transactionDate >= new Date(startDate);
    const matchesEndDate = !endDate || transactionDate <= new Date(endDate);

    return matchesSearchTerm && matchesType && matchesCategory && matchesWallet && matchesStartDate && matchesEndDate;
  });

  const uniqueCategories = [...new Set(transactions.map(t => t.category))];


  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Transactions</h2>

      {message && (
        <div className={`px-4 py-3 rounded relative mb-4 ${message.includes('Error') || message.includes('failed') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search description or category..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option>All Types</option>
          <option>Expense</option>
          <option>Income</option>
        </select>

        <select
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option>All Categories</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          value={filterWallet}
          onChange={(e) => setFilterWallet(e.target.value)}
        >
          <option>All Wallets</option>
          {wallets.map(wallet => (
            <option key={wallet._id} value={wallet._id}>{wallet.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500" />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setFilterType('All Types');
            setFilterCategory('All Categories');
            setFilterWallet('All Wallets');
            setStartDate('');
            setEndDate('');
          }}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Reset Filters
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleAddTransactionClick}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition flex items-center gap-2 text-lg font-semibold"
        >
          <FaPlus /> Add Transaction
        </button>
        <label htmlFor="file-upload" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold cursor-pointer">
          <FaFileUpload /> Import
          <input
            id="file-upload"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" // CSV, XLSX, XLS
            className="hidden"
            onChange={handleFileChangeForImport}
          />
        </label>
        <button
          onClick={() => setShowConfirmResetExpenses(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition flex items-center gap-2 text-lg font-semibold"
        >
          <FaTrashAlt /> Reset Expenses
        </button>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-lg mb-4">No transactions recorded yet or matching your filters.</p>
            <button
              onClick={handleAddTransactionClick}
              className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              + Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <div key={transaction._id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between border border-gray-200">
                <div className="flex items-center gap-4">
                  {transaction.type === 'expense' ? (
                    <FaArrowDown className="text-red-500 text-xl" />
                  ) : (
                    <FaArrowUp className="text-green-500 text-xl" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{transaction.description}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FaTags className="text-xs" /> {transaction.category}
                      <span className="mx-2">•</span>
                      <FaWallet className="text-xs" /> {transaction.walletId ? transaction.walletId.name : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.type === 'expense' ? '-' : '+'}{transaction.walletId?.currency || '₹'}{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => confirmDeleteSingleTransaction(transaction)}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Delete Transaction"
                  >
                    <FaTrashAlt className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <WalletSelectionModal
        wallets={wallets}
        isOpen={isWalletSelectionModalOpen}
        onClose={() => setIsWalletSelectionModalOpen(false)}
        onSelectWallet={handleWalletSelected}
        onGoToWallets={handleGoToWallets}
      />

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        selectedWallet={selectedWallet}
        onTransactionAdded={handleTransactionAdded}
        onGoToCategory={handleGoToCategory}
      />

      {isImportTransactionsModalOpen && (
        <ImportTransactionsModal
          isOpen={isImportTransactionsModalOpen}
          onClose={() => {
            setIsImportTransactionsModalOpen(false);
            setSelectedFileForImport(null); // Clear selected file on close
            fetchTransactions(); // Re-fetch transactions when modal closes
            fetchWallets(); // Re-fetch wallets when modal closes
          }}
          onImport={handleImportedTransactions}
          file={selectedFileForImport}
          wallets={wallets}
        />
      )}

      {/* Confirmation Modal for Reset Expenses (existing) */}
      {showConfirmResetExpenses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-xl font-bold text-red-700 mb-4 text-center">Confirm Reset Expenses</h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you absolutely sure you want to delete ALL your **expense** transactions? This action cannot be undone. Income transactions will remain.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmResetExpenses(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetExpenses}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Reset Expenses Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Confirmation Modal for Reset Incomes */}
      {showConfirmResetIncomes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-xl font-bold text-red-700 mb-4 text-center">Confirm Reset Incomes</h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you absolutely sure you want to delete ALL your **income** transactions? This action cannot be undone. Expense transactions will remain.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmResetIncomes(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetIncomes}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Reset Incomes Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Single Transaction Delete */}
      {showConfirmDeleteTransaction && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-xl font-bold text-red-700 mb-4 text-center">Confirm Delete Transaction</h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to delete the transaction: <br />
              <span className="font-semibold">"{transactionToDelete.description}"</span> with amount{' '}
              <span className={`font-semibold ${transactionToDelete.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                {transactionToDelete.type === 'expense' ? '-' : '+'}{transactionToDelete.walletId?.currency || '₹'}{transactionToDelete.amount.toFixed(2)}
              </span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmDeleteTransaction(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSingleTransaction}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
