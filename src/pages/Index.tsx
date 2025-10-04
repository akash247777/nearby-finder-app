import { useState } from 'react';
import Map from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import ResultsList, { PlaceResult } from '@/components/ResultsList';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Index = () => {
  const [homeLocation, setHomeLocation] = useState<google.maps.LatLngLiteral>({
    lat: 40.7128,
    lng: -74.0060,
  });
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const searchNearbyPlaces = async (
    address: string,
    location: google.maps.LatLngLiteral
  ) => {
    setHomeLocation(location);
    setIsSearching(true);
    setResults([]);

    try {
      const service = new google.maps.places.PlacesService(mapInstance || document.createElement('div'));
      
      const searchPromises = [
        searchPlacesByType(service, location, 'school', 'school'),
        searchPlacesByType(service, location, 'hospital', 'hospital'),
        searchPlacesByType(service, location, 'highway', 'highway'),
      ];

      const allResults = await Promise.all(searchPromises);
      const flatResults = allResults.flat();
      
      // Calculate distances and sort
      const resultsWithDistance = await Promise.all(
        flatResults.map(async (place) => {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(location),
            new google.maps.LatLng(place.location)
          );
          return { ...place, distance };
        })
      );

      resultsWithDistance.sort((a, b) => a.distance - b.distance);
      setResults(resultsWithDistance);
      
      toast.success(`Found ${resultsWithDistance.length} places nearby`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search nearby places');
    } finally {
      setIsSearching(false);
    }
  };

  const searchPlacesByType = (
    service: google.maps.places.PlacesService,
    location: google.maps.LatLngLiteral,
    keyword: string,
    type: 'school' | 'hospital' | 'highway'
  ): Promise<PlaceResult[]> => {
    return new Promise((resolve) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        radius: 5000,
        keyword: keyword === 'highway' ? 'highway exit' : keyword,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.slice(0, 10).map((place) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Address not available',
            distance: 0,
            type,
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            },
          }));
          resolve(places);
        } else {
          resolve([]);
        }
      });
    });
  };

  const markers = [
    {
      position: homeLocation,
      title: 'Your Home',
      type: 'home' as const,
    },
    ...results.map(result => ({
      position: result.location,
      title: result.name,
      type: result.type,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nearby Places Finder</h1>
              <p className="text-sm text-muted-foreground">
                Discover schools, hospitals, and highways near you
              </p>
            </div>
          </div>
          <SearchBar onSearch={searchNearbyPlaces} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Results Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="font-semibold text-lg mb-4">Nearby Places</h2>
              <ResultsList results={results} isLoading={isSearching} />
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-4 h-[600px]">
              <Map
                center={homeLocation}
                markers={markers}
                onLoad={setMapInstance}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
