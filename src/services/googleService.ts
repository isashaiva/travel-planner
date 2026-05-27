export const getCityByCoords = async (lat: number, lng: number) => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`,
  );

  const data = await res.json();

  return data.results[0];
};
