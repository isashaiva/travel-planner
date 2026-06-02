import { useState } from "react";
import GoogleMapPicker from "../components/map/GoogleMapPicker";
import { generateRoutes } from "../features/routes/routeService";
import { getCityByCoords } from "../features/city/cityService";
import { saveRoute } from "../features/dashboard/dashboardService";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { useNavigate } from "react-router-dom";

function RouteCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[34px] border border-sky-100 bg-white shadow-lg flex flex-col h-full animate-pulse">
      <div className="h-2 bg-slate-200" />
      <div className="p-5 sm:p-7 flex flex-col flex-1 gap-3 sm:gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-7 sm:h-8 bg-slate-100 rounded-2xl w-3/4" />
            <div className="h-3 sm:h-4 bg-slate-100 rounded-full w-full" />
            <div className="h-3 sm:h-4 bg-slate-100 rounded-full w-2/3" />
          </div>
          <div className="w-16 sm:w-20 h-8 sm:h-9 bg-slate-100 rounded-xl sm:rounded-2xl ml-3 sm:ml-4" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl"
            />
          ))}
        </div>
        <div className="mt-auto h-28 sm:h-36 bg-slate-100 rounded-2xl sm:rounded-3xl" />
        <div className="h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
      </div>
    </div>
  );
}

export default function TripGeneratorPage() {
  const [routes, setRoutes] = useState<any[]>(() => {
    try {
      const saved = sessionStorage.getItem("generator_routes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem("generator_city");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [savedMessage, setSavedMessage] = useState("");
  const [generatingRoutes, setGeneratingRoutes] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelect = async (lat: number, lng: number) => {
    setGeneratingRoutes(true);
    setRoutes([]);

    const service = new google.maps.places.PlacesService(
      document.createElement("div"),
    );
    const searchNearby = (type: string): Promise<any[]> =>
      new Promise((resolve) => {
        service.nearbySearch(
          { location: { lat, lng }, radius: 45000, type },
          (results, status) => {
            resolve(
              status === google.maps.places.PlacesServiceStatus.OK && results
                ? results
                : [],
            );
          },
        );
      });

    const [museums, parks, restaurants, bars, attractions, hotels, cafes] =
      await Promise.all([
        searchNearby("museum"),
        searchNearby("park"),
        searchNearby("restaurant"),
        searchNearby("bar"),
        searchNearby("tourist_attraction"),
        searchNearby("lodging"),
        searchNearby("cafe"),
      ]);

    const generatedRoutes = generateRoutes({
      historyPlaces: [...museums, ...attractions],
      naturePlaces: parks,
      cityPlaces: [...restaurants, ...bars, ...cafes],
      startPoint: { lat, lng },
      budgetData: { hotels, cafes: [...restaurants, ...cafes] },
    });

    const serializableRoutes = generatedRoutes.map((route: any) => ({
      ...route,
      places: route.places.map((p: any) => ({
        ...p,
        lat:
          typeof p.geometry?.location?.lat === "function"
            ? p.geometry.location.lat()
            : (p.lat ?? null),
        lng:
          typeof p.geometry?.location?.lng === "function"
            ? p.geometry.location.lng()
            : (p.lng ?? null),
        photo:
          typeof p.photos?.[0]?.getUrl === "function"
            ? p.photos[0].getUrl({ maxWidth: 1200 })
            : (p.photo ?? null),
      })),
    }));
    setRoutes(serializableRoutes);
    sessionStorage.setItem(
      "generator_routes",
      JSON.stringify(serializableRoutes),
    );

    const cityData = await getCityByCoords(lat, lng);
    const cityInfo = { lat, lng, city: cityData.city };
    setSelectedCity(cityInfo);
    sessionStorage.setItem("generator_city", JSON.stringify(cityInfo));
    setGeneratingRoutes(false);
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-60px] sm:right-[-100px] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] sm:left-[20%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-white/60 blur-3xl" />
      </div>

      {savedMessage && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
          <div className="bg-white border border-sky-100 shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-4 sm:py-5 min-w-[260px] sm:min-w-[320px]">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-100 flex items-center justify-center text-xl sm:text-2xl">
                ✨
              </div>
              <div>
                <h3 className="font-black text-slate-800 mb-1 text-sm sm:text-base">
                  Маршрут збережено
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  {savedMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Navbar />
      <GoogleMapPicker
        onSelect={handleSelect}
        routes={routes}
        activeRoute={activeRoute}
        selectedCity={selectedCity}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* EMPTY STATE */}
        {!selectedCity && !generatingRoutes && (
          <div className="py-12 sm:py-20">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-white border border-sky-100 shadow-lg rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-sky-500 animate-pulse" />
                <span className="font-bold text-slate-700 text-sm sm:text-base">
                  Travel Route Generator
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-800 leading-tight mb-4 sm:mb-6">
                Створи свій
                <span className="block text-sky-500">ідеальний маршрут</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-14 px-2">
                Обери будь-яку точку на карті і система автоматично згенерує
                готові маршрути з популярними місцями, бюджетом та візуалізацією
                маршруту.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    icon: "🗺️",
                    title: "Smart Routes",
                    text: "Автоматична генерація маршрутів по місту з реальними локаціями.",
                  },
                  {
                    icon: "💸",
                    title: "Budget Planner",
                    text: "Розрахунок бюджету на їжу, готель та транспорт.",
                  },
                  {
                    icon: "✨",
                    title: "Save & Explore",
                    text: "Зберігай маршрути у dashboard та переглядай їх на карті.",
                  },
                ].map(({ icon, title, text }) => (
                  <div
                    key={title}
                    className="bg-white rounded-[24px] sm:rounded-[30px] border border-slate-100 shadow-lg p-6 sm:p-8"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-sky-100 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 sm:mb-5">
                      {icon}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 sm:mb-3">
                      {title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {generatingRoutes && (
          <div className="py-8 sm:py-12">
            <div className="max-w-md mx-auto text-center mb-8 sm:mb-12">
              <div className="w-14 h-14 sm:w-20 sm:h-20 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 sm:mb-3">
                Генеруємо маршрути...
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                Шукаємо найкращі місця поруч і розраховуємо бюджет
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              <RouteCardSkeleton />
              <RouteCardSkeleton />
              <div className="hidden lg:block">
                <RouteCardSkeleton />
              </div>
            </div>
          </div>
        )}

        {/* CITY HEADER */}
        {selectedCity && !generatingRoutes && (
          <div className="mb-5 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800">
              {selectedCity.city}
            </h1>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
              Автоматично згенеровані маршрути
            </p>
          </div>
        )}

        {/* ROUTES */}
        {!generatingRoutes && routes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 items-stretch">
            {routes.map((route) => (
              <div
                key={route.id}
                onMouseEnter={() => setActiveRoute(route)}
                onMouseLeave={() => setActiveRoute(null)}
                className="group relative overflow-hidden rounded-[24px] sm:rounded-[34px] border border-sky-100 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />

                <div className="p-5 sm:p-7 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4 sm:mb-5">
                    <div>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-800 mb-1 sm:mb-2 leading-tight">
                        {route.title}
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-[220px] sm:max-w-[260px] line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                        {route.description}
                      </p>
                    </div>
                    <div className="bg-sky-100 text-sky-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black capitalize shrink-0 ml-2">
                      {route.type}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-7">
                    {route.places.map((place: any, index: number) => (
                      <div
                        key={place.place_id}
                        onClick={() => {
                          const lat =
                            typeof place.geometry?.location?.lat === "function"
                              ? place.geometry.location.lat()
                              : place.lat;
                          const lng =
                            typeof place.geometry?.location?.lng === "function"
                              ? place.geometry.location.lng()
                              : place.lng;
                          navigate("/location/" + place.place_id, {
                            state: {
                              place: {
                                place_id: place.place_id,
                                name: place.name,
                                rating: place.rating,
                                user_ratings_total: place.user_ratings_total,
                                vicinity: place.vicinity,
                                types: place.types,
                                photo:
                                  typeof place.photos?.[0]?.getUrl ===
                                  "function"
                                    ? place.photos[0].getUrl({ maxWidth: 1200 })
                                    : (place.photo ?? null),
                                lat,
                                lng,
                              },
                            },
                          });
                        }}
                        className="bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-md">
                            {index + 1}
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <h3 className="font-bold text-slate-800 truncate text-xs sm:text-sm max-w-[150px] sm:max-w-[180px]">
                              {place.name}
                            </h3>
                            <p className="text-slate-500 text-xs">
                              ⭐ {place.rating || "No rating"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BUDGET */}
                  <div className="mt-auto rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 p-4 sm:p-5">
                    {[
                      { icon: "🍔", label: "Food", value: route.budget.food },
                      { icon: "🚕", label: "Taxi", value: route.budget.taxi },
                      { icon: "🏨", label: "Hotel", value: route.budget.hotel },
                    ].map(({ icon, label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between mb-2 sm:mb-3"
                      >
                        <span className="text-slate-500 text-sm sm:text-base">
                          {icon} {label}
                        </span>
                        <span className="font-black text-slate-700 text-sm sm:text-base">
                          {value} грн
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 sm:pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-slate-700">
                        Total
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-sky-500">
                        {route.budget.total} грн
                      </span>
                    </div>
                  </div>

                  {/* SAVE */}
                  <button
                    onClick={async () => {
                      setSavingId(route.id);
                      await saveRoute({
                        ...route,
                        city: selectedCity?.city || "",
                      });
                      setSavingId(null);
                      setSavedMessage(
                        `✨ Маршрут "${route.title}" успішно збережено`,
                      );
                      setTimeout(() => setSavedMessage(""), 3000);
                    }}
                    disabled={savingId === route.id}
                    className="w-full mt-4 sm:mt-6 bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all shadow-lg shadow-sky-200 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {savingId === route.id ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Зберігаємо...
                      </>
                    ) : (
                      "✨ Зберегти маршрут"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
