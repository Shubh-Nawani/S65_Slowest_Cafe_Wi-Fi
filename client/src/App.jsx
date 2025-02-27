import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthForm from './components/AuthForm'; // Import the AuthForm component
import HomePage from './components/HomePage'; // Assuming you have a HomePage component
import AddShop from './components/AddShop';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDF8F3]">
        <Routes>
          <Route path="/" element={<AuthForm />} /> {/* AuthForm as the main route */}
          <Route path="/home" element={<HomePage />} /> {/* Home page route */}
          <Route path="add-shop" element={<AddShop/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;