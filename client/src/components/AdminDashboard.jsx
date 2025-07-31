import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Coffee, Plus, Search, LogOut, RefreshCw, User, Users } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// First, let's define the AddCafeModal component directly in this file to ensure proper prop passing
function AddCafeModal({ cafe, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: cafe ? cafe.name || '' : '',
    address: cafe ? cafe.address || '' : '',
    contact: cafe ? cafe.contact || '' : ''
  });

  useEffect(() => {
    // Update form data when cafe changes
    if (cafe) {
      setFormData({
        name: cafe.name || '',
        address: cafe.address || '',
        contact: cafe.contact || ''
      });
    }
  }, [cafe]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Make sure onSave is a function before calling it
    if (typeof onSave === 'function') {
      onSave(formData);
    } else {
      console.error('onSave is not a function', onSave);
      alert('Error: Unable to save cafe data. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <Coffee className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {cafe ? 'Edit Cafe' : 'Add New Cafe'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cafe-name" className="block text-gray-700 font-medium mb-2">
              Cafe Name
            </label>
            <input
              id="cafe-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cafe-address" className="block text-gray-700 font-medium mb-2">
              Address
            </label>
            <input
              id="cafe-address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="cafe-contact" className="block text-gray-700 font-medium mb-2">
              Contact
            </label>
            <input
              id="cafe-contact"
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              {cafe ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Import the X icon at the top level to avoid errors
import { X } from 'lucide-react';

function AdminDashboard() {
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCafe, setEditCafe] = useState(null);
  const [responseData, setResponseData] = useState(0);
  const [adminStats, setAdminStats] = useState({
    totalCafes: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';
  
  // Check admin authentication
  useEffect(() => {
    const isAdminAuth = localStorage.getItem('isAdminAuthenticated');
    if (isAdminAuth !== 'true') {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  // Fetch cafes and stats
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/cafes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setCafes(response.data || []);
      setResponseData(response.data || []);
      
      // Update admin stats
      setAdminStats({
        totalCafes: response.data?.length || 0,
        totalUsers: 24, // Demo value
        activeUsers: 8  // Demo value
      });
      
    } catch (err) {
      console.error('Error fetching cafes:', err);
      
      // Fallback to demo data if API fails
      const demoData = [
        { _id: '1', name: 'Slow Brew Coffee', address: '123 Lazy Lane', contact: '555-1234' },
        { _id: '2', name: 'Turtle Espresso', address: '456 Snail Street', contact: '555-5678' },
        { _id: '3', name: 'Dial-Up Internet Cafe', address: '789 Buffer Road', contact: '555-9012' }
      ];
      
      setCafes(demoData);
      setResponseData(demoData);
      
      setAdminStats({
        totalCafes: demoData.length,
        totalUsers: 24,
        activeUsers: 8
      });
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/admin-login'), 2000);
      } else {
        setError('Using demo data - API connection failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTimestamp');
    navigate('/admin-login', { replace: true });
  };

  // This is the function we'll pass as onSave
  const handleSaveCafe = async (cafeData) => {
    console.log("handleSaveCafe called with data:", cafeData);
    
    try {
      setIsLoading(true);
      
      // If we're editing an existing cafe
      if (editCafe) {
        try {
          await axios.put(
            `${import.meta.env.VITE_BASE_URI}/api/cafes`, 
            { _id: editCafe._id, ...cafeData },
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );
          
          // Update the state after successful API call
          setCafes(prevCafes => 
            prevCafes.map(cafe => 
              cafe._id === editCafe._id 
                ? { ...cafe, ...cafeData } 
                : cafe
            )
          );
          
          alert('Cafe updated successfully!');
        } catch (apiError) {
          console.error('API update failed:', apiError);
          
          if (apiError.response?.status === 401) {
            alert('Session expired. Please log in again.');
            navigate('/admin-login');
            return;
          } else if (apiError.response?.status === 403) {
            alert('You do not have permission to update cafes.');
            return;
          } else {
            // Update in frontend only as fallback
            setCafes(prevCafes => 
              prevCafes.map(cafe => 
                cafe._id === editCafe._id 
                  ? { ...cafe, ...cafeData } 
                  : cafe
              )
            );
            alert('Cafe updated locally (API unavailable)');
          }
        }
      } else {
        // Adding a new cafe
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URI}/api/cafes`, 
            cafeData,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );
          
          // Add the new cafe with the server-generated ID
          const newCafe = response.data;
          setCafes(prevCafes => [...prevCafes, newCafe]);
          
          // Update stats
          setAdminStats(prev => ({
            ...prev,
            totalCafes: prev.totalCafes + 1
          }));
          
          alert('New cafe added successfully!');
        } catch (apiError) {
          console.error('API create failed:', apiError);
          
          if (apiError.response?.status === 401) {
            alert('Session expired. Please log in again.');
            navigate('/admin-login');
            return;
          } else if (apiError.response?.status === 403) {
            alert('You do not have permission to add cafes.');
            return;
          } else {
            // Add in frontend only as fallback
            const newId = 'temp_' + Date.now();
            const newCafe = { _id: newId, ...cafeData };
            setCafes(prevCafes => [...prevCafes, newCafe]);
            alert('Cafe added locally (API unavailable)');
          }
        }
      }
      
      // Close modal and reset edit state
      setShowAddModal(false);
      setEditCafe(null);
    } catch (error) {
      console.error('Error in handleSaveCafe:', error);
      alert('Failed to save cafe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCafe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cafe?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await axios.delete(`${import.meta.env.VITE_BASE_URI}/api/cafes`, { 
        data: { _id: id },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      // Update state after successful deletion
      setCafes(prevCafes => prevCafes.filter(cafe => cafe._id !== id));
      
      // Update stats
      setAdminStats(prev => ({
        ...prev,
        totalCafes: Math.max(0, prev.totalCafes - 1)
      }));
      
      alert('Cafe deleted successfully!');
    } catch (apiError) {
      console.error('Error deleting cafe:', apiError);
      
      if (apiError.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/admin-login');
      } else if (apiError.response?.status === 403) {
        alert('You do not have permission to delete cafes.');
      } else if (apiError.response?.status === 404) {
        alert('Cafe not found. It may have already been deleted.');
        // Remove from local state anyway
        setCafes(prevCafes => prevCafes.filter(cafe => cafe._id !== id));
      } else {
        // Remove from frontend only as fallback
        setCafes(prevCafes => prevCafes.filter(cafe => cafe._id !== id));
        alert('Cafe deleted locally (API unavailable)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCafes = cafes.filter(cafe => 
    cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cafe.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm">Slowest Café WiFi Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="font-medium">{adminName}</p>
              <p className="text-xs opacity-80">Administrator</p>
            </div>
            
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Cafes</p>
                <h3 className="text-3xl font-bold">{adminStats.totalCafes}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Coffee className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="text-3xl font-bold">{adminStats.totalUsers}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Users</p>
                <h3 className="text-3xl font-bold">{adminStats.activeUsers}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <User className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
          
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search cafes..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => {
                setEditCafe(null);
                setShowAddModal(true);
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>Add New Cafe</span>
            </button>
            
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center"
              onClick={fetchData}
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Cafes Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500 text-center">
                <p className="text-lg font-semibold">{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
                  onClick={fetchData}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCafes.length > 0 ? (
                    filteredCafes.map((cafe) => (
                      <tr key={cafe._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Coffee className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{cafe.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cafe.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cafe.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditCafe(cafe);
                              setShowAddModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCafe(cafe._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No cafes found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
      
      {/* Modal - Simple implementation with direct function passing */}
      {showAddModal && (
        <AddCafeModal
          cafe={editCafe}
          onClose={() => {
            setShowAddModal(false);
            setEditCafe(null);
          }}
          onSave={handleSaveCafe}
        />
      )}
    </div>
  );
}

export default AdminDashboard;