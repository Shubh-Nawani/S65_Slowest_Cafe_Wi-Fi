import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Coffee, MapPin, Phone, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import { Button, Input, Card } from './ui';
import { animations } from '../utils/designSystem';

function AddShop() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Cafe name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Cafe name must be at least 3 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) {
      newErrors.contact = 'Please enter a valid 10-digit phone number';
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
      // Clean contact number (remove non-digits)
      const cleanContact = formData.contact.replace(/\D/g, '');
      
      const submitData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        contact: cleanContact
      };

      const response = await axios.post(`${import.meta.env.VITE_BASE_URI}/api/cafes`, submitData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      success(`"${submitData.name}" has been added successfully!`, 'Coffee Shop Added');
      
      // Reset form
      setFormData({ name: '', address: '', contact: '' });
      setErrors({});
      
      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('Error adding shop:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path || err.param) {
            const field = err.path || err.param;
            backendErrors[field] = err.msg || err.message;
          }
        });
        setErrors(backendErrors);
        showError('Please fix the validation errors below', 'Validation Failed');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to add coffee shop. Please try again.';
        
        if (error.response?.status === 401) {
          showError('Session expired. Please log in again.', 'Authentication Error');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('authToken');
          navigate('/login');
        } else if (error.response?.status === 403) {
          showError('You do not have permission to add coffee shops.', 'Access Denied');
        } else if (error.response?.status === 409) {
          showError('A coffee shop with this name already exists.', 'Duplicate Entry');
        } else {
          showError(errorMessage, 'Add Failed');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate('/home')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-coffee-600" />
              <span className="font-semibold text-gray-900">Add Coffee Shop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={animations.slideUp}
        >
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coffee-500 to-orange-600 rounded-full mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Coffee className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Add Coffee Shop
              </h1>
              <p className="text-gray-600">
                Share another location with slow WiFi and great coffee
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Coffee Shop Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={Coffee}
                placeholder="e.g., Slow Brew Café"
                error={errors.name}
                autoComplete="organization"
              />

              <Input
                label="Address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                icon={MapPin}
                placeholder="e.g., 123 Main Street, City, State"
                error={errors.address}
                autoComplete="street-address"
              />

              <Input
                label="Contact Number"
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                icon={Phone}
                placeholder="e.g., (555) 123-4567"
                error={errors.contact}
                autoComplete="tel"
              />

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Submission Guidelines:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Ensure the coffee shop actually exists</li>
                      <li>• Provide accurate contact information</li>
                      <li>• Include complete address with city and state</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="coffee"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding Coffee Shop...' : 'Add Coffee Shop'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Coffee className="w-3 h-3" />
                Slowest Café WiFi Network
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default AddShop;