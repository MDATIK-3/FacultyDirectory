import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BsMoon, BsSun } from 'react-icons/bs'
import SearchBar from './SearchBar'
import DEPARTMENTS from '../constants/departments'

export default function Header({ darkMode, onToggleDark, query, onSearch, activeDept, onDeptChange }) {
  const tabsScrollRef = useRef(null)

  useEffect(() => {
    const el = tabsScrollRef.current
    if (!el) return
    const onWheel = (e) => {
      if (e.deltaY === 0 && e.deltaX === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY || e.deltaX
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <header className="sticky top-0 z-20 shadow-lg">
      <div className={darkMode ? 'header-bg-dark' : 'header-bg-light'}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight shrink-0">
              GUB Faculty Directory
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block w-48 md:w-64">
                <SearchBar query={query} handleSearch={onSearch} darkMode={darkMode} />
              </div>
              <motion.button
                onClick={onToggleDark}
                className="p-2.5 rounded-full flex-shrink-0 bg-white/15 hover:bg-white/25 text-white transition-colors"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.4 }}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <BsSun size={17} /> : <BsMoon size={17} />}
              </motion.button>
            </div>
          </div>

          <div className="sm:hidden mt-2.5">
            <SearchBar query={query} handleSearch={onSearch} darkMode={darkMode} />
          </div>
        </div>
      </div>

      {/* Department tabs — centered with glassmorphism */}
      <div className={`${
        darkMode ? 'bg-blue-950/40 border-blue-400/10' : 'bg-white/30 border-white/50'
      } backdrop-blur-md border-b transition-colors duration-300`}>
        <div
          ref={tabsScrollRef}
          className="overflow-x-auto scrollbar-hide cursor-ew-resize"
        >
          <div className="flex gap-1 py-2 px-4 sm:px-6 mx-auto w-fit min-w-full justify-center">
            {DEPARTMENTS.map((dept) => {
              const isActive = activeDept === dept.short
              return (
                <button
                  key={dept.short}
                  onClick={() => onDeptChange(dept.short)}
                  title={dept.full}
                  className={`flex-shrink-0 px-3.5 py-2 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-green-700/90 text-white shadow-sm'
                      : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-white/10'
                      : 'text-green-900/70 hover:text-green-900 hover:bg-white/60'
                  }`}
                >
                  {dept.short}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
