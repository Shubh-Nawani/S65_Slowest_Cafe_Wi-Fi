import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wifi, Coffee, Clock, Users, Snail, LogOut, Shield, ExternalLink } from 'lucide-react';
import BackgroundImage from '../assets/bg.jpg';
import FeatureCard from './FeatureCard';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function HomePage() {
  const [fakeShops, setFakeShops] = useState([]);
  const [showShops, setShowShops] = useState(false);
  const [editShop, setEditShop] = useState(null);
  const [updatedData, setUpdatedData] = useState({ name: '', address: '', contact: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Check if the user is an admin
    const isAdminAuth = localStorage.getItem('isAdminAuthenticated');
    setIsAdmin(isAdminAuth === 'true');
    
    // Get username from localStorage
    const storedEmail = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || storedEmail?.split('@')[0] || 'User');
  }, [navigate]);

  // Fetch Shops
  const fetchFakeShops = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/cafes`);
      setFakeShops(response.data);
      setShowShops(true);
    } catch (error) {
      console.error('Error fetching fake shops:', error);
      alert('Failed to fetch shops. Please try again.');
    }
  };

  // Toggle Shops Display
  const toggleShopsDisplay = () => {
    if (!showShops) {
      // If currently hidden, fetch latest data and show
      fetchFakeShops();
    } else {
      // If currently shown, just hide
      setShowShops(false);
    }
  };

  // Handle Update Function - Only for admins
  const updateCafe = async () => {
    if (!isAdmin) {
      alert('You need administrator privileges to update shops');
      return;
    }
    
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URI}/api/cafes`, { 
        _id: editShop._id, 
        ...updatedData 
      }, {
        headers: isAdmin ? { 
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        } : {}
      });
      
      alert('Cafe updated successfully!');
      setEditShop(null); // Close the modal
      
      // Refresh the shop list if shops are currently being displayed
      if (showShops) {
        fetchFakeShops();
      }
    } catch (error) {
      console.error('Error updating cafe:', error);
      alert('Failed to update cafe. Please try again.');
    }
  };

  // Delete Shop Function - Only for admins
  const deleteCafe = async (id) => {
    if (!isAdmin) {
      alert('You need administrator privileges to delete shops');
      return;
    }
    
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URI}/api/cafes`, { 
        data: { _id: id },
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        }
      });
      
      alert('Cafe deleted successfully!');
      setFakeShops(fakeShops.filter(shop => shop._id !== id));
    } catch (error) {
      console.error('Error deleting cafe:', error);
      alert('Failed to delete cafe. Please try again.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    
    // Also clear admin authentication if it exists
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTimestamp');
    
    // Navigate to login page with replace to prevent back navigation
    navigate('/login', { replace: true });
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideUp = {
    hidden: { y: 60, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: 0.2
      } 
    }
  };

  const shopCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Header with Navbar */}
      <div className="fixed top-0 w-full bg-white shadow-md z-40 px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Snail className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl">Slowest Café WiFi</span>
          </div>
          
          <div className="flex items-center gap-6">
            {isAdmin && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/admin-dashboard" 
                  className="flex items-center text-purple-600 font-medium hover:text-purple-800 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin Panel
                </Link>
              </motion.div>
            )}
            
            <div className="border-l pl-4 hidden md:flex items-center gap-2">
              <div className="text-right">
                <p className="font-medium">{username || 'User'}</p>
                <p className="text-xs text-gray-500">{getCurrentDate()}</p>
              </div>
            </div>
            
            <motion.button 
              onClick={handleLogout} 
              className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="h-screen bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${BackgroundImage})` }}>
        <motion.div 
          className="absolute inset-0 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20, 
              delay: 0.3 
            }}
          >
            <Snail className="w-16 h-16 mb-6" />
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9],
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 3, 
                ease: "easeInOut" 
              }}
              className="absolute -inset-4 -z-10 opacity-30"
            >
              {/* Glow effect */}
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4 text-center"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            The Slowest Café WiFi
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-center max-w-2xl mb-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Where connections between people matter more than internet connections
          </motion.p>
          
          {isAdmin && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link to="/add-shop">
                <motion.button 
                  className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
                  whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Shop
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
        
        {/* Background animation effects */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent opacity-40"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1.5, delay: 1 }}
        />
      </div>

      {/* Features Section */}
      <div className="pt-28 pb-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Why Choose Our Slow WiFi?
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
          >
            <motion.div variants={slideUp}>
              <FeatureCard icon={<Clock />} title="Time to Think" description="Pages load so slowly, you'll have time to write your next novel between clicks" />
            </motion.div>
            <motion.div variants={slideUp}>
              <FeatureCard icon={<Users />} title="Real Conversations" description="When streaming fails, people start talking to each other" />
            </motion.div>
            <motion.div variants={slideUp}>
              <FeatureCard icon={<Coffee />} title="Better Coffee" description="Our WiFi is slow because we put all our energy into making perfect coffee" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#2A2922] text-white py-16 px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            variants={slideUp}
          >
            Ready to Slow Down?
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-8"
            variants={slideUp}
          >
            Join us for the world's most relaxing internet experience
          </motion.p>
          
          <motion.button 
            className="bg-[#D4A373] hover:bg-[#C29365] text-white font-bold py-3 px-8 rounded-full transition duration-300"
            onClick={toggleShopsDisplay}
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            variants={slideUp}
          >
            {showShops ? "Hide Shops" : "Find Our Locations"}
          </motion.button>

          <AnimatePresence>
            {showShops && (
              <motion.div 
                className="mt-8"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.5,
                  opacity: { duration: 0.3 }
                }}
              >
                {fakeShops.length > 0 ? (
                  <motion.div layout>
                    {fakeShops.map((shop, index) => (
                      <motion.div 
                        key={shop._id} 
                        className="bg-white p-6 rounded-lg shadow-md mb-4 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        variants={shopCardVariants}
                      >
                        <h3 className="text-xl font-bold mb-2 text-gray-800">{shop.name}</h3>
                        <p className="text-gray-600">📍 {shop.address}</p>
                        <p className="text-gray-600">📞 {shop.contact}</p>
                        
                        {isAdmin && (
                          <div className="mt-4 flex gap-4">
                            <motion.button
                              onClick={() => {
                                setEditShop(shop);
                                setUpdatedData({ 
                                  name: shop.name, 
                                  address: shop.address, 
                                  contact: shop.contact 
                                });
                              }}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => deleteCafe(shop._id)}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Delete
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p 
                    className="text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    No shops available. Click the button to load.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Edit Modal - Only shown to admins */}
      <AnimatePresence>
        {editShop && isAdmin && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-lg w-96"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-bold mb-4">Edit Cafe</h2>
              <input
                type="text"
                value={updatedData.name}
                onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cafe Name"
              />
              <input
                type="text"
                value={updatedData.address}
                onChange={(e) => setUpdatedData({ ...updatedData, address: e.target.value })}
                className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Address"
              />
              <input
                type="text"
                value={updatedData.contact}
                onChange={(e) => setUpdatedData({ ...updatedData, contact: e.target.value })}
                className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact"
              />
              <div className="flex justify-end">
                <motion.button 
                  className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setEditShop(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={updateCafe}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Admin Access Quick Link */}
      {!isAdmin && (
        <motion.div 
          className="fixed bottom-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Link to="/admin-login">
            <motion.button 
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-2 px-3 rounded-full shadow-md"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield size={14} />
              <span>Admin Access</span>
              <ExternalLink size={12} />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </>
  );
}

export default HomePage;