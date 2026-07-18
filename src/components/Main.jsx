import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { BsEnvelope, BsTelephone } from 'react-icons/bs'
import Pagination from './Pagination'
import DEPARTMENTS from '../constants/departments'

const ITEMS_PER_PAGE = 16
const CACHE_KEY = 'gub_faculty_v1'

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

function FacultyCardSkeleton({ darkMode }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${
      darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200'
    }`}>
      <div className={`aspect-[3/4] w-full animate-pulse ${
        darkMode ? 'bg-slate-700/50' : 'bg-slate-200'
      }`} />
      <div className="p-3.5 space-y-2.5">
        <div className={`h-4 w-3/4 rounded animate-pulse ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200'}`} />
        <div className={`h-3 w-full rounded animate-pulse ${darkMode ? 'bg-slate-700/40' : 'bg-slate-100'}`} />
        <div className={`h-3 w-2/3 rounded animate-pulse ${darkMode ? 'bg-slate-700/40' : 'bg-slate-100'}`} />
        <div className="pt-2 space-y-1.5">
          <div className={`h-3 w-full rounded animate-pulse ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`} />
          <div className={`h-3 w-4/5 rounded animate-pulse ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`} />
        </div>
      </div>
    </div>
  )
}

function FacultyCard({ member, darkMode, priority }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const showImage = member.img_src && !imgError

  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div className={`group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
      darkMode
        ? 'bg-slate-800/55 border-slate-700/50 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/30'
        : 'bg-white/90 border-white/80 shadow-sm hover:shadow-xl hover:border-green-200'
    }`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden flex-shrink-0">
        {showImage ? (
          <>
            {!imgLoaded && (
              <div className={`absolute inset-0 animate-pulse ${
                darkMode ? 'bg-slate-700/60' : 'bg-slate-200'
              }`} />
            )}
            <img
              src={member.img_src}
              alt={member.name}
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-[1.04] ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(member.name)} flex items-center justify-center`}>
            <span className="text-5xl font-bold text-white/90 select-none drop-shadow-sm">
              {initials}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
          <p className="text-white text-[11px] font-medium leading-snug line-clamp-2 drop-shadow">
            {member.designation}
          </p>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm backdrop-blur-sm ${STATUS_STYLES[member.status]}`}>
            {STATUS_LABELS[member.status]}
          </span>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className={`font-semibold text-sm leading-tight flex-1 min-w-0 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {member.name}
          </h3>
          {member.code && (
            <span className={`flex-shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
              darkMode
                ? 'text-blue-300 bg-blue-900/30 border-blue-700/50'
                : 'text-blue-700 bg-blue-50 border-blue-100'
            }`}>
              {member.code}
            </span>
          )}
        </div>

        <div className={`flex flex-col gap-1 mt-auto pt-2.5 border-t ${
          darkMode ? 'border-slate-700/40' : 'border-slate-100'
        }`}>
          <a
            href={`mailto:${member.email}`}
            className={`flex items-center gap-1.5 text-[11px] transition-colors rounded px-1 py-0.5 -mx-1 ${
              darkMode
                ? 'text-slate-400 hover:text-blue-300 hover:bg-blue-900/20'
                : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <BsEnvelope className="flex-shrink-0 opacity-70" />
            <span className="truncate">{member.email}</span>
          </a>
          {member.contact_no && (
            <a
              href={`tel:${member.contact_no}`}
              className={`flex items-center gap-1.5 text-[11px] transition-colors rounded px-1 py-0.5 -mx-1 ${
                darkMode
                  ? 'text-slate-400 hover:text-green-300 hover:bg-green-900/20'
                  : 'text-slate-500 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              <BsTelephone className="flex-shrink-0 opacity-70" />
              <span>{member.contact_no}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Main({ darkMode, activeDept, query, currentPage, onPageChange }) {
  const [allFaculty, setAllFaculty] = useState(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(CACHE_KEY)
    } catch {
      return true
    }
  })
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CACHE_KEY)) return
    } catch (e) { void e }
    if (fetchedRef.current) return
    fetchedRef.current = true

    const controller = new AbortController()

    supabase
      .from('faculty_members')
      .select('id, name, designation, code, contact_no, email, img_src, department, status')
      .order('name')
      .abortSignal(controller.signal)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          if (fetchError.name !== 'AbortError') setError(fetchError.message)
        } else {
          const result = data || []
          setAllFaculty(result)
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(result))
          } catch (e) { void e }
        }
        setLoading(false)
      })

    return () => controller.abort()
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
          {!loading && (
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {query.trim()
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
                : `${filtered.length} ${filtered.length === 1 ? 'member' : 'members'}`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <FacultyCardSkeleton key={i} darkMode={darkMode} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className={`text-center py-20 sm:py-24 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {query.trim()
              ? `No results found for "${query}"`
              : 'No faculty members found for this department.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {paginated.map((member, idx) => (
                <FacultyCard
                  key={member.id}
                  member={member}
                  darkMode={darkMode}
                  priority={idx < 8}
                />
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
