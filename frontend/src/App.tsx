import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <span className="font-display font-bold text-white text-lg">LC</span>
              </div>
              <span className="font-display font-semibold text-xl text-white">
                Leaderboard
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                }`}
              >
                Leaderboard
              </Link>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                }`}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-surface-500 text-sm">
            LeetCode Leaderboard • Score = Easy×1 + Medium×2 + Hard×3
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

