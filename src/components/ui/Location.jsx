import { MapContainer, TileLayer, Marker, Popup, useMap , useMapEvents } from "react-leaflet";
import {useState, useEffect} from "react";
import { marker } from "leaflet";

function ClickHandler({ setStart, setEnd, start, end }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      if (!start) {
        setStart({ lat, lng });
      } else if (!end) {
        setEnd({ lat, lng });
      } else {
        setStart(null);
        setEnd(null);
      }
    },
  });

  return null; // Ce composant n'affiche rien, il ne fait qu'écouter les clics
}

export default function Location() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

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

        {/* Gestion du clic */}
        <ClickHandler setStart={setStart} setEnd={setEnd} start={start} end={end} />

        {/* Point de départ */}
        {start && (
          <Marker position={[start.lat, start.lng]}>
            <Popup>📍Point de départ</Popup>
          </Marker>
        )}

        {/* Point d'arrivée */}
        {end && (
          <Marker position={[end.lat, end.lng]}>
            <Popup>📍Point d'arrivée</Popup>
          </Marker>
        )}
      </MapContainer>
    </section>
  );
}
