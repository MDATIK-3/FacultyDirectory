import React from "react";
import { motion } from "framer-motion";
import { BsTelephone, BsEnvelope, BsCode } from "react-icons/bs";

const FacultyCard = ({ name, designation, contactNo, email, code, imgSrc, query }) => {
  const highlightCode = query && code.toLowerCase().includes(query.toLowerCase());

  return (
    <motion.div
      className="faculty-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    >
      <div
        className="relative overflow-hidden rounded-xl mb-4 w-full bg-gray-100 dark:bg-gray-700"
        style={{ height: "250px" }}
      >
        {imgSrc ? (
          <motion.img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl">
            <span className="text-4xl text-white font-bold">{name.charAt(0)}</span>
          </div>
        )}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-4 text-center group"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm truncate group-hover:whitespace-normal group-hover:bg-opacity-75">
            {designation}
          </p>
        </motion.div>

      </div>
      <motion.h2
        className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 truncate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {name}
      </motion.h2>
      <motion.div
        className={`mb-3 flex items-center ${highlightCode ? 'text-orange-500' : 'text-gray-600'
          }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <BsCode className="mr-2 text-blue-500" />
        <span className="text-lg font-medium">Code: {code}</span>
      </motion.div>
      <motion.div
        className="flex items-center mb-2 text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <BsTelephone className="mr-2" />
        <p className="truncate">{contactNo}</p>
      </motion.div>
      <motion.div
        className="flex items-center text-blue-600 dark:text-blue-400"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <BsEnvelope className="mr-2" />
        <a href={`mailto:${email}`} className="font-medium hover:underline truncate block">
          {email}
        </a>
      </motion.div>
    </motion.div>
  );
};

export default FacultyCard;
