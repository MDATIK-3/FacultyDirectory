import React, { useState, useEffect } from "react";
import facultyData from "./data/faculty.js";
import FacultyCard from "./components/FacultyCard";
import Fuse from "fuse.js";
import { BsMoon, BsSun, BsSearch } from "react-icons/bs";
import { motion } from "framer-motion";
import SearchBar from "./components/SearchBar";
import Footer from "./components/Footer.jsx";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1123px)");

    const handleMediaChange = (e) => {
      if (e.matches) {
        setItemsPerPage(15); 
      } else {
        setItemsPerPage(16);
      }
    };

    handleMediaChange(mediaQuery);
    mediaQuery.addListener(handleMediaChange); 

    return () => {
      mediaQuery.removeListener(handleMediaChange);
    };
  }, []);

  const fuse = new Fuse(facultyData, {
    keys: ["name", "code"],
    threshold: 0.3,
  });

  const results = query
    ? fuse.search(query).map(({ item }) => item)
    : facultyData;
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center  mb-8">
            <h1
              className={`text-3xl font-bold collaborate-button ${
                darkMode ? "collaborate-button2" : "collaborate-button1"
              } mb-4 md:mb-0`}
            >
              Faculty Directory
            </h1>
            <div className="flex items-center  sm:w-full md:w-auto  ">
              <SearchBar query={query} handleSearch={handleSearch} />

              <motion.button
                onClick={handleToggleDarkMode}
                className="ml-4 p-2 bg-gray-200  dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 "
                whileHover={{ rotate: 360 }}
              >
                {darkMode ? <BsSun size={20} /> : <BsMoon size={20} />}
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-8 gap-6">
            {paginatedData.map((faculty) => (
              <FacultyCard
                key={faculty.id}
                name={faculty.name}
                designation={faculty.designation}
                contactNo={faculty.contactNo}
                email={faculty.email}
                code={faculty.code}
                imgSrc={faculty.imgSrc}
                query={query}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            <motion.button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-600 shadow-md"
              whileTap={{ scale: 0.9 }}
            >
              &lt;
            </motion.button>
            {[...Array(totalPages)].map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg transition duration-300 shadow-md ${
                  currentPage === index + 1
                    ? "bg-custom text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {index + 1}
              </motion.button>
            ))}
            <motion.button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-600 shadow-md"
              whileTap={{ scale: 0.9 }}
            >
              &gt;
            </motion.button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
