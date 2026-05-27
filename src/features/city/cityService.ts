export const getCityByCoords = async (lat: number, lng: number) => {
  const geocoder = new google.maps.Geocoder();

  const result = await geocoder.geocode({
    location: { lat, lng },
  });

  const cityComponent = result.results[0]?.address_components.find((c: any) =>
    c.types.includes("locality"),
  );

  return {
    city: cityComponent?.long_name,
    location: result.results[0]?.geometry.location,
  };
};
