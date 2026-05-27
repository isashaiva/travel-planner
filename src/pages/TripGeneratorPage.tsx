import { useState } from "react";

import GoogleMapPicker from "../components/map/GoogleMapPicker";

import { generateRoutes } from "../features/routes/routeService";

import { getCityByCoords } from "../features/city/cityService";

import { saveRoute } from "../features/dashboard/dashboardService";
import Navbar from "../components/layouts/NavBar";
import Footer from "../components/layouts/Footer";
import { useNavigate } from "react-router-dom";

export default function TripGeneratorPage() {
  const [routes, setRoutes] = useState<any[]>([]);

  const [activeRoute, setActiveRoute] = useState<any>(null);

  const [selectedCity, setSelectedCity] = useState<any>(null);

  const [savedMessage, setSavedMessage] = useState("");

  const navigate = useNavigate();

  const handleSelect = async (lat: number, lng: number) => {
    const service = new google.maps.places.PlacesService(
      document.createElement("div"),
    );

    const searchNearby = (type: string): Promise<any[]> => {
      return new Promise((resolve) => {
        service.nearbySearch(
          {
            location: { lat, lng },

            radius: 45000,

            type,
          },
          (results, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              resolve(results);
            } else {
              resolve([]);
            }
          },
        );
      });
    };

    // SEARCH
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

    // ROUTES
    const generatedRoutes = generateRoutes({
      historyPlaces: [...museums, ...attractions],

      naturePlaces: parks,

      cityPlaces: [...restaurants, ...bars, ...cafes],

      startPoint: { lat, lng },

      budgetData: {
        hotels,
        cafes: [...restaurants, ...cafes],
      },
    });

    setRoutes(generatedRoutes);

    const cityData = await getCityByCoords(lat, lng);

    setSelectedCity({
      lat,
      lng,
      city: cityData.city,
    });
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      {/* BACKGROUND BUBBLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />

        <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-3xl" />

        <div className="absolute bottom-[-120px] left-[20%] w-[350px] h-[350px] rounded-full bg-white/60 blur-3xl" />

        <div className="absolute bottom-[10%] right-[10%] w-[220px] h-[220px] rounded-full bg-cyan-200/50 blur-3xl" />
      </div>
      {savedMessage && (
        <div className="fixed top-6 right-6 z-50 animate-[fadeIn_.3s_ease]">
          <div className="bg-white border border-sky-100 shadow-2xl rounded-3xl px-6 py-5 min-w-[320px]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl">
                ✨
              </div>

              <div>
                <h3 className="font-black text-slate-800 mb-1">
                  Маршрут збережено
                </h3>

                <p className="text-slate-500 text-sm">{savedMessage}</p>
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

      <div className="max-w-7xl mx-auto p-6">
        {!selectedCity && (
          <div className="py-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* BADGE */}
              <div className="inline-flex items-center gap-3 bg-white border border-sky-100 shadow-lg rounded-full px-6 py-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />

                <span className="font-bold text-slate-700">
                  Travel Route Generator
                </span>
              </div>

              {/* TITLE */}
              <h1 className="text-6xl font-black text-slate-800 leading-tight mb-6">
                Створи свій
                <span className="block text-sky-500">ідеальний маршрут</span>
              </h1>

              {/* DESCRIPTION */}
              <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-14">
                Обери будь-яку точку на карті і система автоматично згенерує
                готові маршрути з популярними місцями, бюджетом та візуалізацією
                маршруту.
              </p>

              {/* FEATURES */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[30px] border border-slate-100 shadow-lg p-8">
                  <div className="w-16 h-16 rounded-3xl bg-sky-100 flex items-center justify-center text-3xl mx-auto mb-5">
                    🗺️
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-3">
                    Smart Routes
                  </h3>

                  <p className="text-slate-500 leading-relaxed">
                    Автоматична генерація маршрутів по місту з реальними
                    локаціями.
                  </p>
                </div>

                <div className="bg-white rounded-[30px] border border-slate-100 shadow-lg p-8">
                  <div className="w-16 h-16 rounded-3xl bg-sky-100 flex items-center justify-center text-3xl mx-auto mb-5">
                    💸
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-3">
                    Budget Planner
                  </h3>

                  <p className="text-slate-500 leading-relaxed">
                    Розрахунок бюджету на їжу, готель та транспорт.
                  </p>
                </div>

                <div className="bg-white rounded-[30px] border border-slate-100 shadow-lg p-8">
                  <div className="w-16 h-16 rounded-3xl bg-sky-100 flex items-center justify-center text-3xl mx-auto mb-5">
                    ✨
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-3">
                    Save & Explore
                  </h3>

                  <p className="text-slate-500 leading-relaxed">
                    Зберігай маршрути у dashboard та переглядай їх на карті.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedCity && (
          <div className="mb-8">
            <h1 className="text-5xl font-black text-gray-800">
              {selectedCity.city}
            </h1>

            <p className="text-gray-500 mt-2">
              Автоматично згенеровані маршрути
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {routes.map((route) => (
            <div
              key={route.id}
              onMouseEnter={() => setActiveRoute(route)}
              onMouseLeave={() => setActiveRoute(null)}
              className="group relative overflow-hidden rounded-[34px] border border-sky-100 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
            >
              {/* TOP GRADIENT */}
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />

              {/* CONTENT */}
              <div className="p-7 flex flex-col flex-1">
                {/* HEADER */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">
                      {route.title}
                    </h2>

                    <p className="text-slate-500 text-sm leading-relaxed max-w-[260px] line-clamp-2 min-h-[40px]">
                      {route.description}
                    </p>
                  </div>

                  <div className="bg-sky-100 text-sky-600 px-4 py-2 rounded-2xl text-sm font-black capitalize">
                    {route.type}
                  </div>
                </div>

                {/* PLACES */}
                <div className="space-y-3 mb-7">
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
                                place.photos?.[0]?.getUrl({ maxWidth: 1200 }) ??
                                null,
                              lat,
                              lng,
                            },
                          },
                        });
                      }}
                      className="bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-slate-100 rounded-2xl p-4 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* NUMBER */}
                          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                            {index + 1}
                          </div>

                          {/* INFO */}
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 truncate max-w-[180px]">
                              {place.name}
                            </h3>

                            <p className="text-slate-500 text-sm">
                              ⭐ {place.rating || "No rating"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BUDGET */}
                <div className="mt-auto rounded-3xl bg-slate-50 border border-slate-100 p-5">
                  <div className="flex justify-between mb-3">
                    <span className="text-slate-500">🍔 Food</span>

                    <span className="font-black text-slate-700">
                      {route.budget.food} грн
                    </span>
                  </div>

                  <div className="flex justify-between mb-3">
                    <span className="text-slate-500">🚕 Taxi</span>

                    <span className="font-black text-slate-700">
                      {route.budget.taxi} грн
                    </span>
                  </div>

                  <div className="flex justify-between mb-4">
                    <span className="text-slate-500">🏨 Hotel</span>

                    <span className="font-black text-slate-700">
                      {route.budget.hotel} грн
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-700">
                      Total
                    </span>

                    <span className="text-3xl font-black text-sky-500">
                      {route.budget.total} грн
                    </span>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  onClick={async () => {
                    await saveRoute(route);

                    setSavedMessage(
                      `✨ Маршрут "${route.title}" успішно збережено`,
                    );

                    setTimeout(() => {
                      setSavedMessage("");
                    }, 3000);
                  }}
                  className="w-full mt-6 bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-sky-200"
                >
                  ✨ Зберегти маршрут
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
