import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Coffee, Snail } from 'lucide-react';

function AddShop() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URI}/api/cafes`, {
        name,
        address,
        contact
      });
      
      alert('Shop added successfully!');
      navigate('/home');
    } catch (error) {
      console.error('Error adding shop:', error);
      alert('Failed to add shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="absolute top-4 left-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow hover:shadow-md transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
      
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-lg"
          whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <motion.div 
            className="flex items-center justify-center mb-6"
            variants={itemVariants}
          >
            <motion.div
              className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 3, 0, -3, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coffee className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-6 text-center text-gray-800"
            variants={itemVariants}
          >
            Add a Coffee Shop
          </motion.h2>
          
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2">Name</label>
              <motion.input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                required 
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2">Address</label>
              <motion.input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                required 
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2">Contact</label>
              <motion.input 
                type="text" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                required 
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <motion.button 
                type="submit" 
                className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-3 px-4 rounded-lg transition-colors`}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.03, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)" } : {}}
                whileTap={!isSubmitting ? { scale: 0.97 } : {}}
              >
                {isSubmitting ? (
                  <motion.div 
                    className="flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </motion.div>
                ) : 'Add Shop'}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
        
        <motion.div 
          className="mt-6 text-center text-gray-600"
          variants={itemVariants}
        >
          <p className="flex items-center justify-center gap-2">
            <Snail size={16} />
            <span>Slowest Café WiFi</span>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default AddShop;