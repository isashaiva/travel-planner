export default function Footer() {
  return (
    <footer id="footer" className="px-6 pb-10 mt-24">
      <div className="max-w-7xl mx-auto border-t border-white/40 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500">
        <div>
          <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            TravelUA
          </h3>

          <p className="text-sm mt-1">Travel planner for Ukraine</p>
        </div>

        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#features" className="hover:text-blue-600 transition">
            Features
          </a>

          <LinkToTop />
        </div>

        <p className="text-sm mt-4 md:mt-0">© 2026 TravelUA</p>
      </div>
    </footer>
  );
}

function LinkToTop() {
  return (
    <a href="#" className="hover:text-blue-600 transition">
      Back to top
    </a>
  );
}
