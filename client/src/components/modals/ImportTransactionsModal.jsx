import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileUpload, FaCheckCircle, FaExclamationCircle, FaArrowDown } from 'react-icons/fa';
import * as Papa from 'papaparse';
// import * as XLSX from 'xlsx'; // You'll need to install this: npm install xlsx

const ImportTransactionsModal = ({ isOpen, onClose, onImport, file, wallets }) => {
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    type: '', // 'income' or 'expense'
    wallet: '', // Wallet name or ID
    notes: '', // Optional notes field
  });
  const [importStatus, setImportStatus] = useState(null); // null, 'processing', 'complete', 'error'
  const [importResults, setImportResults] = useState({ imported: 0, failed: 0, errors: [] });
  const [selectedImportWallet, setSelectedImportWallet] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    console.log('ImportTransactionsModal useEffect triggered.');
    console.log('isOpen:', isOpen, 'file:', file);

    if (!isOpen || !file) {
      // Reset state when modal closes or no file is provided
      setParsedData([]);
      setHeaders([]);
      setColumnMappings({
        description: '', amount: '', category: '', date: '', type: '', wallet: '', notes: ''
      });
      setImportStatus(null);
      setImportResults({ imported: 0, failed: 0, errors: [] });
      setSelectedImportWallet('');
      console.log('Modal not open or no file, resetting state and returning.');
      return;
    }

    // Auto-select first wallet if available
    if (wallets && wallets.length > 0 && !selectedImportWallet) {
      setSelectedImportWallet(wallets[0]._id);
      console.log('Auto-selected first wallet:', wallets[0].name);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('FileReader onload triggered.');
      const content = e.target.result;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      console.log('File extension:', fileExtension);

      if (fileExtension === 'csv') {
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('PapaParse complete. Results:', results);
            if (results.data.length > 0) {
              // Clean headers by trimming whitespace and removing special characters if needed
              const cleanedHeaders = results.meta.fields.map(field => field.trim().replace(/[^a-zA-Z0-9\s]/g, ''));
              setHeaders(cleanedHeaders);
              // Map data to use cleaned headers as keys
              const cleanedData = results.data.map(row => {
                const newRow = {};
                for (const key in row) {
                  if (Object.hasOwnProperty.call(row, key)) {
                    const cleanedKey = key.trim().replace(/[^a-zA-Z0-9\s]/g, '');
                    newRow[cleanedKey] = row[key];
                  }
                }
                return newRow;
              });
              setParsedData(cleanedData);
              console.log('CSV parsed successfully. Cleaned Headers:', cleanedHeaders, 'Data length:', cleanedData.length);
            } else {
              setImportStatus('error');
              setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: 'CSV file is empty or has no valid data.' }] }));
              console.error('CSV file is empty or has no valid data.');
            }
          },
          error: (err) => {
            setImportStatus('error');
            setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: `CSV Parsing Error: ${err.message}` }] }));
            console.error('CSV Parsing Error:', err);
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Placeholder for XLSX/XLS parsing
        setImportStatus('error');
        setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: 'Excel file parsing is not fully implemented. Please use CSV.' }] }));
        console.warn('Excel file parsing attempted, but not implemented.');
      } else {
        setImportStatus('error');
        setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: 'Unsupported file type. Please upload CSV, XLSX, or XLS.' }] }));
        console.error('Unsupported file type:', fileExtension);
      }
    };

    if (file.type === 'text/csv') {
      reader.readAsText(file);
      console.log('Reading CSV file as text...');
    } else {
      reader.readAsArrayBuffer(file);
      console.log('Reading file as array buffer (for Excel placeholder)...');
    }
  }, [isOpen, file, wallets, selectedImportWallet]);

  const handleMappingChange = (field, header) => {
    setColumnMappings(prev => ({ ...prev, [field]: header }));
    console.log('Column mapping changed:', field, '->', header);
  };

  const handleImportSubmit = async () => {
    console.log('Import submit initiated.');
    setImportStatus('processing');
    setImportResults({ imported: 0, failed: 0, errors: [] });

    const requiredFields = ['description', 'amount', 'category', 'date', 'type'];
    const missingMappings = requiredFields.filter(field => !columnMappings[field]);
    if (missingMappings.length > 0) {
      setImportStatus('error');
      setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: `Missing required column mappings: ${missingMappings.join(', ')}` }] }));
      console.error('Missing required column mappings:', missingMappings);
      return;
    }
    if (!selectedImportWallet) {
      setImportStatus('error');
      setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: 'Please select a wallet for imported transactions.' }] }));
      console.error('No wallet selected for import.');
      return;
    }
    if (parsedData.length === 0) {
      setImportStatus('error');
      setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: 'No data parsed from the file. Please check your file.' }] }));
      console.error('No data parsed from file before submission.');
      return;
    }

    const transactionsToValidateAndImport = parsedData.map((row, index) => {
      try {
        let typeValue = (row[columnMappings.type] || '').toLowerCase();
        // Convert 'debit' to 'expense' and 'credit' to 'income'
        if (typeValue === 'debit') {
          typeValue = 'expense';
        } else if (typeValue === 'credit') {
          typeValue = 'income';
        }

        if (!['income', 'expense'].includes(typeValue)) {
          throw new Error(`Invalid transaction type '${row[columnMappings.type]}'. Must be 'income' or 'expense' (or 'debit'/'credit').`);
        }

        const amountValue = parseFloat(row[columnMappings.amount]);
        if (isNaN(amountValue) || amountValue < 0) {
          throw new Error(`Invalid amount '${row[columnMappings.amount]}'. Must be a positive number.`);
        }

        const dateValue = new Date(row[columnMappings.date]);
        if (isNaN(dateValue.getTime())) {
          throw new Error(`Invalid date format for '${row[columnMappings.date]}'.`);
        }

        return {
          description: row[columnMappings.description] || 'No Description',
          amount: amountValue,
          category: row[columnMappings.category] || 'Uncategorized',
          date: dateValue.toISOString(), // Send as ISO string
          type: typeValue,
          walletId: selectedImportWallet,
          notes: columnMappings.notes ? (row[columnMappings.notes] || '') : '', // Only include if mapped
        };
      } catch (e) {
        console.error(`Frontend validation error for row ${index + 2}:`, e.message);
        return { _error: { row: index + 2, message: e.message } }; // +2 for header row and 0-based index
      }
    });

    const validTransactions = transactionsToValidateAndImport.filter(t => !t._error);
    const initialFrontendErrors = transactionsToValidateAndImport.filter(t => t._error).map(t => t._error);
    console.log('Valid transactions for backend:', validTransactions.length, 'Frontend errors:', initialFrontendErrors.length);

    const token = localStorage.getItem('token');
    if (!token) {
      setImportStatus('error');
      setImportResults(prev => ({ ...prev, errors: [...prev.errors, { row: 'N/A', message: 'Authentication token missing. Please log in again.' }] }));
      console.error('Authentication token missing during import submit.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/expenses/import-bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: validTransactions }),
      });

      const result = await response.json();
      console.log('Backend response for import:', result);

      if (response.ok) {
        setImportStatus('complete');
        setImportResults({
          imported: result.importedCount || 0,
          failed: result.failedCount || 0,
          errors: [...initialFrontendErrors, ...(result.errors || [])],
        });
        onImport({ // Pass results back to parent
          importedCount: result.importedCount || 0,
          failedCount: result.failedCount || 0,
          errors: [...initialFrontendErrors, ...(result.errors || [])],
        });
        console.log('Import successful, results:', importResults);
      } else {
        setImportStatus('error');
        setImportResults({
          imported: result.importedCount || 0,
          failed: (result.failedCount || 0) + initialFrontendErrors.length + validTransactions.length,
          errors: [...initialFrontendErrors, ...(result.errors || []), { row: 'N/A', message: `Server Error: ${result.message || 'Unknown backend error'}` }],
        });
        onImport({
          importedCount: result.importedCount || 0,
          failedCount: (result.failedCount || 0) + initialFrontendErrors.length + validTransactions.length,
          errors: [...initialFrontendErrors, ...(result.errors || []), { row: 'N/A', message: `Server Error: ${result.message || 'Unknown backend error'}` }],
        });
        console.error('Import failed with backend error:', result);
      }
    } catch (err) {
      console.error('Network error during bulk import:', err);
      setImportStatus('error');
      setImportResults(prev => ({
        ...prev,
        errors: [...initialFrontendErrors, ...prev.errors, { row: 'N/A', message: `Network error: ${err.message}` }]
      }));
      onImport({
        importedCount: 0,
        failedCount: initialFrontendErrors.length + validTransactions.length,
        errors: [...initialFrontendErrors, { row: 'N/A', message: `Network error: ${err.message}` }]
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaFileUpload /> Import Transactions
        </h2>

        {importStatus === null && (
          <>
            <p className="text-gray-700 mb-4">
              Map the columns from your CSV file to the transaction fields below.
            </p>
            <p className="text-sm text-gray-600 mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
              <span className="font-semibold">Important:</span> For the "Type" field, your CSV column should contain values like "income", "expense", "credit", or "debit". "credit" will be mapped to "income", and "debit" to "expense".
            </p>

            <div className="mb-4">
              <label htmlFor="import-wallet-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Wallet for Imported Transactions:
              </label>
              <select
                id="import-wallet-select"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedImportWallet}
                onChange={(e) => setSelectedImportWallet(e.target.value)}
              >
                <option value="">-- Select a Wallet --</option>
                {wallets.map(wallet => (
                  <option key={wallet._id} value={wallet._id}>{wallet.name} ({wallet.currency} {wallet.balance.toFixed(2)})</option>
                ))}
              </select>
              {!selectedImportWallet && <p className="text-red-500 text-sm mt-1">Please select a wallet.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={columnMappings.description}
                  onChange={(e) => handleMappingChange('description', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={columnMappings.amount}
                  onChange={(e) => handleMappingChange('amount', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={columnMappings.category}
                  onChange={(e) => handleMappingChange('category', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={columnMappings.date}
                  onChange={(e) => handleMappingChange('date', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type (Income/Expense) <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={columnMappings.type}
                  onChange={(e) => handleMappingChange('type', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={columnMappings.notes}
                  onChange={(e) => handleMappingChange('notes', e.target.value)}
                >
                  <option value="">Select column</option>
                  {headers.map(header => <option key={header} value={header}>{header}</option>)}
                </select>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleImportSubmit}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-lg font-semibold ml-auto"
                disabled={!selectedImportWallet || headers.length === 0 || !columnMappings.description || !columnMappings.amount || !columnMappings.category || !columnMappings.date || !columnMappings.type}
              >
                Import Transactions
              </button>
            </div>
          </>
        )}

        {importStatus === 'processing' && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg">Importing transactions...</p>
          </div>
        )}

        {(importStatus === 'complete' || importStatus === 'error') && (
          <div className="text-center py-6">
            {importStatus === 'complete' ? (
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            ) : (
              <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Import Complete</h3>
            <p className="text-gray-700 text-lg">
              <span className="font-semibold text-green-600">{importResults.imported}</span> transactions imported.
            </p>
            {importResults.failed > 0 && (
              <p className="text-red-600 text-lg font-semibold">
                <span className="font-semibold">{importResults.failed}</span> failed.
              </p>
            )}

            {importResults.errors.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-indigo-600 hover:underline text-sm flex items-center mx-auto"
                >
                  {showErrors ? 'Hide Errors' : 'View Errors'} <FaArrowDown className={`ml-2 transition-transform ${showErrors ? 'rotate-180' : ''}`} />
                </button>
                {showErrors && (
                  <div className="bg-gray-100 border border-gray-200 p-4 rounded-md mt-4 text-left max-h-48 overflow-y-auto">
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {importResults.errors.map((err, index) => (
                        <li key={index} className="mb-1">{err.message || err.row ? `Row ${err.row}: ${err.message}` : err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition mt-8"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportTransactionsModal;
