import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Coffee, Clock, Users, Snail } from 'lucide-react';
import BackgroundImage from '../assets/bg.jpg';
import FeatureCard from './FeatureCard';
import axios from 'axios';

function HomePage() {
  const [fakeShops, setFakeShops] = useState([]);
  const [showShops, setShowShops] = useState(false);
  const [editShop, setEditShop] = useState(null);
  const [updatedData, setUpdatedData] = useState({ name: '', address: '', contact: '' });

  // Fetch Shops
  const fetchFakeShops = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/cafe`);
      setFakeShops(response.data);
      setShowShops(true);
    } catch (error) {
      console.error('Error fetching fake shops:', error);
      alert('Failed to fetch shops. Please try again.');
    }
  };

  // Handle Update Function
  const updateCafe = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URI}/api/cafe`, { _id: editShop._id, ...updatedData });
      alert('Cafe updated successfully!');
      setEditShop(null); // Close the modal
      fetchFakeShops();  // Refresh the shop list
    } catch (error) {
      console.error('Error updating cafe:', error);
      alert('Failed to update cafe. Please try again.');
    }
  };

  // Delete Shop Function
  const deleteCafe = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URI}/api/cafe`, { data: { _id: id } });
      alert('Cafe deleted successfully!');
      setFakeShops(fakeShops.filter(shop => shop._id !== id));
    } catch (error) {
      console.error('Error deleting cafe:', error);
      alert('Failed to delete cafe. Please try again.');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="h-screen bg-cover bg-center relative" style={{ backgroundImage: `url(${BackgroundImage})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <Snail className="w-16 h-16 mb-6 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center">The Slowest Café WiFi</h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl mb-8">
            Where connections between people matter more than internet connections
          </p>
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
            <FeatureCard icon={<Clock />} title="Time to Think" description="Pages load so slowly, you'll have time to write your next novel between clicks" />
            <FeatureCard icon={<Users />} title="Real Conversations" description="When streaming fails, people start talking to each other" />
            <FeatureCard icon={<Coffee />} title="Better Coffee" description="Our WiFi is slow because we put all our energy into making perfect coffee" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#2A2922] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Slow Down?</h2>
          <p className="text-lg mb-8">Join us for the world's most relaxing internet experience</p>
          
          <button className="bg-[#D4A373] hover:bg-[#C29365] text-white font-bold py-3 px-8 rounded-full transition duration-300" onClick={fetchFakeShops}>
            {showShops ? "Hide Shops" : "Find Our Locations"}
          </button>

          {showShops && (
            <div className="mt-8">
              {fakeShops.length > 0 ? (
                fakeShops.map((shop) => (
                  <div key={shop._id} className="bg-white p-6 rounded-lg shadow-md mb-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{shop.name}</h3>
                    <p className="text-gray-600">📍 {shop.address}</p>
                    <p className="text-gray-600">📞 {shop.contact}</p>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => {
                          setEditShop(shop);
                          setUpdatedData({ name: shop.name, address: shop.address, contact: shop.contact });
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCafe(shop._id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No shops available. Click the button to load.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editShop && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Cafe</h2>
            <input
              type="text"
              value={updatedData.name}
              onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
              className="w-full border p-2 mb-2"
              placeholder="Cafe Name"
            />
            <input
              type="text"
              value={updatedData.address}
              onChange={(e) => setUpdatedData({ ...updatedData, address: e.target.value })}
              className="w-full border p-2 mb-2"
              placeholder="Address"
            />
            <input
              type="text"
              value={updatedData.contact}
              onChange={(e) => setUpdatedData({ ...updatedData, contact: e.target.value })}
              className="w-full border p-2 mb-4"
              placeholder="Contact"
            />
            <div className="flex justify-end">
              <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={() => setEditShop(null)}>Cancel</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={updateCafe}>Update</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomePage;
