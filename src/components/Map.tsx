import { useEffect, useRef, useState } from 'react';

interface MapProps {
  center: google.maps.LatLngLiteral;
  markers: Array<{
    position: google.maps.LatLngLiteral;
    title: string;
    type: 'home' | 'school' | 'hospital' | 'highway';
  }>;
  onLoad?: (map: google.maps.Map) => void;
}

const Map = ({ center, markers, onLoad }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });
          
          if (onLoad) {
            onLoad(mapInstanceRef.current);
          }
        }
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(({ position, title, type }) => {
      const icon = {
        home: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        },
        school: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#10b981">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
        hospital: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444">
              <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
        highway: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.1.9-2 2-2h14v4h3zM8 6H4v5h4V6zm9 0h-5v5h5V6z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
      };

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title,
        icon: icon[type],
      });

      markersRef.current.push(marker);
    });

    // Adjust bounds to fit all markers
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.position));
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [isLoaded, markers]);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center, isLoaded]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
  );
};

export default Map;
