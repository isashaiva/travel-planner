import { Link } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import { logout } from "../../features/auth/authService";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="px-6 py-6">
      <div className="max-w-7xl mx-auto backdrop-blur-3xl bg-white/30 border border-white/50 rounded-[32px] px-8 py-4 flex items-center justify-between shadow-xl">
        {/* LOGO */}
        <Link to="/">
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            TravelUA
          </h1>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <a href="#features" className="hover:text-blue-600 transition">
            Features
          </a>

          <a href="#footer" className="hover:text-blue-600 transition">
            Contacts
          </a>
        </nav>

        {/* AUTH */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-blue-700 font-semibold hover:scale-105 transition shadow-lg"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:scale-105 transition shadow-lg"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/generator"
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:scale-105 transition shadow-lg"
              >
                ✨ Generator
              </Link>

              <Link
                to="/explore"
                className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-blue-700 font-semibold hover:scale-105 transition shadow-lg"
              >
                🌍 Explore
              </Link>

              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-blue-700 font-semibold hover:scale-105 transition shadow-lg"
              >
                Dashboard
              </Link>

              <button
                onClick={logout}
                className="px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-red-500 font-semibold hover:scale-105 transition shadow-lg"
              >
                Logout
              </button>

              <Link
                to="/profile"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.email?.charAt(0).toUpperCase()
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
