import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import AuthForm from './components/AuthForm';
import HomePage from './components/HomePage';
import EnhancedHomePage from './components/EnhancedHomePage';
import UserDashboard from './components/UserDashboard';
import AddShop from './components/AddShop';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SpeedTestChart from './components/SpeedTestChart';

// ProtectedRoute component for user authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

// AdminRoute component for admin authentication
const AdminRoute = ({ children }) => {
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coffee-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<AuthForm />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              
              {/* Protected user routes */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                  <SpeedTestChart />
                </ProtectedRoute>
              } />
              
              {/* Enhanced user routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/enhanced" element={
                <ProtectedRoute>
                  <EnhancedHomePage />
                </ProtectedRoute>
              } />
              
              <Route path="/add-shop" element={
                <ProtectedRoute>
                  <AddShop />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Redirect routes */}
              <Route path="/" element={<Navigate to="/enhanced" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;