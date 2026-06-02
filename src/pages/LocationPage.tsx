import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

export default function LocationPage() {
  const { state } = useLocation();
  const place = state?.place;

  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const lat = place?.lat ?? place?.geometry?.location?.lat;
  const lng = place?.lng ?? place?.geometry?.location?.lng;
  const resolvedLat = typeof lat === "function" ? lat() : parseFloat(lat);
  const resolvedLng = typeof lng === "function" ? lng() : parseFloat(lng);

  useEffect(() => {
    if (!isLoaded || !place?.place_id) return;
    const map = new window.google.maps.Map(document.createElement("div"));
    const service = new window.google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: place.place_id,
        fields: [
          "name",
          "rating",
          "user_ratings_total",
          "reviews",
          "photos",
          "editorial_summary",
          "formatted_address",
          "opening_hours",
          "website",
          "types",
          "vicinity",
        ],
        language: "uk",
      },
      (result, status) => {
        setLoadingDetails(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK)
          setDetails(result);
      },
    );
  }, [isLoaded, place?.place_id]);

  const getPhoto = () => {
    if (details?.photos?.[0])
      return details.photos[0].getUrl({ maxWidth: 1600, maxHeight: 900 });
    if (place?.photo && !place.photo.includes("PhotoService"))
      return place.photo;
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80";
  };

  const reviews = details?.reviews || [];
  const description =
    details?.editorial_summary?.overview ||
    `${place?.name} — локація у категорії ${place?.types?.[0]?.replace(/_/g, " ") || "місце"}, рейтинг ${place?.rating || "—"} з 5.`;

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-500 px-4 text-center">
        Локацію не знайдено
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-60px] sm:right-[-100px] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] sm:left-[20%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-white/60 blur-3xl" />
      </div>
      <Navbar />

      {/* HERO */}
      <div className="relative h-[280px] sm:h-[360px] lg:h-[420px] w-full overflow-hidden bg-slate-800">
        <img
          src={getPhoto()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-110"
          style={{ filter: "blur(18px)" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80";
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
          <div
            className="w-full max-w-xs sm:max-w-md lg:max-w-2xl rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 flex flex-col items-center text-center gap-3 sm:gap-4"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[16px] sm:rounded-[20px] overflow-hidden border-2 border-white/30 shadow-xl shrink-0">
              <img
                src={getPhoto()}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80";
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-1 sm:mb-2 drop-shadow">
                {place.name}
              </h1>
              {loadingDetails ? (
                <div className="h-3 sm:h-4 w-36 sm:w-48 bg-white/20 rounded-full animate-pulse mx-auto" />
              ) : (
                <p className="text-white/70 text-sm sm:text-base">
                  {details?.formatted_address ||
                    place.vicinity ||
                    "Популярна travel-локація"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <div className="bg-white/20 border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm backdrop-blur">
                ⭐ {details?.rating ?? place.rating ?? "—"} рейтинг
              </div>
              {place.types?.[0] && (
                <div className="bg-sky-500/80 border border-sky-400/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm capitalize backdrop-blur">
                  {place.types[0].replace(/_/g, " ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-6 sm:gap-8">
          {/* LEFT */}
          <div className="space-y-5 sm:space-y-8">
            {/* ABOUT */}
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-4 sm:mb-6">
                Про локацію
              </h2>
              {loadingDetails ? (
                <div className="space-y-2 sm:space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-full w-full" />
                  <div className="h-4 bg-slate-100 rounded-full w-4/5" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/5" />
                </div>
              ) : (
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base lg:text-lg">
                  {description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-8">
                {loadingDetails ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-100 animate-pulse"
                    >
                      <div className="h-3 w-10 sm:w-12 bg-slate-200 rounded-full mb-2 sm:mb-3" />
                      <div className="h-7 sm:h-8 w-12 sm:w-16 bg-slate-200 rounded-xl" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-100">
                      <div className="text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">
                        Рейтинг
                      </div>
                      <div className="text-xl sm:text-3xl font-black text-sky-500">
                        ⭐ {details?.rating ?? place.rating ?? "—"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-100">
                      <div className="text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">
                        Відгуків
                      </div>
                      <div className="text-xl sm:text-3xl font-black text-slate-800">
                        {details?.user_ratings_total ??
                          place.user_ratings_total ??
                          0}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-100">
                      <div className="text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">
                        Тип
                      </div>
                      <div className="text-sm sm:text-xl font-black text-slate-800 capitalize">
                        {(place.types?.[0] || "place").replace(/_/g, " ")}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!loadingDetails &&
                details?.opening_hours?.weekday_text?.length > 0 && (
                  <div className="mt-5 sm:mt-8">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-3 sm:mb-4">
                      Години роботи
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {details.opening_hours.weekday_text.map(
                        (line: string, i: number) => (
                          <div
                            key={i}
                            className="text-slate-600 text-xs sm:text-sm"
                          >
                            {line}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* MAP on mobile — shown here between about and reviews */}
            <div className="lg:hidden bg-white rounded-[24px] overflow-hidden shadow-lg border border-slate-200">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Карта
                </h2>
              </div>
              <div className="h-[280px] sm:h-[340px]">
                {!isLoaded ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-xs sm:text-sm font-medium">
                      Завантаження карти...
                    </p>
                  </div>
                ) : !isNaN(resolvedLat) && !isNaN(resolvedLng) ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={{ lat: resolvedLat, lng: resolvedLng }}
                    zoom={15}
                  >
                    <Marker position={{ lat: resolvedLat, lng: resolvedLng }} />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
                    Координати недоступні
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                {!isNaN(resolvedLat) && !isNaN(resolvedLng) && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${resolvedLat},${resolvedLng}&query_place_id=${place.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-3.5 sm:py-4 font-black text-sm sm:text-base transition flex items-center justify-center"
                  >
                    🗺️ Відкрити в Google Maps
                  </a>
                )}
                {!loadingDetails && details?.website && (
                  <a
                    href={details.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3.5 sm:py-4 font-black text-sm sm:text-base transition flex items-center justify-center"
                  >
                    🌐 Офіційний сайт
                  </a>
                )}
              </div>
            </div>

            {/* REVIEWS */}
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-4 sm:mb-6">
                Відгуки
              </h2>
              {loadingDetails ? (
                <div className="space-y-3 sm:space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 space-y-2 sm:space-y-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200" />
                        <div className="h-3 sm:h-4 w-20 sm:w-24 bg-slate-200 rounded-full" />
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full w-full" />
                      <div className="h-3 bg-slate-100 rounded-full w-4/5" />
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  {reviews.slice(0, 5).map((review: any) => (
                    <div
                      key={review.time}
                      className="bg-slate-50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0">
                            {review.profile_photo_url ? (
                              <img
                                src={review.profile_photo_url}
                                alt={review.author_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = "none";
                                  el.parentElement!.innerHTML = `<div class="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-sm">${review.author_name.charAt(0).toUpperCase()}</div>`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-sm">
                                {review.author_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="font-black text-slate-800 text-sm sm:text-base">
                            {review.author_name}
                          </div>
                        </div>
                        <div className="text-sky-500 font-bold text-xs sm:text-sm">
                          ⭐ {review.rating}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xs sm:text-sm sm:text-base">
                        {review.text}
                      </p>
                      <div className="text-slate-400 text-xs mt-1 sm:mt-2">
                        {review.relative_time_description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm sm:text-base">
                  Відгуків поки немає
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — only on desktop */}
          <div className="hidden lg:flex flex-col space-y-8">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-800">Карта</h2>
              </div>
              <div className="h-[400px]">
                {!isLoaded ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-3">
                    <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">
                      Завантаження карти...
                    </p>
                  </div>
                ) : !isNaN(resolvedLat) && !isNaN(resolvedLng) ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={{ lat: resolvedLat, lng: resolvedLng }}
                    zoom={15}
                  >
                    <Marker position={{ lat: resolvedLat, lng: resolvedLng }} />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
                    Координати недоступні
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-200 space-y-3">
              {!isNaN(resolvedLat) && !isNaN(resolvedLng) && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${resolvedLat},${resolvedLng}&query_place_id=${place.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-3xl py-5 font-black text-lg transition flex items-center justify-center"
                >
                  🗺️ Відкрити в Google Maps
                </a>
              )}
              {!loadingDetails && details?.website && (
                <a
                  href={details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-3xl py-5 font-black text-lg transition flex items-center justify-center"
                >
                  🌐 Офіційний сайт
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
