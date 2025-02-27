import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Coffee, Clock, Users, Snail } from 'lucide-react';
import BackgroundImage from '../assets/bg.jpg'
import FeatureCard from './FeatureCard';
import axios from 'axios';

function HomePage() {
  const [fakeShops, setFakeShops] = useState([]);
  const [showShops, setShowShops] = useState(false);

  const fetchFakeShops = async () => {
    if (fakeShops.length === 0) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/cafe`);
        setFakeShops(response.data);
      } catch (error) {
        console.error('Error fetching fake shops:', error);
        alert('Failed to fetch shops. Please try again.');
      }
    }
    setShowShops(prev => !prev);
  };

  return (
    <>
      {/* Hero Section */}
      <div 
        className="h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <Snail className="w-16 h-16 mb-6 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center">The Slowest Café WiFi</h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl mb-8">
            Where connections between people matter more than internet connections
          </p>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Wifi className="w-5 h-5" />
            <div className="w-16 bg-white/30 h-2 rounded-full">
              <div className="w-1 h-full bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <Link to="/add-shop" className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Add Shop
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">Why Choose Our Slow WiFi?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock />}
              title="Time to Think"
              description="Pages load so slowly, you'll have time to write your next novel between clicks"
            />
            <FeatureCard 
              icon={<Users />}
              title="Real Conversations"
              description="When streaming fails, strange things happen - people start talking to each other"
            />
            <FeatureCard 
              icon={<Coffee />}
              title="Better Coffee"
              description="Our WiFi is slow because we put all our energy into making perfect coffee"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#2A2922] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Slow Down?</h2>
          <p className="text-lg mb-8">Join us for the world's most relaxing internet experience</p>
          
          <button 
            className="bg-[#D4A373] hover:bg-[#C29365] text-white font-bold py-3 px-8 rounded-full transition duration-300"
            onClick={fetchFakeShops}
          >
            {showShops ? "Hide Shops" : "Find Our Locations"}
          </button>

          {showShops && (
            <div className="mt-8">
              {fakeShops.length > 0 ? (
                fakeShops.map((shop, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md mb-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{shop.name}</h3>
                    <p className="text-gray-600">📍 {shop.address}</p>
                    <p className="text-gray-600">📞 {shop.contact}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No shops available. Click the button to load.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/70 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2025 The Slowest Café WiFi. Loading times may vary.</p>
          <p className="text-sm mt-2">Our WiFi is powered by a hamster on a wheel (we feed him well)</p>
        </div>
      </footer>
    </>
  );
}

export default HomePage;