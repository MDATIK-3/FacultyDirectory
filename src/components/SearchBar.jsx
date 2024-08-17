import { BsSearch } from "react-icons/bs";
import { motion } from "framer-motion";

const SearchBar = ({ query, handleSearch }) => {
  return (
    <div className="relative flex-grow md:flex-grow-0 md:w-64">
      <motion.input
        type="text"
        placeholder="Search by name or code"
        value={query}
        onChange={handleSearch}
        className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 transition duration-300 shadow-sm hover:shadow-lg"
        whileFocus={{ scale: 1.05, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)" }}
        whileHover={{ scale: 1.03 }}
      />
      <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
    </div>
  );
};

export default SearchBar;
