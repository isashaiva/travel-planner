import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const center = {
  lat: 48.3794,
  lng: 31.1656,
};

const containerStyle = {
  width: "100%",
  height: "500px",
};

type Props = {
  onSelect: (coords: { lat: number; lng: number }) => void;
};

export default function CityMap({ onSelect }: Props) {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onClick={(e) => {
          if (!e.latLng) return;

          onSelect({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}
