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
        className="w-full pl-12 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 transition duration-300 shadow-sm hover:shadow-lg search-input"
        whileFocus={{ scale: 1.05, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)" }}
        whileHover={{ scale: 1.03, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
      />
      <motion.div
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none search-icon"
        whileHover={{ scale: 1.3, transition: { duration: 0.3 } }}
        whileFocus={{
          scale: 1.3,
          boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
          transition: { duration: 0.3 },
        }}
      >
        <BsSearch className="text-highlight" />
      </motion.div>
    </div>
  );
};

export default SearchBar;
