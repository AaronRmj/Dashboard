import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Location() {
  return (
    <section className="h-screen w-full rounded-lg">
      <h1 className="text-center text-3xl">Localisez votre mission</h1>
      <MapContainer
        center={[-18.8792, 47.5079]} // Position centrée
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Fond de carte */}
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marqueur avec label au clic */}
        <Marker position={[-18.8792, 47.5079]}>
          <Popup>📍 Ici se trouve votre mission</Popup>
        </Marker>
      </MapContainer>
    </section>
  );
}
