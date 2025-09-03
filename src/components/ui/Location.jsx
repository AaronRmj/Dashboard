import { MapContainer, TileLayer, Marker, Popup, useMap , useMapEvents } from "react-leaflet";
import {useState, useEffect, useRef} from "react";
import Itineraire from "./Itineraire";
// import LiveTracking from "./LiveTracking";
import Button from "./Button"

//refa miclique
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
  const [isDelivering, setIsDelivering] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const animationRef = useRef(null);
  const routePointsRef = useRef([]); // Pour stocker les points de l'itinéraire

  //demarrer la simulation de livraison
  const simulate = () => {
    if (!start || !end) return null;

    // Récupérer l'itinéraire actuel depuis leaflet-routing-machine
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ]
    });

    routingControl.route();

    routingControl.on('routesfound', (e) => {
      const coordinates = e.routes[0].coordinates;
      routePointsRef.current = coordinates;
      
      setIsDelivering(true);
      setCurrentPosition({ lat: coordinates[0].lat, lng: coordinates[0].lng });

      let step = 0;
      const totalSteps = coordinates.length;

      function animate() {
        if (step < totalSteps) {
          setCurrentPosition({
            lat: coordinates[step].lat,
            lng: coordinates[step].lng
          });
          step++;
          animationRef.current = setTimeout(()=> {
            requestAnimationFrame(animate);
          }, 2000); // contrôle la vitesse ici (100ms entre chaque point)
        } else {
          setIsDelivering(false);
          setCurrentPosition(null);
          setStart(null);
          setEnd(null);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    });
  };

    useEffect(()=>{
      return () =>{
        //quand le composant meurt
        if (animationRef.current){

          //annuler animation en cours
          cancelAnimationFrame(animationRef.current)
        }
      }
    }, [])
    
  return (
    <section className="h-screen w-full rounded-lg">
      {start && end &&(
          <div className="text-center">
            <p>Départ: {start.lat.toFixed(4)}, {start.lng.toFixed(4)}</p>
            <p>Arrivée: {end.lat.toFixed(4)}, {end.lng.toFixed(4)}</p>
          </div>
      )}

      {isDelivering && (
          <p className="text-lg">Livraison en cours... </p>
      )}

      {start && end && !isDelivering &&(
        <div className="text-center mb-2">
            <button onClick={simulate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Demarrer suivi
            </button>
        </div>
      )}

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

        {/* <LiveTracking /> */}

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

        {currentPosition && (
          <Marker position={[currentPosition.lat, currentPosition.lng]}>
            <Popup>Livreur en mouvement</Popup>
          </Marker>
        )}
        
        {start && end && ( //itineraire ra misy start et end
            <Itineraire start={start} end={end} />
        )}

      </MapContainer>
    </section>
  );
}