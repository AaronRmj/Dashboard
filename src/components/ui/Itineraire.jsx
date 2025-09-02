import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';

const Itineraire = ({ start, end }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    // remove previous control if present
    if (routingControlRef.current) {
      try { map.removeControl(routingControlRef.current); } catch (e) { /* ignore */ }
      routingControlRef.current = null;
    }

    let mounted = true;

    (async () => {
      try {
        // dynamic import avoids Vite CJS/ESM resolution issues
        await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');
        await import('leaflet-routing-machine'); // attaches Routing to global L

        if (!mounted) return;

        routingControlRef.current = L.Routing.control({
          waypoints: [
            L.latLng(start.lat, start.lng),
            L.latLng(end.lat, end.lng)
          ],
          routeWhileDragging: true,
          lineOptions: {
            styles: [{
              color: '#4285f4',
              weight: 5,
              opacity: 0.9
            }]
          },
          showAlternatives: false,
          draggableWaypoints: true,
          fitSelectedRoutes: true
        }).addTo(map);
      } catch (error) {
        console.error('Erreur lors de la création d\'itinéraire', error);
      }
    })();

    return () => {
      mounted = false;
      if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (e) { /* ignore */ }
        routingControlRef.current = null;
      }
    };
  }, [map, start, end]);

  return null;
};

export default Itineraire;