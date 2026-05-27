import { calculateBudget } from "../budget/budgetService";

const unique = (places: any[]) => {
  const map = new Map();

  places.forEach((p) => {
    const rating = p.rating || 0;

    // FILTER LOW QUALITY PLACES
    if (rating < 3) return;

    // FILTER PLACES WITHOUT NAME
    if (!p.name) return;

    // FILTER PLACES WITHOUT GEOMETRY
    if (!p.geometry?.location) return;

    if ((p.user_ratings_total || 0) < 20) return;

    if (!map.has(p.place_id)) {
      map.set(p.place_id, p);
    }
  });

  return [...map.values()];
};

const popularity = (p: any) => (p.rating || 0) * (p.user_ratings_total || 1);

const sortByPopularity = (places: any[]) => {
  return [...places].sort((a, b) => popularity(b) - popularity(a));
};

const distance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
};

const buildRoute = (places: any[], startPoint: any, limit = 5) => {
  if (!places.length) return [];

  const sorted = sortByPopularity(unique(places));

  const route = [];

  let current = startPoint;

  const remaining = [...sorted];

  while (route.length < limit && remaining.length) {
    remaining.sort((a, b) => {
      const aDist = distance(
        current.lat,
        current.lng,
        a.geometry.location.lat(),
        a.geometry.location.lng(),
      );

      const bDist = distance(
        current.lat,
        current.lng,
        b.geometry.location.lat(),
        b.geometry.location.lng(),
      );

      return aDist - bDist;
    });

    const next = remaining.shift();

    if (!next) break;

    route.push(next);

    current = {
      lat: next.geometry.location.lat(),
      lng: next.geometry.location.lng(),
    };
  }

  return route;
};

export const generateRoutes = ({
  historyPlaces,
  naturePlaces,
  cityPlaces,
  startPoint,
  budgetData,
}: any) => {
  const historyRoute = buildRoute(historyPlaces, startPoint);

  const natureRoute = buildRoute(naturePlaces, startPoint);

  const cityRoute = buildRoute(cityPlaces, startPoint);

  return [
    {
      id: crypto.randomUUID(),

      title: "History",

      description: "Музеї, собори та історичні місця",

      places: historyRoute,

      budget: calculateBudget({
        route: historyRoute,

        hotels: budgetData.hotels,

        cafes: budgetData.cafes,
      }),

      type: "history",
    },

    {
      id: crypto.randomUUID(),

      title: "Nature & Relax",

      description: "Парки, природа та спокійні локації",

      places: natureRoute,

      budget: calculateBudget({
        route: natureRoute,

        hotels: budgetData.hotels,

        cafes: budgetData.cafes,
      }),

      type: "nature",
    },

    {
      id: crypto.randomUUID(),

      title: "City Weekend",

      description: "Кафе, ресторани, бари та nightlife",

      places: cityRoute,

      budget: calculateBudget({
        route: cityRoute,

        hotels: budgetData.hotels,

        cafes: budgetData.cafes,
      }),

      type: "city",
    },
  ].filter((r) => r.places.length > 0);
};
