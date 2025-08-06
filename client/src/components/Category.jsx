import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa'; // Removed FaTags

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // For editing
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('expense'); // 'expense' or 'income'
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
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
      } else {
        setError(data.message || 'Failed to fetch categories.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Network error while fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentCategory(null); // Clear for add mode
    setCategoryName('');
    setCategoryType('expense');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryType(category.type);
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

    if (!categoryName || !categoryType) {
      setModalError('Category name and type are required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setModalError('Authentication token missing. Please log in again.');
      return;
    }

    const categoryData = {
      name: categoryName,
      type: categoryType,
    };

    try {
      let response;
      if (currentCategory) {
        // Update existing category
        response = await fetch(`http://localhost:5000/api/categories/${currentCategory._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });
      } else {
        // Add new category
        response = await fetch('http://localhost:5000/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setModalSuccess(`Category ${currentCategory ? 'updated' : 'added'} successfully!`);
        fetchCategories(); // Refresh the list
        setTimeout(() => closeModal(), 1500);
      } else {
        setModalError(data.message || `Failed to ${currentCategory ? 'update' : 'add'} category.`);
      }
    } catch (err) {
      console.error('Error submitting category:', err);
      setModalError('Network error or server unavailable.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCategories(categories.filter(category => category._id !== id));
        alert('Category deleted successfully!'); // Use alert for simplicity here
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete category.');
      }
      fetchCategories(); // Re-fetch to ensure predefined categories are still there
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Network error or server unavailable.');
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  const predefined = categories.filter(cat => cat.isPredefined);
  const customCategories = categories.filter(cat => !cat.isPredefined);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)] flex flex-col">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h2>

      <div className="mb-6">
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center gap-2 text-lg font-semibold"
        >
          <FaPlus /> Add New Category
        </button>
      </div>

      {/* Predefined Categories Section */}
      {predefined.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-700 mb-4">Predefined Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefined.map(cat => (
              <div key={cat._id || cat.name} className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <span className="text-lg font-medium text-gray-800">{cat.name}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.type === 'expense' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                  {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Categories Section */}
      <h3 className="text-2xl font-bold text-gray-700 mb-4">Your Custom Categories</h3>
      {customCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-lg mb-4">You haven't added any custom categories yet.</p>
          <button
            onClick={openAddModal}
            className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            + Create Your First Custom Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customCategories.map(cat => (
            <div key={cat._id} className="bg-white border border-indigo-200 rounded-lg p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-lg font-medium text-gray-800">{cat.name}</span>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${cat.type === 'expense' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                  {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="text-blue-600 hover:text-blue-800 transition"
                  aria-label={`Edit ${cat.name}`}
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-600 hover:text-red-800 transition"
                  aria-label={`Delete ${cat.name}`}
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
              aria-label="Close category form"
            >
              <FaTimes size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {currentCategory ? 'Edit Category' : 'Add New Category'}
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
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="categoryType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="categoryType"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <FaSave /> {currentCategory ? 'Update Category' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
