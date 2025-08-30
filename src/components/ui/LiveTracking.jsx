import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet"
import { useMap } from "react-leaflet";

const livreurIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
const LiveTracking = () =>{
    //etat position livreur
    const [livreurPosition, setlivreurPosition] = useState(null);
    //etat status connexion websocket
    const [isConnected, setIsConnected] = useState(null);
    const map = useMap();

    //connexion au websocket
    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:8080');

        //refa misokatra
        ws.onopen = () =>{
            console.log("Connecté au serveur");
            setIsConnected(true);
        }

        //refa maazo message
        ws.onmessage = (event) =>{
            try{
                //avadika json lony le message
                const data = JSON.parse(event.data);

                //si c est une MAJ position
                if(data.type === "position-update"){
                    setlivreurPosition(data.position);
                    
                    //center la carte sur le livreur
                    map.setView([data.position.lat, data.position.lng], map.getZoom());
                }
            }
            catch(error){
                console.error("Erreur de message", error);
            }
        }

        //refa erreur
        ws.onerror = (error) =>{
            console.error("Erreur de connexion", error);
            setIsConnected(false);
        };


        //refa miquitte
        ws.onclose = () =>{
            console.log("Déconnecté !");
            setIsConnected(false);
        }

        //fermer la connexion
        return () => ws.close();
    },[map])   //exectuer une fois si sans 2e argument, executer isaky ny miova ilay map
    
    //ne rien afficher si aucune position
    if (!livreurPosition) return null;

    return(
        <Marker icon={livreurIcon} position={[position.lat, position.lng]}>
            <Popup >
                Livreur en cours...
                Position: {position.lat.toFixed(6)}, {position.lng.toFixed(6)} <br />
                Precision: {Math.round(position.accuracy)} mètres <br />
                Status: {isConnected ? "Connected" : "Disconnected"}
            </Popup>
        </Marker>
            

        
        
    )
    
}

export default LiveTracking