import { useEffect, useState } from 'react'

const REPO_URL = 'https://github.com/MDATIK-3/FacultyDirectory'

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
        {contributors.length > 0 && (
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            title="View contributors on GitHub"
            className="flex items-center -space-x-2 hover:opacity-80 transition-opacity"
          >
            {contributors.map((c) => (
              <img
                key={c.id}
                src={c.avatar_url}
                alt={c.login}
                className="w-6 h-6 rounded-full border-2 border-white/50 object-cover"
              />
            ))}
          </a>
        )}
      </div>
    </footer>
  )
}
