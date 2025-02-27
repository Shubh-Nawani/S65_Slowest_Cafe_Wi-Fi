import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackgroundImage from '../assets/bg.jpg';


function AuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleForm = () => setIsSignup(!isSignup);

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Create formData object
    const formData = { email, password };

    try {
      const endpoint = isSignup 
      ? `${import.meta.env.VITE_BASE_URI}/api/users/signup` 
      : `${import.meta.env.VITE_BASE_URI}/api/users/login`;
  

      await axios.post(endpoint, formData, { withCredentials: true });

      navigate("/home");
      
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false); // Ensure submitting state is reset
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    > 
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">{isSignup ? "Sign Up" : "Log In"}</h2>
        <label className="block mb-2">Email</label>
        <input 
          type="text" 
          name="email"
          value={email} 
          onChange={handleChange} 
          className="w-full p-2 border rounded mb-4" 
          required 
        />
        <label className="block mb-2">Password</label>
        <input 
          type="password" 
          name="password"
          value={password} 
          onChange={handleChange} 
          className="w-full p-2 border rounded mb-4" 
          required 
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button 
          type="submit" 
          className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded transition-colors`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : (isSignup ? 'Sign Up' : 'Log In')}
        </button>
        <p className="mt-4 text-center">
          {isSignup ? "Already have an account?" : "Don't have an account?"} 
          <button 
            type="button" // Prevents form submission when toggling
            onClick={toggleForm} 
            className="text-blue-500 hover:underline"
          >
            {isSignup ? " Log In" : " Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default AuthForm;
