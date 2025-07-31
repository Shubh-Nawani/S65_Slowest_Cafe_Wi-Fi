import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Coffee, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import axios from "axios";
import { useNotification } from '../contexts/NotificationContext';
import { Button, Input, Card } from '../components/ui';
import { animations } from '../utils/designSystem';
import BackgroundImage from '../assets/bg.jpg';

function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  // Check if user is already logged in
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (isAuth === 'true') {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (isSignup && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (isSignup) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const endpoint = isSignup 
        ? `${import.meta.env.VITE_BASE_URI}/api/users/signup` 
        : `${import.meta.env.VITE_BASE_URI}/api/users/login`;
    
      const apiData = {
        email: formData.email,
        password: formData.password
      };
      
      const response = await axios.post(endpoint, apiData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Handle successful response
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('authTimestamp', Date.now().toString());
      
      if (response.data?.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      success(
        isSignup ? 'Account created successfully!' : 'Welcome back!',
        'Authentication Success'
      );
      
      navigate("/home", { replace: true });
      
    } catch (err) {
      console.error("Auth error:", err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          if (error.path) {
            backendErrors[error.path] = error.msg;
          }
        });
        setErrors(backendErrors);
      } else if (err.response?.data?.error) {
        // Handle single error message from backend
        const errorMessage = err.response.data.error;
        if (errorMessage.includes('already exists')) {
          setErrors({ email: 'This email is already registered' });
        } else if (errorMessage.includes('Invalid credentials') || errorMessage.includes('User not found')) {
          setErrors({ 
            email: 'Invalid email or password',
            password: 'Invalid email or password'
          });
        } else {
          showError(errorMessage, 'Authentication Failed');
        }
      } else {
        showError(
          isSignup ? "Failed to create account. Please try again." : "Login failed. Please check your credentials.",
          'Authentication Failed'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative" 
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    > 
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      
      <motion.div 
        className="z-10 w-full max-w-md mx-4"
        initial="hidden"
        animate="visible"
        variants={animations.slideUp}
      >
        <Card className="p-8 backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-full mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Coffee className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Slowest Café WiFi
            </h1>
            <p className="text-gray-600 text-sm">
              Where slow internet brings people together
            </p>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignup ? 'signup' : 'login'}
              initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-center">
                  {isSignup ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Welcome Back
                    </>
                  )}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="your@email.com"
                  error={errors.email}
                  autoComplete="email"
                />
                
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    placeholder="Enter your password"
                    error={errors.password}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {isSignup && (
                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      icon={Lock}
                      placeholder="Confirm your password"
                      error={errors.confirmPassword}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}
                
                {/* Password requirements for signup */}
                {isSignup && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Password requirements:</p>
                        <ul className="space-y-0.5">
                          <li>• At least 8 characters long</li>
                          <li>• At least one uppercase letter (A-Z)</li>
                          <li>• At least one lowercase letter (a-z)</li>
                          <li>• At least one number (0-9)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button 
                    type="button"
                    onClick={toggleForm} 
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    {isSignup ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Admin Access Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={() => navigate('/admin-login')}
              className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center justify-center mx-auto"
            >
              <Coffee className="w-4 h-4 mr-1" />
              Admin Access
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default AuthForm;