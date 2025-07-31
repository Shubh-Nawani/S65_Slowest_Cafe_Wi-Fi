import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, ArrowLeft, Coffee, AlertCircle } from 'lucide-react';
import axios from "axios";
import { useNotification } from '../contexts/NotificationContext';
import { Button, Input, Card } from './ui';
import { animations } from '../utils/designSystem';
import BackgroundImage from '../assets/bg.jpg';

function AdminLogin() {
  const [adminKey, setAdminKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError, info } = useNotification();

  // Check if admin is already logged in
  useEffect(() => {
    const isAdminAuth = localStorage.getItem('isAdminAuthenticated');
    if (isAdminAuth === 'true') {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!adminKey.trim()) {
      showError("Admin key is required", "Validation Error");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Demo mode for development
      if (adminKey === "admin123") {
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminName', 'Demo Admin');
        localStorage.setItem('adminToken', 'demo-token-123');
        localStorage.setItem('adminTimestamp', Date.now().toString());
        
        success("Admin access granted! Welcome to the dashboard.", "Authentication Successful");
        navigate("/admin-dashboard", { replace: true });
        return;
      }
      
      // Verify admin key against backend
      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/admin/verify`, 
        { adminKey }, 
        { withCredentials: true }
      );
      
      if (response.data.isAdmin) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminName', response.data.adminName || 'Admin');
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminTimestamp', Date.now().toString());
        
        success("Admin access granted! Welcome to the dashboard.", "Authentication Successful");
        navigate("/admin-dashboard", { replace: true });
      } else {
        showError("Invalid admin key provided", "Authentication Failed");
      }
    } catch (err) {
      console.error("Admin auth error:", err);
      showError(
        err.response?.data?.message || "Authentication failed. Please check your admin key.",
        "Authentication Error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-orange-50 to-amber-50">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      />
      
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
            
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-coffee-600" />
              <span className="font-semibold text-gray-900">Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={animations.slideUp}
        >
          <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Administrator Access
              </h1>
              <p className="text-gray-600">
                Slowest Café WiFi Management Portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Admin Secret Key"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                icon={Key}
                placeholder="Enter your admin secret key"
                autoComplete="current-password"
                required
              />

              {/* Demo Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Demo Mode Available</p>
                    <p className="text-xs mb-2">
                      For testing purposes, you can use the demo admin key below:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                        admin123
                      </code>
                      <Button
                        type="button"
                        onClick={() => setAdminKey('admin123')}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                      >
                        Use Demo Key
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="purple"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Not an administrator?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
                >
                  Return to User Login
                </button>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Secure admin authentication powered by Slowest Café WiFi
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminLogin;