import React from 'react';
import { motion } from 'framer-motion';

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
      whileHover={{ 
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <motion.div 
        className="w-12 h-12 bg-[#D4A373] rounded-full flex items-center justify-center mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        <motion.div 
          className="text-white"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          {icon}
        </motion.div>
      </motion.div>
      <motion.h3 
        className="text-xl font-bold mb-3 text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

export default FeatureCard;