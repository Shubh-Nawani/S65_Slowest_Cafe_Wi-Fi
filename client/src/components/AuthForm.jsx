import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackgroundImage from '../assets/bg.jpg';
import { Snail, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (isAuth === 'true') {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError(null); // Clear any errors when switching forms
    setFormData({
      email: '',
      password: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Form validation function
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (isSignup) {
      if (!formData.username) {
        setError("Username is required");
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    // Prepare data for API based on form type
    const apiData = isSignup 
      ? { username: formData.username, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      // Determine API endpoint
      const endpoint = isSignup 
        ? `${import.meta.env.VITE_BASE_URI}/api/users/signup` 
        : `${import.meta.env.VITE_BASE_URI}/api/users/login`;
    
      console.log(`Submitting to ${endpoint}`, apiData);
      
      const response = await axios.post(endpoint, apiData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Auth response:", response);
      
      // Handle successful response
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData.email);
      
      if (isSignup && formData.username) {
        localStorage.setItem('username', formData.username);
      }
      
      // Store user data if available from response
      if (response.data && response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      // Add timestamp for potential token expiration check
      localStorage.setItem('authTimestamp', Date.now().toString());
      
      // Navigate to home
      navigate("/home", { replace: true });
      
    } catch (err) {
      console.error("Auth error:", err);
      
      // Enhanced error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.message || 
                (isSignup ? "Signup failed. Please try again." : "Invalid email or password."));
        console.log("Error response:", err.response);
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your internet connection.");
        console.log("Error request:", err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An unexpected error occurred. Please try again.");
        console.log("Error:", err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative" 
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    > 
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      <motion.div 
        className="z-10 bg-white p-8 rounded-lg shadow-lg w-96 max-w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <Snail className="w-16 h-16 text-blue-500 mb-2" />
            <motion.div
              className="absolute -inset-1 -z-10 opacity-40"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-20 h-20 text-blue-300" />
            </motion.div>
          </motion.div>
          <h1 className="text-3xl font-bold text-center">
            Slowest Café WiFi
          </h1>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignup ? 'signup' : 'login'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
              {isSignup ? (
                <>
                  <UserPlus size={20} className="mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn size={20} className="mr-2" />
                  Welcome Back
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="Your username"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  placeholder="********"
                />
                {isSignup && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>
              
              {isSignup && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    placeholder="********"
                  />
                </div>
              )}
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                type="submit" 
                className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 px-4 rounded-lg transition-colors`}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  isSignup ? 'Create Account' : 'Log In'
                )}
              </motion.button>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isSignup ? "Already have an account?" : "Don't have an account?"} 
                  <button 
                    type="button"
                    onClick={toggleForm} 
                    className="text-blue-500 hover:underline ml-1 font-medium"
                  >
                    {isSignup ? "Log In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
        
        {/* Debug mode toggle */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Check your network connection and try again.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthForm;