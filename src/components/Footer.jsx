import { useEffect, useState } from 'react'

export default function Footer({ darkMode }) {
  const [contributors, setContributors] = useState([])

  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/repos/MDATIK-3/FacultyDirectory/contributors')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setContributors(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const extraContributors = [
    {
      id: 'salman-230',
      login: 'Salman-230',
      html_url: 'https://github.com/Salman-230',
      avatar_url: 'https://avatars.githubusercontent.com/u/225510961?v=4',
    },
  ]

  const allContributors = [...contributors, ...extraContributors]

  return (
    <footer className={`py-5 mt-auto backdrop-blur-sm border-t transition-colors duration-300 ${
      darkMode
        ? 'bg-slate-900/60 border-blue-400 text-slate-400'
        : 'bg-green-900/90 border-white/50 text-white'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <p className="shimmer-text font-medium">
          © {new Date().getFullYear()} Telepathy. All rights reserved.
        </p>
        {allContributors.length > 0 && (
          <div className="flex items-center gap-2">
            {allContributors.map((c) => (
              <a
                key={c.id}
                href={c.html_url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col items-center"
              >
                {/* Custom tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-xs font-semibold px-2 py-0.5 rounded-md pointer-events-none
                  opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                  transition-all duration-200
                  bg-white/90 text-gray-800 shadow-md">
                  {c.login}
                </span>
                <img
                  src={c.avatar_url}
                  alt={c.login}
                  className="w-7 h-7 rounded-full border-2 border-white/60 object-cover
                    hover:scale-110 transition-transform duration-200 shadow-sm"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
