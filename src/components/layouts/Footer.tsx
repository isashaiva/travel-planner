export default function Footer() {
  return (
    <footer id="footer" className="px-4 sm:px-6 pb-8 sm:pb-10 mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto border-t border-white/40 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-gray-500">
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            TravelUA
          </h3>
          <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">
            Travel planner for Ukraine
          </p>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <a
            href="#features"
            className="hover:text-blue-600 transition text-sm sm:text-base"
          >
            Features
          </a>
          <a
            href="#"
            className="hover:text-blue-600 transition text-sm sm:text-base"
          >
            Back to top
          </a>
        </div>

        <p className="text-xs sm:text-sm">© 2026 TravelUA</p>
      </div>
    </footer>
  );
}
