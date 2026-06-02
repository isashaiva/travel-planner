import { useEffect, useState } from "react";
import Navbar from "../components/layouts/Navbar";
import {
  deleteRoute,
  getRoutes,
  togglePublic,
} from "../features/dashboard/dashboardService";
import {
  DirectionsRenderer,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import Footer from "../components/layouts/Footer";
import { useNavigate } from "react-router-dom";

const libraries: "places"[] = ["places"];

const getLatLng = (place: any): { lat: number; lng: number } => {
  const extract = (val: any): number =>
    typeof val === "function" ? val() : parseFloat(val);
  let lat = extract(place.lat);
  let lng = extract(place.lng);
  if (isNaN(lat) || isNaN(lng)) {
    const loc = place.geometry?.location;
    lat = extract(loc?.lat);
    lng = extract(loc?.lng);
  }
  return { lat: isNaN(lat) ? 50.2547 : lat, lng: isNaN(lng) ? 28.6587 : lng };
};

function RouteCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] sm:rounded-[34px] overflow-hidden border border-slate-200 shadow-lg flex flex-col h-full animate-pulse">
      <div className="h-40 sm:h-52 bg-slate-200" />
      <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1">
        <div className="h-7 sm:h-8 bg-slate-100 rounded-2xl w-3/4" />
        <div className="h-4 bg-slate-100 rounded-full w-full" />
        <div className="h-4 bg-slate-100 rounded-full w-2/3" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="h-16 sm:h-20 bg-slate-100 rounded-2xl sm:rounded-3xl" />
          <div className="h-16 sm:h-20 bg-slate-100 rounded-2xl sm:rounded-3xl" />
        </div>
        <div className="space-y-2">
          <div className="h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
        </div>
        <div className="flex gap-2 sm:gap-3 mt-auto">
          <div className="flex-1 h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="flex-1 h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="w-12 sm:w-14 h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openedRoute, setOpenedRoute] = useState<any>(null);
  const [direction, setDirection] = useState<any>(null);
  const [deletedMessage, setDeletedMessage] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const types = ["all", "history", "city", "nature"];

  const filteredRoutes = routes.filter((route) => {
    const matchesType = filterType === "all" ? true : route.type === filterType;
    const matchesSearch =
      search.trim() === "" ||
      route.title?.toLowerCase().includes(search.toLowerCase()) ||
      route.description?.toLowerCase().includes(search.toLowerCase()) ||
      route.city?.toLowerCase().includes(search.toLowerCase()) ||
      route.places?.some((place: any) =>
        place.name?.toLowerCase().includes(search.toLowerCase()),
      );
    return matchesType && matchesSearch;
  });

  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("visitedPlaces");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const getVisitedKey = (routeId: string, placeId: string) =>
    `${routeId}:${placeId}`;
  const isVisited = (routeId: string, placeId: string) =>
    visitedPlaces.has(getVisitedKey(routeId, placeId));

  const toggleVisited = (
    e: React.MouseEvent,
    routeId: string,
    placeId: string,
  ) => {
    e.stopPropagation();
    const key = getVisitedKey(routeId, placeId);
    setVisitedPlaces((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem("visitedPlaces", JSON.stringify([...next]));
      return next;
    });
  };

  const handleTogglePublic = async (e: React.MouseEvent, route: any) => {
    e.stopPropagation();
    setTogglingId(route.id);
    await togglePublic(route.id, !route.isPublic);
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === route.id ? { ...r, isPublic: !r.isPublic } : r,
      ),
    );
    setTogglingId(null);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    loadRoutes();
  }, []);
  useEffect(() => {
    if (!openedRoute || !isLoaded) return;
    buildRoute();
  }, [openedRoute, isLoaded]);

  const loadRoutes = async () => {
    setLoading(true);
    const data = await getRoutes();
    setRoutes(data);
    setLoading(false);
  };

  const handleDelete = async (route: any) => {
    const previousRoutes = routes;
    setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    setDeletedMessage(`Маршрут "${route.title}" видалено`);
    setTimeout(() => setDeletedMessage(""), 3000);
    const success = await deleteRoute(route.id);
    if (!success) setRoutes(previousRoutes);
  };

  const buildRoute = async () => {
    try {
      if (!openedRoute?.places?.length) return;
      const service = new window.google.maps.DirectionsService();
      const places = openedRoute.places;
      const origin = getLatLng(places[0]);
      const destination = getLatLng(places[places.length - 1]);
      const waypoints = places.slice(1, -1).map((place: any) => ({
        location: new window.google.maps.LatLng(
          getLatLng(place).lat,
          getLatLng(place).lng,
        ),
        stopover: true,
      }));
      const response = await service.route({
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(
          destination.lat,
          destination.lng,
        ),
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      setDirection(response);
    } catch (error) {
      console.error("buildRoute error:", error);
    }
  };

  const getRoutePhoto = (route: any) => {
    const p = route.places?.find((p: any) => p.photo);
    return (
      p?.photo ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
    );
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-60px] sm:right-[-100px] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] sm:left-[20%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-white/60 blur-3xl" />
      </div>
      <Navbar />

      {deletedMessage && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
          <div className="bg-white border border-red-100 shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-4 sm:py-5 min-w-[260px] sm:min-w-[320px]">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-100 flex items-center justify-center text-xl sm:text-2xl">
                🗑️
              </div>
              <div>
                <h3 className="font-black text-slate-800 mb-1 text-sm sm:text-base">
                  Маршрут видалено
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  {deletedMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800">
              Мої маршрути
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Збережені travel-маршрути
            </p>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg border border-slate-200 min-w-[64px] sm:min-w-[80px] text-center">
            {loading ? (
              <div className="h-7 sm:h-9 w-7 sm:w-8 bg-slate-100 rounded-xl animate-pulse mx-auto mb-1" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-sky-500">
                {filteredRoutes.length}
              </div>
            )}
            <div className="text-slate-500 text-xs sm:text-sm">маршрутів</div>
          </div>
        </div>

        {/* FILTERS + SEARCH */}
        {!loading && routes.length > 0 && (
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-slate-400 text-sm sm:text-base">
                🔍
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук по назві, місту, локаціях..."
                className="w-full bg-white/60 backdrop-blur border border-white/60 rounded-xl sm:rounded-2xl pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300 shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-3 sm:right-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition capitalize
                    ${filterType === type ? "bg-sky-500 text-white shadow-lg shadow-sky-200" : "bg-white/60 border border-white/60 text-slate-600 hover:bg-white"}`}
                >
                  {type === "all"
                    ? "🗺️ Всі"
                    : type === "history"
                      ? "🏛️ History"
                      : type === "city"
                        ? "🌆 City"
                        : "🌿 Nature"}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <RouteCardSkeleton />
            <RouteCardSkeleton />
            <RouteCardSkeleton />
          </div>
        ) : routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4">
            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-sky-100 flex items-center justify-center mb-6 sm:mb-8 shadow-inner">
              <div className="text-5xl sm:text-7xl">🗺️</div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 mb-3 sm:mb-4">
              У вас ще немає маршрутів
            </h2>
            <p className="text-slate-500 text-base sm:text-lg text-center max-w-xl mb-8 sm:mb-10">
              Згенеруйте свій перший travel-маршрут та збережіть його у
              dashboard.
            </p>
            <button
              onClick={() => (window.location.href = "/generator")}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-black shadow-xl transition hover:scale-105"
            >
              ✨ Відкрити генератор
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredRoutes.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 xl:col-span-3 text-center py-16 sm:py-20 text-slate-400">
                <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                <p className="text-base sm:text-lg font-bold">
                  Нічого не знайдено
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  Спробуй змінити пошуковий запит або фільтр
                </p>
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className="group bg-white rounded-[24px] sm:rounded-[34px] overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="relative h-40 sm:h-52 overflow-hidden">
                    <img
                      src={getRoutePhoto(route)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-sky-500/95 backdrop-blur text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black capitalize shadow-lg">
                      {route.type}
                    </div>
                    {route.isPublic && (
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-green-500/95 backdrop-blur text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-black shadow-lg">
                        🌍 Публічний
                      </div>
                    )}
                    {route.city && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/40 backdrop-blur text-white px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-bold">
                        📍 {route.city}
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="mb-3 sm:mb-4">
                      <h2 className="text-xl sm:text-3xl font-black text-slate-800 mb-1 sm:mb-2 line-clamp-1">
                        {route.title}
                      </h2>
                      {route.savedFrom ? (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          📌 Збережено від{" "}
                          <span className="font-bold text-slate-500">
                            {route.savedFrom}
                          </span>
                        </p>
                      ) : (
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 min-h-[36px] sm:min-h-[42px]">
                          {route.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 p-3 sm:p-4">
                        <div className="text-slate-400 text-xs sm:text-sm mb-1">
                          Локацій
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-sky-500">
                          {route.places?.length || 0}
                        </div>
                      </div>
                      <div className="rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 p-3 sm:p-4">
                        <div className="text-slate-400 text-xs sm:text-sm mb-1">
                          Бюджет
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-800">
                          {route.budget?.total || 0}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-[200px] sm:max-h-[260px] overflow-y-auto pr-1">
                      {route.places?.map((place: any, index: number) => (
                        <div
                          key={place.place_id}
                          onClick={() =>
                            navigate("/location/" + place.place_id, {
                              state: { place },
                            })
                          }
                          className={`group/place relative border rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                            ${isVisited(route.id, place.place_id) ? "bg-slate-100 border-slate-200" : "bg-slate-50 border-slate-100 hover:border-sky-300 hover:bg-sky-50"}`}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow transition-colors
                              ${isVisited(route.id, place.place_id) ? "bg-green-400" : "bg-sky-500"}`}
                            >
                              {isVisited(route.id, place.place_id)
                                ? "✓"
                                : index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`font-bold truncate text-xs sm:text-sm transition-colors ${isVisited(route.id, place.place_id) ? "text-slate-400 line-through" : "text-slate-800"}`}
                              >
                                {place.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                ⭐ {place.rating || "—"}
                              </div>
                            </div>
                            <button
                              onClick={(e) =>
                                toggleVisited(e, route.id, place.place_id)
                              }
                              className={`shrink-0 opacity-0 group-hover/place:opacity-100 transition-all duration-200 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-bold
                                ${isVisited(route.id, place.place_id) ? "bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                            >
                              {isVisited(route.id, place.place_id)
                                ? "Скасувати"
                                : "✓"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 sm:gap-3 mt-auto">
                      <button
                        onClick={() => {
                          setDirection(null);
                          setOpenedRoute(route);
                        }}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl sm:rounded-2xl py-3 sm:py-4 font-black text-sm sm:text-base transition shadow-lg shadow-sky-200"
                      >
                        Open
                      </button>
                      {!route.savedFrom && (
                        <button
                          onClick={(e) => handleTogglePublic(e, route)}
                          disabled={togglingId === route.id}
                          className={`flex-1 rounded-xl sm:rounded-2xl py-3 sm:py-4 font-black text-xs sm:text-sm transition disabled:opacity-50 flex items-center justify-center
                            ${route.isPublic ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                        >
                          {togglingId === route.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : route.isPublic ? (
                            "🌍 Публ."
                          ) : (
                            "🔒 Приват."
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(route)}
                        className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-700 rounded-xl sm:rounded-2xl px-3 sm:px-5 font-black transition text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {openedRoute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white rounded-t-[28px] sm:rounded-[32px] w-full sm:max-w-6xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-800">
                  {openedRoute.title}
                </h2>
                <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-base">
                  Візуалізація маршруту
                </p>
              </div>
              <button
                onClick={() => {
                  setOpenedRoute(null);
                  setDirection(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base"
              >
                ✕
              </button>
            </div>
            <div className="h-[50vh] sm:h-[650px] flex items-center justify-center bg-slate-50">
              {!isLoaded && (
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                  <p className="text-slate-400 font-semibold text-sm sm:text-base">
                    Завантаження карти...
                  </p>
                </div>
              )}
              {isLoaded && !direction && (
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                  <p className="text-slate-400 font-semibold text-sm sm:text-base">
                    Побудова маршруту...
                  </p>
                </div>
              )}
              {isLoaded && direction && (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={getLatLng(openedRoute.places[0])}
                  zoom={12}
                >
                  <DirectionsRenderer
                    directions={direction}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: "#0ea5e9",
                        strokeWeight: 6,
                        strokeOpacity: 0.9,
                      },
                    }}
                  />
                  {openedRoute.places.map((place: any, index: number) => (
                    <Marker
                      key={place.place_id}
                      position={getLatLng(place)}
                      label={{
                        text: isVisited(openedRoute.id, place.place_id)
                          ? "✓"
                          : `${index + 1}`,
                        color: "white",
                        fontWeight: "bold",
                      }}
                      icon={
                        isVisited(openedRoute.id, place.place_id)
                          ? {
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 12,
                              fillColor: "#4ade80",
                              fillOpacity: 1,
                              strokeColor: "white",
                              strokeWeight: 2,
                            }
                          : undefined
                      }
                    />
                  ))}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
