import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackgroundImage from '../assets/bg.jpg';
import { Shield, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdminLogin() {
  const [adminKey, setAdminKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const isAdminAuth = localStorage.getItem('isAdminAuthenticated');
    if (isAdminAuth === 'true') {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!adminKey.trim()) {
      setError("Admin key is required");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // For demo purposes, allow a hardcoded admin key - REMOVE IN PRODUCTION
      if (adminKey === "admin123") { // This is just for demonstration!
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminName', 'Demo Admin');
        localStorage.setItem('adminToken', 'demo-token-123');
        localStorage.setItem('adminTimestamp', Date.now().toString());
        
        navigate("/admin-dashboard", { replace: true });
        return;
      }
      
      // Verify admin key against your backend
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/admin/verify`, 
        { adminKey }, 
        { withCredentials: true }
      );
      
      // If verification is successful
      if (response.data.isAdmin) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminName', response.data.adminName || 'Admin');
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminTimestamp', Date.now().toString());
        
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Invalid admin key");
      }
    } catch (err) {
      console.error("Admin auth error:", err);
      setError(err.response?.data?.message || "Authentication failed. Invalid admin key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    > 
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="z-10 bg-white p-8 rounded-lg shadow-lg w-96 max-w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-center">Admin Access</h1>
          <p className="text-gray-600 text-center">Slowest Café WiFi Management</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Admin Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={adminKey} 
                onChange={(e) => setAdminKey(e.target.value)} 
                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
                placeholder="Enter admin secret key"
                required
              />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            type="submit" 
            className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold py-3 px-4 rounded-lg transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </div>
            ) : "Access Admin Panel"}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Not an admin?{" "}
              <button 
                type="button"
                onClick={() => navigate('/login')} 
                className="text-purple-600 hover:underline font-medium"
              >
                Return to Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;