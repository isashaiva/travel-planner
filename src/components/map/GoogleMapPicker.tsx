import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useEffect, useState } from "react";

import { getLat, getLng } from "../../utils/mapUtils";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries: "places"[] = ["places"];

export default function GoogleMapPicker({
  onSelect,
  routes,
  activeRoute,
  selectedCity,
}: any) {
  const [center, setCenter] = useState({
    lat: 50.4501,
    lng: 30.5234,
  });

  const [directions, setDirections] = useState<any[]>([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (!activeRoute || !window.google) {
      setDirections([]);

      return;
    }

    const service = new google.maps.DirectionsService();

    const loadRoute = async () => {
      if (activeRoute.places.length < 2) return;

      try {
        const response = await service.route({
          origin: {
            lat: getLat(activeRoute.places[0]),
            lng: getLng(activeRoute.places[0]),
          },

          destination: {
            lat: getLat(activeRoute.places[activeRoute.places.length - 1]),

            lng: getLng(activeRoute.places[activeRoute.places.length - 1]),
          },

          waypoints: activeRoute.places.slice(1, -1).map((place: any) => ({
            location: {
              lat: getLat(place),

              lng: getLng(place),
            },

            stopover: true,
          })),

          travelMode: google.maps.TravelMode.DRIVING,
        });

        setDirections([response]);
      } catch (e) {
        console.log(e);
      }
    };

    loadRoute();
  }, [activeRoute]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onClick={(e) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();

        if (lat && lng) {
          onSelect(lat, lng);
        }
      }}
    >
      {selectedCity && (
        <Marker
          position={{
            lat: selectedCity.lat,
            lng: selectedCity.lng,
          }}
        />
      )}

      {activeRoute?.places.map((place: any, index: number) => (
        <Marker
          key={place.place_id}
          position={{
            lat: getLat(place),
            lng: getLng(place),
          }}
          label={{
            text: `${index + 1}`,
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,

            fillColor:
              activeRoute.type === "history"
                ? "#ec4899"
                : activeRoute.type === "nature"
                  ? "#22c55e"
                  : "#f59e0b",

            fillOpacity: 1,

            strokeColor: "white",

            strokeWeight: 2,

            scale: 12,
          }}
        />
      ))}

      {directions.map((direction, index) => (
        <DirectionsRenderer
          key={index}
          directions={direction}
          options={{
            suppressMarkers: true,

            polylineOptions: {
              strokeColor: "#ff006e",

              strokeOpacity: 0.95,

              strokeWeight: 6,
            },
          }}
        />
      ))}
    </GoogleMap>
  );
}
