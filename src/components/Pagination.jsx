import { motion } from 'framer-motion'

function getPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function Pagination({ currentPage, totalPages, onPageChange, darkMode }) {
  if (totalPages <= 1) return null

  const pages = getPages(currentPage, totalPages)

  const base = 'px-2.5 sm:px-3.5 py-2 rounded-lg text-sm font-medium transition duration-200 shadow-sm min-w-[2.25rem] text-center backdrop-blur-sm'
  const active = 'bg-green-700/90 text-white'
  const inactive = darkMode
    ? 'bg-white/10 text-gray-300 hover:bg-white/20'
    : 'bg-white/70 text-gray-700 hover:bg-white/90'
  const disabled = darkMode
    ? 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'
    : 'bg-white/30 text-gray-400 cursor-not-allowed opacity-50'

  return (
    <div className="flex justify-center items-center mt-12 sm:mt-14 gap-1 sm:gap-1.5 flex-wrap pb-4">
      <motion.button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`${base} ${currentPage === 1 ? disabled : inactive}`}
        whileTap={currentPage === 1 ? {} : { scale: 0.9 }}
      >
        ‹<span className="hidden sm:inline"> Prev</span>
      </motion.button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`e-${i}`} className={`px-1 sm:px-2 select-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>…</span>
        ) : (
          <motion.button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${base} ${currentPage === page ? active : inactive}`}
            whileTap={{ scale: 0.9 }}
          >
            {page}
          </motion.button>
        )
      )}

      <motion.button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`${base} ${currentPage === totalPages ? disabled : inactive}`}
        whileTap={currentPage === totalPages ? {} : { scale: 0.9 }}
      >
        <span className="hidden sm:inline">Next </span>›
      </motion.button>
    </div>
  )
}
