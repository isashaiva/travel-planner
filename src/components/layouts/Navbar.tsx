import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import { logout } from "../../features/auth/authService";

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="px-3 sm:px-6 py-3 sm:py-6 relative z-40">
      <div className="max-w-7xl mx-auto backdrop-blur-3xl bg-white/30 border border-white/50 rounded-[24px] sm:rounded-[32px] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-xl">
        {/* LOGO */}
        <Link to="/" onClick={closeMenu}>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            TravelUA
          </h1>
        </Link>

        {/* NAV LINKS — тільки на великих екранах lg+ */}
        <nav className="hidden lg:flex gap-6 xl:gap-8 text-gray-700 font-medium">
          <a
            href="#features"
            className="hover:text-blue-600 transition text-sm xl:text-base"
          >
            Features
          </a>
          <a
            href="#footer"
            className="hover:text-blue-600 transition text-sm xl:text-base"
          >
            Contacts
          </a>
        </nav>

        {/* AUTH BUTTONS — тільки на lg+ */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 xl:px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-blue-700 font-semibold hover:scale-105 transition shadow-lg text-sm xl:text-base"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 xl:px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:scale-105 transition shadow-lg text-sm xl:text-base"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/generator"
                className="px-4 xl:px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:scale-105 transition shadow-lg text-sm xl:text-base"
              >
                ✨ Generator
              </Link>
              <Link
                to="/explore"
                className="px-4 xl:px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-blue-700 font-semibold hover:scale-105 transition shadow-lg text-sm xl:text-base"
              >
                🌍 Explore
              </Link>
              <Link
                to="/dashboard"
                className="px-4 xl:px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-blue-700 font-semibold hover:scale-105 transition shadow-lg text-sm xl:text-base"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 xl:px-5 py-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 text-red-500 font-semibold hover:scale-105 transition shadow-lg text-sm xl:text-base"
              >
                Logout
              </button>
              <Link
                to="/profile"
                className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-base xl:text-lg shadow-lg overflow-hidden shrink-0"
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

        {/* BURGER + AVATAR — на mobile і tablet (< lg) */}
        <div className="flex lg:hidden items-center gap-2">
          {user && (
            <Link
              to="/profile"
              onClick={closeMenu}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden shrink-0"
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
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/40 border border-white/60 flex flex-col items-center justify-center gap-1.5 shadow transition hover:bg-white/60"
          >
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU — mobile і tablet */}
      <div
        className={`lg:hidden absolute top-full left-3 right-3 sm:left-6 sm:right-6 mt-2 z-50 transition-all duration-300 ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
      >
        <div className="backdrop-blur-3xl bg-white/70 border border-white/60 rounded-[20px] sm:rounded-[24px] shadow-2xl p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2">
          {!user ? (
            <>
              <a
                href="#features"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl text-slate-700 font-semibold text-sm sm:text-base hover:bg-white/60 transition"
              >
                Features
              </a>
              <a
                href="#footer"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl text-slate-700 font-semibold text-sm sm:text-base hover:bg-white/60 transition"
              >
                Contacts
              </a>
              <div className="border-t border-slate-200/60 my-1" />
              <Link
                to="/login"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-blue-700 font-semibold text-sm sm:text-base text-center hover:bg-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm sm:text-base text-center hover:shadow-lg transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/generator"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm sm:text-base text-center hover:shadow-lg transition"
              >
                ✨ Generator
              </Link>
              <Link
                to="/explore"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-blue-700 font-semibold text-sm sm:text-base text-center hover:bg-white transition"
              >
                🌍 Explore
              </Link>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-blue-700 font-semibold text-sm sm:text-base text-center hover:bg-white transition"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={closeMenu}
                className="px-4 py-3 rounded-xl bg-white/60 border border-white/60 text-blue-700 font-semibold text-sm sm:text-base text-center hover:bg-white transition"
              >
                Profile
              </Link>
              <div className="border-t border-slate-200/60 my-1" />
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-500 font-semibold text-sm sm:text-base text-center hover:bg-red-100 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
