import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthContext";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

export default function HomePage() {
  const { user } = useAuth();
  const [nearestTrip, setNearestTrip] = useState<any>(null);
  const [tripCount, setTripCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    import("../features/dashboard/dashboardService").then(({ getRoutes }) => {
      getRoutes().then((data) => {
        setTripCount(data.length);
        const visited = new Set(
          JSON.parse(localStorage.getItem("visitedPlaces") || "[]"),
        );
        let targetRoute = null;
        let targetPlace = null;
        for (const route of data) {
          const nextPlace = route.places?.find(
            (p: any) => !visited.has(`${route.id}:${p.place_id}`),
          );
          if (nextPlace) {
            targetRoute = route;
            targetPlace = nextPlace;
            break;
          }
        }
        if (!targetRoute && data[0]) {
          targetRoute = data[0];
          targetPlace = data[0].places?.[0] ?? null;
        }
        setNearestTrip({ route: targetRoute, place: targetPlace });
        setLoading(false);
      });
    });
  }, [user?.uid]);

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-60px] sm:right-[-100px] w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] sm:left-[20%] w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full bg-white/60 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 text-blue-700 shadow-lg mb-5 sm:mb-6 text-sm sm:text-base">
                ✈️ Планування подорожей
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-800 mb-6 sm:mb-8">
                Плануй маршрути.
                <span className="block bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Подорожуй впевнено.
                </span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mb-8 sm:mb-10">
                Обери місто, отримай готовий маршрут з реальними локаціями,
                розрахованим бюджетом та картою — за кілька секунд.
              </p>
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow-xl hover:scale-105 transition text-sm sm:text-base"
              >
                {user ? "Відкрити Dashboard" : "Почати зараз"}
              </Link>
            </div>

            <div className="relative flex justify-center mt-4 lg:mt-0">
              <div className="w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[520px] backdrop-blur-3xl bg-white/25 border border-white/50 rounded-[28px] sm:rounded-[40px] p-4 sm:p-6 shadow-[0_8px_32px_rgba(31,38,135,0.18)]">
                {loading ? (
                  <div className="h-[260px] sm:h-[340px] lg:h-[420px] rounded-[20px] sm:rounded-[30px] bg-white/40 animate-pulse" />
                ) : (
                  <img
                    src={
                      nearestTrip?.place?.photo ||
                      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c"
                    }
                    className="rounded-[20px] sm:rounded-[30px] h-[260px] sm:h-[340px] lg:h-[420px] w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c";
                    }}
                  />
                )}
              </div>

              <div className="absolute top-4 -right-2 sm:-right-6 backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[20px] sm:rounded-[28px] px-4 sm:px-6 py-3 sm:py-5 shadow-2xl">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Saved trips
                </p>
                {loading ? (
                  <div className="h-8 sm:h-10 w-8 sm:w-10 bg-white/60 rounded-xl animate-pulse" />
                ) : (
                  <h4 className="text-3xl sm:text-4xl font-black text-blue-600">
                    {tripCount}
                  </h4>
                )}
              </div>

              <div className="absolute bottom-4 -left-2 sm:-left-6 backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[20px] sm:rounded-[28px] px-4 sm:px-6 py-3 sm:py-5 shadow-2xl max-w-[160px] sm:max-w-[220px]">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Next destination
                </p>
                {loading ? (
                  <div className="h-6 sm:h-7 w-28 sm:w-36 bg-white/60 rounded-xl animate-pulse" />
                ) : (
                  <h4 className="text-lg sm:text-2xl font-bold text-gray-800 break-words">
                    {nearestTrip?.place?.name || "—"}
                  </h4>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "🗺️",
                title: "Готові маршрути",
                text: "Система автоматично підбирає локації поруч і будує оптимальний маршрут по місту.",
              },
              {
                icon: "💰",
                title: "Розрахунок бюджету",
                text: "Одразу бачиш скільки витратиш на їжу, таксі та готель — без сюрпризів.",
              },
              {
                icon: "📍",
                title: "Реальні місця",
                text: "Всі локації з Google Maps — рейтинги, відгуки, години роботи та фото.",
              },
              {
                icon: "✅",
                title: "Відмітки прогресу",
                text: "Відмічай відвідані місця прямо в маршруті і стеж за своїм прогресом.",
              },
              {
                icon: "🌍",
                title: "Спільнота",
                text: "Переглядай публічні маршрути інших мандрівників і зберігай найкращі собі.",
              },
              {
                icon: "💾",
                title: "Збережи і повернись",
                text: "Всі маршрути зберігаються в особистому Dashboard — доступні будь-коли.",
              },
            ].map(({ icon, title, text }) => (
              <div
                key={title}
                className="backdrop-blur-3xl bg-white/25 border border-white/50 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-xl hover:scale-[1.02] transition"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-5">{icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
