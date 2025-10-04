import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch: (address: string, location: google.maps.LatLngLiteral) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && window.google.maps && inputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry?.location) {
            const formattedAddress = place.formatted_address || '';
            setAddress(formattedAddress);
            handleSearch(formattedAddress, {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          }
        });
      } else {
        setTimeout(initAutocomplete, 100);
      }
    };

    initAutocomplete();
  }, []);

  const handleSearch = async (searchAddress: string, location?: google.maps.LatLngLiteral) => {
    if (!searchAddress.trim()) return;

    setIsLoading(true);

    try {
      if (location) {
        onSearch(searchAddress, location);
      } else {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ address: searchAddress });
        
        if (result.results[0]?.geometry?.location) {
          const loc = result.results[0].geometry.location;
          onSearch(searchAddress, { lat: loc.lat(), lng: loc.lng() });
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(address);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter your home address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button 
          type="submit" 
          size="lg"
          disabled={isLoading || !address.trim()}
          className="px-6"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
