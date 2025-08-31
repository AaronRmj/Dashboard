import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';


const Itineraire = ({start, end}) =>{
    //recuperer l'instance de la carte
    const map = useMap();
    const routingControlRef = useRef(null);
    useEffect(()=>{
      
        //ne rien faire si il n y a pas d arrive ni de depart
        if(!start || !end) return; 

        //est ce qu il y a deja un itineraire
        if(routingControlRef.current){
          //fafana lony ny tableau alon ny anavona vaovao
          map.removeControl(routingControlRef.current)
        }

        //sinon ra mbola tsisy dia tonga dia manao

        try{
          //L c est l objet principale Leaflet
          routingControlRef.current = L.Routing.control({
          waypoints:[ //points de depart et arrivée
              L.latLng( start.lat, start.lng),
              L.latLng( end.lat, end.lng)
          ],
          //modifiaction par drag
          routeWhileDragging: true,
          lineOptions:{
              styles:[{
                  color: '#4285f4',
                  weight: 5,
                  opacity: 0.9
              }]
          },
          //une seule route
          showAlternatives: false,
          //points fixes
          
          draggableWayPoints: true,

          //zoom automatique
          fitSelectedRoutes: true

      }).addTo(map);
      }
        catch(error){
          console.error("Erreur lors de la création d'itinéraire", error);
        }

      //nettoyage si le composant est detruit
      
      return () =>{
        if (routingControlRef.current){
          map.removeControl(routingControlRef.current)
        }
      };
  },[map, start, end]) //ra miova reto dia recharger ny page

      return null;

}
export default Itineraire