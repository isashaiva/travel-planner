export const calculateCityBudget = (places: any[]) => {
  const popularity =
    places.reduce((sum, p) => sum + (p.user_ratings_total || 0), 0) /
    places.length;

  let cityCoef = 1;

  if (popularity > 20000) {
    cityCoef = 2;
  } else if (popularity > 10000) {
    cityCoef = 1.6;
  } else if (popularity > 5000) {
    cityCoef = 1.3;
  }

  return {
    foodBase: Math.round(350 * cityCoef),

    hotelBase: Math.round(2200 * cityCoef),

    cityCoef,
  };
};
