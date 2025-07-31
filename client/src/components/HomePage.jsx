import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wifi, Coffee, Clock, Users, LogOut, Shield, ExternalLink, 
  Plus, Edit, Trash2, MapPin, Phone, Search, Filter, 
  BarChart3, TrendingUp, Globe, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import { Button, Input, Card, Modal } from './ui';
import { colors, animations } from '../utils/designSystem';
import FeatureCard from './FeatureCard';
import BackgroundImage from '../assets/bg.jpg';

function HomePage() {
  const [cafes, setCafes] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [showCafes, setShowCafes] = useState(false);
  const [editCafe, setEditCafe] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState({ name: '', address: '', contact: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalCafes: 0, avgSpeed: 0, happyCustomers: 0 });
  
  const navigate = useNavigate();
  const { success, error: showError, info } = useNotification();

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    const isAdminAuth = localStorage.getItem('isAdminAuthenticated');
    setIsAdmin(isAdminAuth === 'true');
    
    const storedEmail = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || storedEmail?.split('@')[0] || 'User');

    // Generate some stats for display
    setStats({
      totalCafes: Math.floor(Math.random() * 50) + 25,
      avgSpeed: Math.floor(Math.random() * 5) + 1,
      happyCustomers: Math.floor(Math.random() * 1000) + 500
    });
  }, [navigate]);

  // Filter cafes based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCafes(cafes);
    } else {
      const filtered = cafes.filter(cafe => 
        cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cafe.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCafes(filtered);
    }
  }, [cafes, searchTerm]);

  // Fetch cafes
  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/cafes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setCafes(response.data || []);
      setShowCafes(true);
      setStats(prev => ({
        ...prev,
        totalCafes: response.data?.length || 0
      }));
      
      info(`Found ${response.data?.length || 0} coffee shops`, 'Cafes Loaded');
    } catch (error) {
      console.error('Error fetching cafes:', error);
      
      // Fallback to demo data if API fails
      const demoData = [
        { _id: '1', name: 'Slow Brew Coffee', address: '123 Lazy Lane', contact: '5551234567' },
        { _id: '2', name: 'Turtle Espresso', address: '456 Snail Street', contact: '5555678901' },
        { _id: '3', name: 'Dial-Up Internet Cafe', address: '789 Buffer Road', contact: '5559012345' }
      ];
      
      setCafes(demoData);
      setShowCafes(true);
      setStats(prev => ({
        ...prev,
        totalCafes: demoData.length
      }));
      
      info('Using demo data - API connection failed', 'Demo Mode');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle cafes display
  const toggleCafesDisplay = () => {
    if (!showCafes) {
      fetchCafes();
    } else {
      setShowCafes(false);
      setSearchTerm('');
    }
  };

  // Handle edit cafe
  const handleEditCafe = (cafe) => {
    if (!isAdmin) {
      showError('You need administrator privileges to edit coffee shops', 'Access Denied');
      return;
    }
    setEditCafe(cafe);
    setUpdatedData({ 
      name: cafe.name, 
      address: cafe.address, 
      contact: cafe.contact 
    });
    setIsEditModalOpen(true);
  };

  // Update cafe
  const updateCafe = async () => {
    if (!editCafe) return;
    
    // Validation
    if (!updatedData.name?.trim()) {
      showError('Coffee shop name is required', 'Validation Error');
      return;
    }
    if (!updatedData.address?.trim()) {
      showError('Address is required', 'Validation Error');
      return;
    }
    if (!updatedData.contact?.trim()) {
      showError('Contact number is required', 'Validation Error');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URI}/api/cafes`, { 
        _id: editCafe._id, 
        ...updatedData 
      }, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      success('Coffee shop updated successfully!', 'Success');
      setIsEditModalOpen(false);
      setEditCafe(null);
      setUpdatedData({ name: '', address: '', contact: '' });
      
      // Update local state immediately for better UX
      setCafes(prevCafes => 
        prevCafes.map(cafe => 
          cafe._id === editCafe._id 
            ? { ...cafe, ...updatedData }
            : cafe
        )
      );
      
      // Refresh from server to ensure consistency
      if (showCafes) {
        fetchCafes();
      }
    } catch (error) {
      console.error('Error updating cafe:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update coffee shop. Please try again.';
      
      if (error.response?.status === 401) {
        showError('Session expired. Please log in again.', 'Authentication Error');
        handleLogout();
      } else if (error.response?.status === 403) {
        showError('You do not have permission to update coffee shops.', 'Access Denied');
      } else {
        showError(errorMessage, 'Update Failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete cafe
  const deleteCafe = async (id, name) => {
    if (!isAdmin) {
      showError('You need administrator privileges to delete coffee shops', 'Access Denied');
      return;
    }
    
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URI}/api/cafes`, { 
        data: { _id: id },
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      success(`"${name}" has been removed successfully!`, 'Deleted');
      
      // Update local state immediately
      setCafes(prevCafes => prevCafes.filter(cafe => cafe._id !== id));
      setStats(prev => ({
        ...prev,
        totalCafes: Math.max(0, prev.totalCafes - 1)
      }));
      
    } catch (error) {
      console.error('Error deleting cafe:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to delete coffee shop. Please try again.';
      
      if (error.response?.status === 401) {
        showError('Session expired. Please log in again.', 'Authentication Error');
        handleLogout();
      } else if (error.response?.status === 403) {
        showError('You do not have permission to delete coffee shops.', 'Access Denied');
      } else if (error.response?.status === 404) {
        showError('Coffee shop not found. It may have already been deleted.', 'Not Found');
        // Remove from local state anyway
        setCafes(prevCafes => prevCafes.filter(cafe => cafe._id !== id));
      } else {
        showError(errorMessage, 'Delete Failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTimestamp');
    
    navigate('/login', { replace: true });
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
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-coffee-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Slowest Café WiFi</span>
            </motion.div>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  as={Link}
                  to="/admin-dashboard"
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}
              
              <div className="hidden md:flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <p className="font-medium text-sm text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500">{getCurrentDate()}</p>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${BackgroundImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-coffee-900/40 to-orange-900/60" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={animations.container}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-coffee-500 to-orange-600 rounded-full mb-8"
              variants={animations.fadeIn}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Coffee className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              variants={animations.slideUp}
            >
              The Slowest Café WiFi
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-gray-200"
              variants={animations.slideUp}
            >
              Where connections between people matter more than internet connections
            </motion.p>

            {/* Stats Row */}
            <motion.div 
              className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8"
              variants={animations.slideUp}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-coffee-300">{stats.totalCafes}+</div>
                <div className="text-sm text-gray-300">Cafes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-coffee-300">{stats.avgSpeed}MB/s</div>
                <div className="text-sm text-gray-300">Avg Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-coffee-300">{stats.happyCustomers}+</div>
                <div className="text-sm text-gray-300">Happy Customers</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={animations.slideUp}
            >
              <Button
                onClick={toggleCafesDisplay}
                variant="coffee"
                size="lg"
                loading={isLoading}
                className="flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                {showCafes ? "Hide Locations" : "Find Our Locations"}
              </Button>
              
              {isAdmin && (
                <Button
                  as={Link}
                  to="/add-shop"
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Plus className="w-5 h-5" />
                  Add Coffee Shop
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-coffee-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.slideUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Slow WiFi?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the art of digital minimalism in our carefully curated slow-internet environments
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={animations.container}
          >
            <motion.div variants={animations.slideUp}>
              <FeatureCard 
                icon={<Clock className="w-8 h-8" />} 
                title="Time to Think" 
                description="Pages load so slowly, you'll have time to write your next novel between clicks" 
              />
            </motion.div>
            <motion.div variants={animations.slideUp}>
              <FeatureCard 
                icon={<Users className="w-8 h-8" />} 
                title="Real Conversations" 
                description="When streaming fails, people start talking to each other" 
              />
            </motion.div>
            <motion.div variants={animations.slideUp}>
              <FeatureCard 
                icon={<Coffee className="w-8 h-8" />} 
                title="Better Coffee" 
                description="Our WiFi is slow because we put all our energy into making perfect coffee" 
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Cafes Section */}
      <AnimatePresence>
        {showCafes && (
          <motion.section 
            className="py-20 bg-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                  Our Coffee Shop Locations
                </h2>
                
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    placeholder="Search cafes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                    className="w-64"
                  />
                  {isAdmin && (
                    <Button
                      as={Link}
                      to="/add-shop"
                      variant="coffee"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Shop
                    </Button>
                  )}
                </div>
              </div>

              {filteredCafes.length > 0 ? (
                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  layout
                >
                  {filteredCafes.map((cafe, index) => (
                    <motion.div
                      key={cafe._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-coffee-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <Coffee className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{cafe.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-amber-600">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Slow WiFi Certified</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{cafe.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{cafe.contact}</span>
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              onClick={() => handleEditCafe(cafe)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 flex-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteCafe(cafe._id, cafe.name)}
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="p-12 text-center">
                  <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No matching cafes found' : 'No cafes available'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'Be the first to add a coffee shop to our network'
                    }
                  </p>
                  {!searchTerm && isAdmin && (
                    <Button
                      as={Link}
                      to="/add-shop"
                      variant="coffee"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Coffee Shop
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-coffee-900 via-coffee-800 to-orange-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.slideUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Slow Down?
            </h2>
            <p className="text-lg mb-8 text-coffee-100">
              Join us for the world's most relaxing internet experience
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={toggleCafesDisplay}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {showCafes ? "Hide Locations" : "Explore Locations"}
              </Button>
              <Button
                as={Link}
                to="/speed-test"
                variant="secondary"
                size="lg"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Test Your Speed
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Coffee Shop"
      >
        <div className="space-y-4">
          <Input
            label="Coffee Shop Name"
            type="text"
            value={updatedData.name}
            onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
            placeholder="e.g., Slow Brew Café"
          />
          <Input
            label="Address"
            type="text"
            value={updatedData.address}
            onChange={(e) => setUpdatedData({ ...updatedData, address: e.target.value })}
            placeholder="e.g., 123 Main Street, City, State"
          />
          <Input
            label="Contact Number"
            type="text"
            value={updatedData.contact}
            onChange={(e) => setUpdatedData({ ...updatedData, contact: e.target.value })}
            placeholder="e.g., (555) 123-4567"
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={updateCafe}
              variant="coffee"
              loading={isLoading}
            >
              Update Coffee Shop
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Access Quick Link */}
      {!isAdmin && (
        <motion.div 
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            as={Link}
            to="/admin-login"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-white shadow-lg border"
          >
            <Shield className="w-4 h-4" />
            Admin Access
            <ExternalLink className="w-3 h-3" />
          </Button>
        </motion.div>
      )}
    </>
  );
}

export default HomePage;