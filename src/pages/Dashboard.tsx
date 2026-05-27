import { useEffect, useState } from "react";
import Navbar from "../components/layouts/NavBar";
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

const libraries: "places"[] = ["places"];

import { useNavigate } from "react-router-dom";

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
  return {
    lat: isNaN(lat) ? 50.2547 : lat,
    lng: isNaN(lng) ? 28.6587 : lng,
  };
};

export default function DashboardPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [openedRoute, setOpenedRoute] = useState<any>(null);
  const [direction, setDirection] = useState<any>(null);
  const [deletedMessage, setDeletedMessage] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();

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
    const data = await getRoutes();
    setRoutes(data);
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
      const waypoints = places.slice(1, -1).map((place: any) => {
        const loc = getLatLng(place);
        return {
          location: new window.google.maps.LatLng(loc.lat, loc.lng),
          stopover: true,
        };
      });
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
    const placeWithPhoto = route.places?.find((p: any) => p.photo);
    return (
      placeWithPhoto?.photo ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
    );
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] w-[350px] h-[350px] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] w-[220px] h-[220px] rounded-full bg-cyan-200/50 blur-3xl" />
      </div>
      <Navbar />

      {deletedMessage && (
        <div className="fixed top-6 right-6 z-50 animate-[fadeIn_.3s_ease]">
          <div className="bg-white border border-red-100 shadow-2xl rounded-3xl px-6 py-5 min-w-[320px]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-2xl">
                🗑️
              </div>
              <div>
                <h3 className="font-black text-slate-800 mb-1">
                  Маршрут видалено
                </h3>
                <p className="text-slate-500 text-sm">{deletedMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-800">Мої маршрути</h1>
            <p className="text-slate-500 mt-2">Збережені travel-маршрути</p>
          </div>
          <div className="bg-white rounded-3xl px-6 py-4 shadow-lg border border-slate-200">
            <div className="text-3xl font-black text-sky-500">
              {routes.length}
            </div>
            <div className="text-slate-500 text-sm">маршрутів</div>
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-40 h-40 rounded-full bg-sky-100 flex items-center justify-center mb-8 shadow-inner">
              <div className="text-7xl">🗺️</div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4 text-center">
              У вас ще немає маршрутів
            </h2>
            <p className="text-slate-500 text-lg text-center max-w-xl mb-10">
              Згенеруйте свій перший travel-маршрут та збережіть його у
              dashboard для подальшого перегляду.
            </p>
            <button
              onClick={() => (window.location.href = "/generator")}
              className="bg-sky-500 hover:bg-sky-600 text-white px-10 py-5 rounded-3xl text-xl font-black shadow-xl transition hover:scale-105"
            >
              ✨ Відкрити генератор
            </button>
          </div>
        ) : (
          <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="group bg-white rounded-[34px] overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                {/* IMAGE */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={getRoutePhoto(route)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-sky-500/95 backdrop-blur text-white px-4 py-2 rounded-2xl text-sm font-black capitalize shadow-lg">
                    {route.type}
                  </div>
                  {route.isPublic && (
                    <div className="absolute top-4 right-4 bg-green-500/95 backdrop-blur text-white px-3 py-2 rounded-2xl text-xs font-black shadow-lg">
                      🌍 Публічний
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h2 className="text-3xl font-black text-slate-800 mb-2 line-clamp-1">
                      {route.title}
                    </h2>

                    {route.savedFrom ? (
                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        📌 Збережено від{" "}
                        <span className="font-bold text-slate-500">
                          {route.savedFrom}
                        </span>
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 min-h-[42px]">
                        {route.description}
                      </p>
                    )}
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4">
                      <div className="text-slate-400 text-sm mb-1">Локацій</div>
                      <div className="text-3xl font-black text-sky-500">
                        {route.places?.length || 0}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4">
                      <div className="text-slate-400 text-sm mb-1">Бюджет</div>
                      <div className="text-3xl font-black text-slate-800">
                        {route.budget?.total || 0}
                      </div>
                    </div>
                  </div>

                  {/* PLACES */}
                  <div className="space-y-3 mb-6 max-h-[260px] overflow-y-auto pr-1">
                    {route.places?.map((place: any, index: number) => (
                      <div
                        key={place.place_id}
                        onClick={() =>
                          navigate("/location/" + place.place_id, {
                            state: { place },
                          })
                        }
                        className={`group/place relative border rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                          ${
                            isVisited(route.id, place.place_id)
                              ? "bg-slate-100 border-slate-200"
                              : "bg-slate-50 border-slate-100 hover:border-sky-300 hover:bg-sky-50"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow transition-colors
                            ${isVisited(route.id, place.place_id) ? "bg-green-400" : "bg-sky-500"}`}
                          >
                            {isVisited(route.id, place.place_id)
                              ? "✓"
                              : index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`font-bold truncate transition-colors
                              ${isVisited(route.id, place.place_id) ? "text-slate-400 line-through" : "text-slate-800"}`}
                            >
                              {place.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              ⭐ {place.rating || "—"}
                            </div>
                          </div>
                          <button
                            onClick={(e) =>
                              toggleVisited(e, route.id, place.place_id)
                            }
                            className={`shrink-0 opacity-0 group-hover/place:opacity-100 transition-all duration-200 px-3 py-1 rounded-xl text-xs font-bold
                              ${
                                isVisited(route.id, place.place_id)
                                  ? "bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500"
                                  : "bg-green-100 text-green-600 hover:bg-green-200"
                              }`}
                          >
                            {isVisited(route.id, place.place_id)
                              ? "Скасувати"
                              : "✓ Відвідано"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => {
                        setDirection(null);
                        setOpenedRoute(route);
                      }}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-4 font-black transition shadow-lg shadow-sky-200"
                    >
                      Open
                    </button>

                    {!route.savedFrom && (
                      <button
                        onClick={(e) => handleTogglePublic(e, route)}
                        disabled={togglingId === route.id}
                        className={`flex-1 rounded-2xl py-4 font-black transition disabled:opacity-50
                          ${
                            route.isPublic
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                      >
                        {togglingId === route.id
                          ? "..."
                          : route.isPublic
                            ? "🌍 Публічний"
                            : "🔒 Приватний"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(route)}
                      className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-700 rounded-2xl px-5 font-black transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {openedRoute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] w-full max-w-6xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-3xl font-black text-slate-800">
                  {openedRoute.title}
                </h2>
                <p className="text-slate-500 mt-1">Візуалізація маршруту</p>
              </div>
              <button
                onClick={() => {
                  setOpenedRoute(null);
                  setDirection(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 px-5 py-3 rounded-2xl font-bold"
              >
                Close
              </button>
            </div>

            <div className="h-[650px] flex items-center justify-center bg-slate-50">
              {!isLoaded && (
                <p className="text-slate-400 font-semibold">
                  Завантаження карти...
                </p>
              )}
              {isLoaded && !direction && (
                <p className="text-slate-400 font-semibold">
                  Побудова маршруту...
                </p>
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
