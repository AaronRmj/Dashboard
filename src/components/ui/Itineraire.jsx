import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';


const Itineraire = ({start, end}) =>{
    //recuperer l'instance de la carte
    const map = useMap();

    useEffect(()=>{
        //ne rien faire si il n y a pas d arrive ni de depart
        if(!start || !end) return; 

        //L c est l objet principale Leaflet
        const routingControl = L.Routing.control({
            waypoints:[ //points de depart et arrivée
                L.latLng( start.lat, start.lng),
                L.latLng( end.lat, end.lng)
            ],
            //modifiaction par drag
            routeWhileDragging: false,
            styles:[{color: '#4285F4', // Bleu Google exact
                weight: 8,        // TRÈS ÉPAIS - comme Google Maps
                opacity: 0.9,}],
            //une seule route
            showAlternatives: false,
            //points fixes
            draggableWapPoints: false,
            //zoom automatique
            fitSelectedRoutes: true
        }).addTo(map);

        //nettoyage si le composant est detruit
        return()=>{
            map.removeControl(routingControl);
        };
    },[map, start, end]) //ra miova reto dia recharger ny page
}
export default Itineraire