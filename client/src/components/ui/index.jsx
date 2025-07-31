import React, { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Star, Heart, MapPin, Wifi, Clock, Users, ChevronDown, Search, Filter, X } from 'lucide-react';

// Utility function for combining classes
const cn = (...classes) => clsx(classes);

// Button Component with enhanced variants
export const Button = forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className,
  as: Component = 'button',
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg",
    coffee: "bg-coffee-600 text-white hover:bg-coffee-700 focus:ring-coffee-500 shadow-md hover:shadow-lg",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 shadow-sm",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-primary-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg",
    purple: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-md hover:shadow-lg"
  };
  
  const sizes = {
    xs: "px-2 py-1 text-xs rounded",
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl"
  };
  
  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    loading && "cursor-wait",
    className
  );
  
  if (Component === 'button') {
    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Loading...
          </>
        ) : children}
      </motion.button>
    );
  }
  
  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

Button.displayName = 'Button';

// Enhanced Input Component with more features
export const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className, 
  type = 'text',
  variant = 'default',
  hint,
  ...props 
}, ref) => {
  const variants = {
    default: "border-gray-300 focus:ring-primary-500 focus:border-primary-500",
    success: "border-green-300 focus:ring-green-500 focus:border-green-500",
    warning: "border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500",
    error: "border-red-500 focus:ring-red-500 focus:border-red-500"
  };
  
  const inputClasses = cn(
    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900 placeholder-gray-400",
    Icon && "pl-10",
    error ? variants.error : variants[variant],
    className
  );
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <motion.p 
          className="text-sm text-red-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Enhanced Card Component with hover effects
export const Card = forwardRef(({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-white border-gray-200",
    elevated: "bg-white border-gray-200 shadow-lg",
    bordered: "bg-white border-2 border-gray-200",
    glass: "bg-white/80 backdrop-blur-md border-white/20"
  };
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-lg border shadow-sm transition-all duration-200",
        variants[variant],
        hover && "hover:shadow-md hover:-translate-y-1",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

// Enhanced Modal Component
export const Modal = ({ isOpen, onClose, title, children, className, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className={cn(
            "relative bg-white rounded-xl shadow-2xl w-full p-6",
            sizes[size],
            className
          )}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className }) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <motion.div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-primary-600", 
        sizes[size], 
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// Enhanced Badge Component
export const Badge = ({ children, variant = 'default', size = 'md', className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    coffee: 'bg-coffee-100 text-coffee-800',
    purple: 'bg-purple-100 text-purple-800',
    blue: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};

// Café Card Component
export const CafeCard = ({ cafe, onFavorite, onRate, onEdit, onDelete, isAdmin, isFavorite }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-coffee-500 to-orange-600 rounded-lg flex items-center justify-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Wifi className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{cafe.name}</h3>
              <div className="flex items-center gap-2">
                {cafe.rating?.average > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {cafe.rating.average.toFixed(1)} ({cafe.rating.count})
                    </span>
                  </div>
                ) : (
                  <Badge variant="default" size="sm">New</Badge>
                )}
                {cafe.isSlowWifi && (
                  <Badge variant="coffee" size="sm">Certified Slow</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFavorite(cafe._id)}
              className="p-2"
            >
              <Heart className={cn(
                "w-4 h-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              )} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="p-2"
            >
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{cafe.address}</span>
          </div>
          
          {cafe.wifiSpeed && (
            <div className="flex items-center gap-2 text-gray-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">
                {cafe.wifiSpeed.download}↓ / {cafe.wifiSpeed.upload}↑ Mbps
              </span>
            </div>
          )}
          
          {cafe.distanceFromUser && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{cafe.distanceFromUser} km away</span>
            </div>
          )}
        </div>
        
        {/* Expanded Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-4 space-y-3"
            >
              {cafe.description && (
                <p className="text-sm text-gray-600">{cafe.description}</p>
              )}
              
              {cafe.amenities && cafe.amenities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-1">
                    {cafe.amenities.map((amenity, index) => (
                      <Badge key={index} variant="blue" size="sm">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {cafe.operatingHours && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Hours</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {cafe.operatingHours.monday?.open} - {cafe.operatingHours.monday?.close}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRate(cafe)}
              className="flex items-center gap-1"
            >
              <Star className="w-3 h-3" />
              Rate
            </Button>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(cafe)}
                className="flex items-center gap-1"
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(cafe._id, cafe.name)}
                className="flex items-center gap-1"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Search and Filter Component
export const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange,
  className 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search cafes by name, address..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={Search}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>
      
      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => onFilterChange({ ...filters, minRating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any rating</option>
                <option value="1">1+ stars</option>
                <option value="2">2+ stars</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max WiFi Speed (Mbps)
              </label>
              <select
                value={filters.maxSpeed || ''}
                onChange={(e) => onFilterChange({ ...filters, maxSpeed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any speed</option>
                <option value="1">Ultra Slow (≤1 Mbps)</option>
                <option value="3">Very Slow (≤3 Mbps)</option>
                <option value="5">Slow (≤5 Mbps)</option>
                <option value="10">Moderate (≤10 Mbps)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="rating.average">Highest Rated</option>
                <option value="wifiSpeed.download">Slowest WiFi</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Statistics Display Component
export const StatsDisplay = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  const statItems = [
    { label: 'Total Cafés', value: stats.totalCafes || 0, color: 'coffee' },
    { label: 'Avg Rating', value: stats.avgRating ? `${stats.avgRating.toFixed(1)} ⭐` : 'N/A', color: 'yellow' },
    { label: 'Avg WiFi Speed', value: stats.avgSpeed ? `${stats.avgSpeed} Mbps` : 'N/A', color: 'blue' },
    { label: 'Happy Customers', value: stats.happyCustomers || 0, color: 'green' }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-coffee-600 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};