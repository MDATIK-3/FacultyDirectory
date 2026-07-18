import { BsSearch } from 'react-icons/bs'
import { motion } from 'framer-motion'

const SearchBar = ({ query, handleSearch, darkMode, compact = false }) => {
  if (compact) {
    return (
      <div className="relative">
        <motion.input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={handleSearch}
          className={`pl-7 pr-3 py-1 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-white/40 transition duration-300 border w-32 ${
            darkMode
              ? 'bg-white/10 border-white/15 text-gray-100 placeholder-gray-500'
              : 'bg-black/5 border-black/10 text-green-900 placeholder-green-800/40'
          }`}
          whileFocus={{ scale: 1.02, width: '10rem' }}
        />
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <BsSearch className={`text-[10px] ${darkMode ? 'text-white/50' : 'text-green-800/50'}`} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <motion.input
        type="text"
        placeholder="Search name, code, designation…"
        value={query}
        onChange={handleSearch}
        className={`w-full pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-300 shadow-sm border ${
          darkMode
            ? 'bg-white/10 backdrop-blur-sm border-white/15 text-gray-100 placeholder-gray-400'
            : 'bg-white/30 backdrop-blur-sm border-white/50 text-white placeholder-white/70'
        }`}
        whileFocus={{ scale: 1.02 }}
        whileHover={{ scale: 1.01 }}
      />
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <BsSearch className="text-sm text-white/70" />
      </div>
    </div>
  )
}

export default SearchBar
