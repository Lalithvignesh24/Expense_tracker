import React from 'react';
import { FaTimes, FaPlusCircle } from 'react-icons/fa';

const WalletSelectionModal = ({ wallets, isOpen, onClose, onSelectWallet, onGoToWallets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close wallet selection"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select a Wallet</h2>

        {wallets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You don't have any wallets yet.</p>
            <button
              onClick={onGoToWallets}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center mx-auto gap-2"
            >
              <FaPlusCircle /> Create Your First Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {wallets.map((wallet) => (
              <button
                key={wallet._id}
                onClick={() => onSelectWallet(wallet)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition duration-200 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{wallet.name}</h3>
                  <p className="text-sm text-gray-500">{wallet.description || 'No description'}</p>
                </div>
                <span className="text-xl font-bold text-indigo-600">
                  {/* Modified line to be more robust against parsing errors and undefined/null values */}
                  {wallet.currency || ''} {(wallet.balance !== undefined && wallet.balance !== null ? wallet.balance : 0).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSelectionModal;
