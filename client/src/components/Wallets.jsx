import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaWallet, FaTimes, FaSave } from 'react-icons/fa';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null); // For editing
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletCurrency, setWalletCurrency] = useState('INR');
  const [walletDescription, setWalletDescription] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
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
      } else {
        setError(data.message || 'Failed to fetch wallets.');
      }
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Network error while fetching wallets.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentWallet(null); // Clear for add mode
    setWalletName('');
    setWalletBalance('');
    setWalletCurrency('INR');
    setWalletDescription('');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (wallet) => {
    setCurrentWallet(wallet);
    setWalletName(wallet.name);
    setWalletBalance(wallet.balance.toString());
    setWalletCurrency(wallet.currency);
    setWalletDescription(wallet.description || '');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!walletName) {
      setModalError('Wallet name is required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setModalError('Authentication token missing. Please log in again.');
      return;
    }

    const walletData = {
      name: walletName,
      balance: parseFloat(walletBalance) || 0,
      currency: walletCurrency,
      description: walletDescription,
    };

    try {
      let response;
      if (currentWallet) {
        // Update existing wallet
        response = await fetch(`https://expense-tracker-kghc.onrender.com/api/wallets/${currentWallet._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(walletData),
        });
      } else {
        // Add new wallet
        response = await fetch('https://expense-tracker-kghc.onrender.com/api/wallets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(walletData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setModalSuccess(`Wallet ${currentWallet ? 'updated' : 'added'} successfully!`);
        fetchWallets(); // Refresh the list
        setTimeout(() => closeModal(), 1500);
      } else {
        setModalError(data.message || `Failed to ${currentWallet ? 'update' : 'add'} wallet.`);
      }
    } catch (err) {
      console.error('Error submitting wallet:', err);
      setModalError('Network error or server unavailable.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wallet? This cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`https://expense-tracker-kghc.onrender.com/api/wallets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWallets(wallets.filter(wallet => wallet._id !== id));
        alert('Wallet deleted successfully!'); // Use alert for simplicity here
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete wallet.');
      }
    } catch (err) {
      console.error('Error deleting wallet:', err);
      alert('Network error or server unavailable.');
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading wallets...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Wallets</h2>

      <div className="mb-6">
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center gap-2 text-lg font-semibold"
        >
          <FaPlus /> Add New Wallet
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-lg mb-4">You haven't added any wallets yet.</p>
          <button
            onClick={openAddModal}
            className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            + Create Your First Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map(wallet => (
            <div key={wallet._id} className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3 text-blue-800">
                  <FaWallet size={24} />
                  <h3 className="text-xl font-bold">{wallet.name}</h3>
                </div>
                <p className="text-gray-700 text-lg mb-2">
                  Balance: <span className="font-semibold">{wallet.currency} {wallet.balance.toFixed(2)}</span>
                </p>
                <p className="text-gray-600 text-sm">{wallet.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openEditModal(wallet)}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(wallet._id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wallet Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
              aria-label="Close wallet form"
            >
              <FaTimes size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {currentWallet ? 'Edit Wallet' : 'Add New Wallet'}
            </h2>

            {modalError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {modalError}</span>
              </div>
            )}
            {modalSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 mb-1">Wallet Name</label>
                <input
                  type="text"
                  id="walletName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-700 mb-1">Initial Balance (Optional)</label>
                <input
                  type="number"
                  id="walletBalance"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  step="0.01"
                  disabled={!!currentWallet} // Disable balance edit for existing wallets
                />
                {currentWallet && <p className="text-sm text-gray-500 mt-1">Balance can only be set when creating a new wallet. Adjust with transactions.</p>}
              </div>
              <div>
                <label htmlFor="walletCurrency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  id="walletCurrency"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={walletCurrency}
                  onChange={(e) => setWalletCurrency(e.target.value)}
                  required
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  {/* Add more currencies as needed */}
                </select>
              </div>
              <div>
                <label htmlFor="walletDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  id="walletDescription"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  value={walletDescription}
                  onChange={(e) => setWalletDescription(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <FaSave /> {currentWallet ? 'Update Wallet' : 'Add Wallet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
