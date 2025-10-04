import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, Hospital, Car, MapPin } from 'lucide-react';

export interface PlaceResult {
  name: string;
  address: string;
  distance: number;
  type: 'school' | 'hospital' | 'highway';
  location: google.maps.LatLngLiteral;
}

interface ResultsListProps {
  results: PlaceResult[];
  isLoading: boolean;
}

const ResultsList = ({ results, isLoading }: ResultsListProps) => {
  const groupedResults = {
    school: results.filter(r => r.type === 'school'),
    hospital: results.filter(r => r.type === 'hospital'),
    highway: results.filter(r => r.type === 'highway'),
  };

  const icons = {
    school: School,
    hospital: Hospital,
    highway: Car,
  };

  const colors = {
    school: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hospital: 'bg-red-50 text-red-700 border-red-200',
    highway: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Enter an address to find nearby places</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(groupedResults).map(([type, places]) => {
        const Icon = icons[type as keyof typeof icons];
        const title = type.charAt(0).toUpperCase() + type.slice(1) + 's';

        return (
          <Card key={type} className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {places.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {places.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No {title.toLowerCase()} found
                </p>
              ) : (
                places.map((place, index) => (
                  <Card 
                    key={`${place.name}-${index}`}
                    className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {place.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {place.address}
                      </p>
                      <Badge 
                        variant="outline"
                        className={`${colors[type as keyof typeof colors]} text-xs`}
                      >
                        {formatDistance(place.distance)}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ResultsList;
