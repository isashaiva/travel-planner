import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthContext";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

export default function HomePage() {
  const { user } = useAuth();
  const [nearestTrip, setNearestTrip] = useState<any>(null);
  const [tripCount, setTripCount] = useState(0);

  useEffect(() => {
    if (!user) return;
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
      });
    });
  }, [user?.uid]);

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] w-[350px] h-[350px] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] w-[220px] h-[220px] rounded-full bg-cyan-200/50 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <section className="max-w-7xl mx-auto px-6 pt-12 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 backdrop-blur-2xl border border-white/50 text-blue-700 shadow-lg mb-6">
                ✈️ Планування подорожей
              </div>

              <h1 className="text-6xl font-black leading-tight text-gray-800 mb-8">
                Плануй маршрути.
                <span className="block bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Подорожуй впевнено.
                </span>
              </h1>

              <p className="text-gray-600 text-xl leading-relaxed max-w-xl mb-10">
                Обери місто, отримай готовий маршрут з реальними локаціями,
                розрахованим бюджетом та картою — за кілька секунд.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="px-8 py-4 rounded-[24px] bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold shadow-xl hover:scale-105 transition"
                >
                  {user ? "Відкрити Dashboard" : "Почати зараз"}
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-full max-w-[520px] backdrop-blur-3xl bg-white/25 border border-white/50 rounded-[40px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.18)]">
                <img
                  src={
                    nearestTrip?.place?.photo ||
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c"
                  }
                  className="rounded-[30px] h-[420px] w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c";
                  }}
                />
              </div>

              <div className="absolute top-6 -right-6 backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[28px] px-6 py-5 shadow-2xl">
                <p className="text-sm text-gray-500 mb-1">Saved trips</p>
                <h4 className="text-4xl font-black text-blue-600">
                  {tripCount}
                </h4>
              </div>

              <div className="absolute bottom-6 -left-6 backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[28px] px-6 py-5 shadow-2xl max-w-[220px]">
                <p className="text-sm text-gray-500 mb-1">Next destination</p>
                <h4 className="text-2xl font-bold text-gray-800 break-words">
                  {nearestTrip?.place?.name || "—"}
                </h4>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🗺️"
              title="Готові маршрути"
              text="Система автоматично підбирає локації поруч і будує оптимальний маршрут по місту."
            />
            <FeatureCard
              icon="💰"
              title="Розрахунок бюджету"
              text="Одразу бачиш скільки витратиш на їжу, таксі та готель — без сюрпризів."
            />
            <FeatureCard
              icon="📍"
              title="Реальні місця"
              text="Всі локації з Google Maps — рейтинги, відгуки, години роботи та фото."
            />
            <FeatureCard
              icon="✅"
              title="Відмітки прогресу"
              text="Відмічай відвідані місця прямо в маршруті і стеж за своїм прогресом."
            />
            <FeatureCard
              icon="🌍"
              title="Спільнота"
              text="Переглядай публічні маршрути інших мандрівників і зберігай найкращі собі."
            />
            <FeatureCard
              icon="💾"
              title="Збережи і повернись"
              text="Всі маршрути зберігаються в особистому Dashboard — доступні будь-коли."
            />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="backdrop-blur-3xl bg-white/25 border border-white/50 rounded-[32px] p-8 shadow-xl hover:scale-[1.02] transition">
      <div className="text-5xl mb-5">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
