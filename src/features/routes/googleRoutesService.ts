export const getRouteData = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const res = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "routes.duration,routes.distanceMeters,routes.polyline",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: origin,
          },
        },
        destination: {
          location: {
            latLng: destination,
          },
        },
        travelMode: "DRIVE",
      }),
    },
  );

  return await res.json();
};
