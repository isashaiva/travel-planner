export const getLat = (place: any) => {
  if (!place?.geometry?.location) return 0;

  return typeof place.geometry.location.lat === "function"
    ? place.geometry.location.lat()
    : place.geometry.location.lat;
};

export const getLng = (place: any) => {
  if (!place?.geometry?.location) return 0;

  return typeof place.geometry.location.lng === "function"
    ? place.geometry.location.lng()
    : place.geometry.location.lng;
};
