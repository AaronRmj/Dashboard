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

  //demarrer la simulation de livraison
  const simulate = () => {

    //tsy simulena ra tsisy depart sy arrivé
    if (!start || !end) return null;
      setIsDelivering(true);
      setCurrentPosition(start); //position initiale

      //manisy pts 50 entre a et b 
      const steps = calculateSteps(start, end, 50);
      let step = 0; 

      function animate(){
        if (step < steps.length){
          setCurrentPosition(steps[step]); //deplace le marqueur a la position suivante du tab steps
          step++;
          animationRef.current = requestAnimationFrame(animate); 
        }
        else {
          setIsDelivering(false);
        } 
      }
      //recursive ilay animation
      animationRef.current = requestAnimationFrame(animate)

    }

    //definir calculate steps
    function calculateSteps(start, end, numSteps){

      const steps = []; //ho fenoina ity

      for (let i = 0; i <= numSteps; i++){

        const ratio = i / numSteps; //pourcentage fandeany

        steps.push({
          //mitady anle lat sy lng manaraka refa anaty animation
          lat:  start.lat + (end.lat - start.lat) * ratio,
          lng:  start.lng + (end.lng - start.lng) * ratio,
        })
      }

      return steps;
   
    }

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
        <div>
            <Button 
                onClick={simulate}
                label='Simuler livraison'
                className="w-30"
            />
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