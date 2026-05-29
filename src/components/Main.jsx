import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { BsEnvelope, BsTelephone } from 'react-icons/bs'
import Pagination from './Pagination'
import DEPARTMENTS from '../constants/departments'

const ITEMS_PER_PAGE = 16

const STATUS_STYLES = {
  active: 'bg-green-100/90 text-green-700 ring-1 ring-inset ring-green-200',
  leave_study: 'bg-yellow-100/90 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  formal: 'bg-gray-100/90 text-gray-600 ring-1 ring-inset ring-gray-200',
}

const STATUS_LABELS = {
  active: 'Active',
  leave_study: 'Study Leave',
  formal: 'Formal',
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-blue-600',
]

function getGradient(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

function FacultyCard({ member, darkMode }) {
  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div className={`rounded-2xl border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
      darkMode
        ? 'bg-slate-800/55 border-blue-400/10'
        : 'bg-white/70 border-white/80'
    }`}>
      <div className="relative aspect-[4/3] w-full bg-gray-100 flex-shrink-0">
        {member.img_src ? (
          <img
            src={member.img_src}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(member.name)} flex items-center justify-center`}>
            <span className="text-4xl sm:text-5xl font-bold text-white select-none">{initials}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 py-2.5">
          <p className="text-white text-xs font-medium leading-snug line-clamp-2">{member.designation}</p>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${STATUS_STYLES[member.status]}`}>
            {STATUS_LABELS[member.status]}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className={`font-semibold text-sm leading-snug ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {member.name}
          </h3>
          {member.code && (
            <span className={`inline-block mt-1 font-mono text-xs px-1.5 py-0.5 rounded border ${
              darkMode ? 'text-blue-300 bg-blue-900/40 border-blue-700' : 'text-blue-700 bg-blue-50 border-blue-100'
            }`}>
              {member.code}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 mt-auto">
          {member.contact_no && (
            <a
              href={`tel:${member.contact_no}`}
              className={`flex items-center gap-2 text-xs py-1 transition-colors ${
                darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-700'
              }`}
            >
              <BsTelephone className="flex-shrink-0" />
              <span className="truncate">{member.contact_no}</span>
            </a>
          )}
          <a
            href={`mailto:${member.email}`}
            className={`flex items-center gap-2 text-xs py-1 transition-colors ${
              darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <BsEnvelope className="flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Main({ darkMode, activeDept, query, currentPage, onPageChange }) {
  const [allFaculty, setAllFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('faculty_members')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setAllFaculty(data || [])
        setLoading(false)
      })
  }, [])

  const activeDeptObj = DEPARTMENTS.find((d) => d.short === activeDept)

  const filtered = useMemo(() => {
    let list = activeDeptObj
      ? allFaculty.filter((m) => m.department === activeDeptObj.dbValue)
      : allFaculty

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((m) =>
        [m.name, m.code, m.designation, m.email, m.contact_no].some((f) =>
          f?.toLowerCase().includes(q)
        )
      )
    }
    return list
  }, [allFaculty, query, activeDeptObj])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading faculty directory…
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load data</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 sm:mb-6">
          <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'shimmer-heading-dark' : 'shimmer-heading-light'}`}>
            {activeDeptObj?.full ?? 'All Departments'}
          </h2>
          <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {query.trim()
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
              : `${filtered.length} ${filtered.length === 1 ? 'member' : 'members'}`}
          </p>
        </div>

        {paginated.length === 0 ? (
          <div className={`text-center py-20 sm:py-24 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {query.trim()
              ? `No results found for "${query}"`
              : 'No faculty members found for this department.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {paginated.map((member) => (
                <FacultyCard key={member.id} member={member} darkMode={darkMode} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              darkMode={darkMode}
            />
          </>
        )}
      </div>
    </main>
  )
}
