const avgPriceLevel = (places: any[]) => {
  const valid = places.filter((p) => p.price_level !== undefined);

  if (!valid.length) return 2;

  const sum = valid.reduce((acc, p) => acc + p.price_level, 0);

  return sum / valid.length;
};

const distance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const calculateTaxi = (route: any[]) => {
  let total = 0;

  for (let i = 0; i < route.length - 1; i++) {
    total += distance(
      route[i].geometry.location.lat(),
      route[i].geometry.location.lng(),

      route[i + 1].geometry.location.lat(),
      route[i + 1].geometry.location.lng(),
    );
  }

  const taxiPricePerKm = 32;

  return Math.round(total * taxiPricePerKm);
};

export const calculateBudget = ({ route, hotels, cafes }: any) => {
  // HOTEL
  const hotelLevel = avgPriceLevel(hotels);

  const hotel = 1200 + hotelLevel * 900;

  // FOOD
  const foodLevel = avgPriceLevel(cafes);

  const food = route.length * (250 + foodLevel * 180);

  // TAXI
  const taxi = calculateTaxi(route);

  return {
    hotel: Math.round(hotel),

    food: Math.round(food),

    taxi,

    total: Math.round(hotel + food + taxi),
  };
};
