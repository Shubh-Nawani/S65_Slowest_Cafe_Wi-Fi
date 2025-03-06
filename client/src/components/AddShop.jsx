import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddShop() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URI}/api/cafes`, {
        name,
        address,
        contact
      });
      
      alert('Shop added successfully!');
      navigate('/home');
    } catch (error) {
      console.error('Error adding shop:', error);
      alert('Failed to add shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Add a Coffee Shop</h2>
        <label className="block mb-2">Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full p-2 border rounded mb-4" 
          required 
        />
        <label className="block mb-2">Address</label>
        <input 
          type="text" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          className="w-full p-2 border rounded mb-4" 
          required 
        />
        <label className="block mb-2">Contact</label>
        <input 
          type="text" 
          value={contact} 
          onChange={(e) => setContact(e.target.value)} 
          className="w-full p-2 border rounded mb-4" 
          required 
        />
        <button 
          type="submit" 
          className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded transition-colors`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default AddShop;