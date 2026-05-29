export default function Footer({ darkMode }) {
  return (
    <footer className={`py-5 mt-auto backdrop-blur-sm border-t transition-colors duration-300 ${
      darkMode
        ? 'bg-slate-900/60 border-blue-400 text-slate-400'
        : 'bg-green-900/90 border-white/50 text-white'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-center text-sm">
        <p className="shimmer-text font-medium">
          © {new Date().getFullYear()} Telepathy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
