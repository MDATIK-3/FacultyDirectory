import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function PublicLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [activeDept, setActiveDept] = useState('CSE')
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  function handleSearch(e) {
    setQuery(e.target.value)
    setCurrentPage(1)
  }

  function handleDeptChange(short) {
    setActiveDept(short)
    setCurrentPage(1)
    setQuery('')
  }

  return (
    <div className="relative z-0 min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 dark:from-gray-950 dark:via-slate-950 dark:to-gray-950 transition-colors duration-500">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-400/20 dark:bg-slate-400/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-teal-400/20 dark:bg-blue-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-green-300/15 dark:bg-slate-500/5 blur-3xl" />
      </div>

      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        query={query}
        onSearch={handleSearch}
        activeDept={activeDept}
        onDeptChange={handleDeptChange}
      />
      <Main
        darkMode={darkMode}
        activeDept={activeDept}
        query={query}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <Footer darkMode={darkMode} />
    </div>
  )
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 dark:from-gray-950 dark:via-slate-950 dark:to-gray-950">
      <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />} />
        <Route path="/login" element={session === undefined ? <Spinner /> : session ? <Navigate to="/admin" replace /> : <Login />} />
        <Route
          path="/admin"
          element={
            session === undefined ? <Spinner /> :
            <ProtectedRoute session={session}>
              <AdminDashboard session={session} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
