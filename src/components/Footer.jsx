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
          <div className="flex items-center -space-x-2">
            {allContributors.map((c) => (
              <a
                key={c.id}
                href={c.html_url}
                target="_blank"
                rel="noreferrer"
                title={c.login}
                className="hover:opacity-80 hover:scale-110 transition-all hover:z-10 relative"
              >
                <img
                  src={c.avatar_url}
                  alt={c.login}
                  className="w-6 h-6 rounded-full border-2 border-white/50 object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
